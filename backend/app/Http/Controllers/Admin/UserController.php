<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roleModel')
            ->withCount(['reports', 'devices', 'achievements'])
            ->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->query('per_page', 15);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role_id' => 'nullable|exists:roles,id',
            'phone' => 'nullable|string',
        ]);

        $role = isset($validated['role_id']) ? Role::find($validated['role_id']) : Role::where('key', 'user')->first();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => $role?->key ?? 'user',
            'role_id' => $role?->id,
            'status' => 'active',
            'has_completed_onboarding' => true,
        ]);

        AuditLogger::log($request->user(), 'admin.users.create', 'Created user '.$user->email, $user, [], $request);

        return response()->json($user->fresh('roleModel'), 201);
    }

    public function show(User $user)
    {
        $user->load([
            'roleModel',
            'devices' => fn ($query) => $query->orderByDesc('last_active_at'),
            'reports' => fn ($query) => $query->latest()->take(5),
            'achievements' => fn ($query) => $query->orderBy('earned_at', 'desc'),
        ]);

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'reputation_score' => 'nullable|integer',
            'total_points' => 'nullable|integer',
        ]);

        $user->update($validated);

        AuditLogger::log($request->user(), 'admin.users.update', 'Updated user '.$user->email, $user, $validated, $request);

        return response()->json($user->fresh('roleModel'));
    }

    public function updateStatus(Request $request, User $user)
    {
        $data = $request->validate([
            'status' => 'required|string|in:active,suspended,pending',
        ]);

        $user->update(['status' => $data['status']]);

        AuditLogger::log($request->user(), 'admin.users.status', 'Changed status for '.$user->email, $user, $data, $request);

        return response()->json($user);
    }

    public function updateRole(Request $request, User $user)
    {
        $data = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($data['role_id']);
        $user->assignRole($role);

        AuditLogger::log($request->user(), 'admin.users.role', 'Updated role for '.$user->email, $user, ['role' => $role->key], $request);

        return response()->json($user->fresh('roleModel'));
    }
}
