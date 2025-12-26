<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            // Activity Achievements
            [
                'key' => 'first_report',
                'name' => 'First Report',
                'description' => 'Submit your first incident report',
                'icon' => 'star',
                'color' => '#FFD700',
                'type' => 'activity',
                'criteria' => ['reports_count' => 1],
                'points_required' => null,
                'is_active' => true,
            ],
            [
                'key' => 'verified_reporter',
                'name' => 'Verified Reporter',
                'description' => 'Get 5 reports verified',
                'icon' => 'check-decagram',
                'color' => '#059669',
                'type' => 'activity',
                'criteria' => ['verified_reports_count' => 5],
                'points_required' => null,
                'is_active' => true,
            ],
            [
                'key' => 'top_contributor',
                'name' => 'Top Contributor',
                'description' => 'Submit 20+ verified reports',
                'icon' => 'trophy',
                'color' => '#DC2626',
                'type' => 'activity',
                'criteria' => ['verified_reports_count' => 20],
                'points_required' => null,
                'is_active' => true,
            ],
            [
                'key' => 'emergency_responder',
                'name' => 'Emergency Responder',
                'description' => 'Submit 5 emergency reports',
                'icon' => 'ambulance',
                'color' => '#2563EB',
                'type' => 'activity',
                'criteria' => ['emergency_reports_count' => 5],
                'points_required' => null,
                'is_active' => true,
            ],
            [
                'key' => 'community_leader',
                'name' => 'Community Leader',
                'description' => 'Get 100+ comments on your reports',
                'icon' => 'account-group',
                'color' => '#7C3AED',
                'type' => 'activity',
                'criteria' => ['total_comments_received' => 100],
                'points_required' => null,
                'is_active' => true,
            ],

            // Tier Achievements
            [
                'key' => 'bronze_tier',
                'name' => 'Bronze Tier',
                'description' => 'Reach 100 points',
                'icon' => 'medal',
                'color' => '#CD7F32',
                'type' => 'tier',
                'criteria' => null,
                'points_required' => 100,
                'is_active' => true,
            ],
            [
                'key' => 'silver_tier',
                'name' => 'Silver Tier',
                'description' => 'Reach 501 points',
                'icon' => 'medal',
                'color' => '#C0C0C0',
                'type' => 'tier',
                'criteria' => null,
                'points_required' => 501,
                'is_active' => true,
            ],
            [
                'key' => 'gold_tier',
                'name' => 'Gold Tier',
                'description' => 'Reach 1001 points',
                'icon' => 'medal',
                'color' => '#FFD700',
                'type' => 'tier',
                'criteria' => null,
                'points_required' => 1001,
                'is_active' => true,
            ],
            [
                'key' => 'platinum_tier',
                'name' => 'Platinum Tier',
                'description' => 'Reach 2001 points',
                'icon' => 'medal',
                'color' => '#E5E4E2',
                'type' => 'tier',
                'criteria' => null,
                'points_required' => 2001,
                'is_active' => true,
            ],
            [
                'key' => 'diamond_tier',
                'name' => 'Diamond Tier',
                'description' => 'Reach 5001 points',
                'icon' => 'medal',
                'color' => '#B9F2FF',
                'type' => 'tier',
                'criteria' => null,
                'points_required' => 5001,
                'is_active' => true,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['key' => $achievement['key']],
                $achievement
            );
        }
    }
}
