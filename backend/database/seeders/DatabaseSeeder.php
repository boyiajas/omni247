<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
        ]);

        $adminRole = Role::where('key', 'admin')->first();
        $moderatorRole = Role::where('key', 'moderator')->first();
        $agencyRole = Role::where('key', 'agency')->first();

        User::factory()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@omni247.com',
            'role' => 'admin',
            'role_id' => $adminRole?->id,
            'status' => 'active',
            'is_verified' => true,
            'has_completed_onboarding' => true,
        ]);

        User::factory()->create([
            'name' => 'City Moderator',
            'email' => 'moderator@omni247.com',
            'role' => 'moderator',
            'role_id' => $moderatorRole?->id,
            'status' => 'active',
            'is_verified' => true,
            'has_completed_onboarding' => true,
        ]);

        User::factory()->create([
            'name' => 'Agency Supervisor',
            'email' => 'agency@omni247.com',
            'role' => 'agency',
            'role_id' => $agencyRole?->id,
            'status' => 'active',
            'is_verified' => true,
            'has_completed_onboarding' => true,
        ]);
    }
}
