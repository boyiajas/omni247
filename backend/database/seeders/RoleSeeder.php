<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrator',
                'key' => 'admin',
                'description' => 'Full platform access and configuration.',
                'color' => '#22c55e',
                'permissions' => [
                    'manage_users',
                    'manage_reports',
                    'manage_roles',
                    'view_audits',
                    'view_statistics',
                ],
                'is_default' => false,
            ],
            [
                'name' => 'Agency Manager',
                'key' => 'agency',
                'description' => 'Agency level management of assigned regions.',
                'color' => '#3b82f6',
                'permissions' => [
                    'view_reports',
                    'manage_alerts',
                    'view_statistics',
                ],
                'is_default' => false,
            ],
            [
                'name' => 'Moderator',
                'key' => 'moderator',
                'description' => 'Content moderation and verification.',
                'color' => '#f97316',
                'permissions' => [
                    'manage_reports',
                    'view_statistics',
                ],
                'is_default' => false,
            ],
            [
                'name' => 'Citizen Reporter',
                'key' => 'user',
                'description' => 'Default role for mobile users.',
                'color' => '#6366f1',
                'permissions' => [
                    'submit_reports',
                ],
                'is_default' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['key' => $role['key']], $role);
        }
    }
}
