<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(Role::withCount('users')->orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:50|unique:roles,key',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create($data);
        AuditLogger::log($request->user(), 'admin.roles.create', 'Created role '.$role->key, $role, $data, $request);

        return response()->json($role, 201);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'permissions' => 'nullable|array',
        ]);

        $role->update($data);
        AuditLogger::log($request->user(), 'admin.roles.update', 'Updated role '.$role->key, $role, $data, $request);

        return response()->json($role);
    }

    public function destroy(Request $request, Role $role)
    {
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a role that is currently assigned to users.',
            ], 422);
        }

        $role->delete();
        AuditLogger::log($request->user(), 'admin.roles.delete', 'Deleted role '.$role->key, $role, [], $request);

        return response()->json(['message' => 'Role deleted']);
    }
}
