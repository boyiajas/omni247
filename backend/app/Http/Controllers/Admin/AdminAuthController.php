<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    protected array $allowedRoles = ['admin', 'moderator', 'agency'];

    public function login(Request $request)
    {
        $this->ensureDefaultAccounts();

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('roleModel')->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (! in_array($user->role, $this->allowedRoles, true)) {
            throw ValidationException::withMessages([
                'email' => ['This account cannot access the dashboard.'],
            ]);
        }

        $user->forceFill([
            'last_active_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        $token = $user->createToken('dashboard')->plainTextToken;

        AuditLogger::log($user, 'admin.login', 'Dashboard login', null, [], $request);

        return response()->json([
            'token' => $token,
            'user' => $user,
            'permissions' => $user->roleModel?->permissions ?? [],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        AuditLogger::log($request->user(), 'admin.logout', 'Dashboard logout', null, [], $request);

        return response()->json(['message' => 'Logged out']);
    }

    protected function ensureDefaultAccounts(): void
    {
        if (! Schema::hasTable('roles') || ! Schema::hasTable('users')) {
            return;
        }

        $roles = [
            [
                'name' => 'Administrator',
                'key' => 'admin',
                'description' => 'Full access to the Omni command center.',
                'color' => '#22c55e',
                'permissions' => ['manage_users', 'manage_reports', 'manage_roles', 'view_audits', 'view_statistics'],
            ],
            [
                'name' => 'Moderator',
                'key' => 'moderator',
                'description' => 'Handles report moderation workflows.',
                'color' => '#f97316',
                'permissions' => ['manage_reports', 'view_statistics'],
            ],
            [
                'name' => 'Agency Manager',
                'key' => 'agency',
                'description' => 'Agency specific analytics and alerts.',
                'color' => '#0ea5e9',
                'permissions' => ['view_reports', 'manage_alerts'],
            ],
        ];

        $roleIds = [];

        foreach ($roles as $role) {
            $record = Role::updateOrCreate(
                ['key' => $role['key']],
                [
                    'name' => $role['name'],
                    'description' => $role['description'],
                    'color' => $role['color'],
                    'permissions' => $role['permissions'],
                ]
            );

            $roleIds[$role['key']] = $record->id;
        }

        $defaults = [
            [
                'name' => 'Platform Admin',
                'email' => 'admin@omni247.com',
                'role' => 'admin',
            ],
            [
                'name' => 'City Moderator',
                'email' => 'moderator@omni247.com',
                'role' => 'moderator',
            ],
            [
                'name' => 'Agency Supervisor',
                'email' => 'agency@omni247.com',
                'role' => 'agency',
            ],
        ];

        foreach ($defaults as $default) {
            User::updateOrCreate(
                ['email' => $default['email']],
                [
                    'name' => $default['name'],
                    'password' => Hash::make('password'),
                    'role' => $default['role'],
                    'role_id' => $roleIds[$default['role']] ?? null,
                    'status' => 'active',
                    'is_verified' => true,
                    'has_completed_onboarding' => true,
                ]
            );
        }
    }
}
