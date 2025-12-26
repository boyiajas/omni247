<?php

namespace App\Services;

use App\Models\User;
use App\Models\Achievement;

class AchievementService
{
    /**
     * Check and award achievements for a user based on trigger event
     */
    public function checkAndAwardAchievements(User $user, string $trigger, array $context = [])
    {
        switch ($trigger) {
            case 'report_created':
                $this->checkFirstReport($user);
                $this->checkEmergencyResponder($user, $context);
                break;
            
            case 'report_verified':
                $this->checkVerifiedReporter($user);
                $this->checkTopContributor($user);
                break;
            
            case 'points_updated':
                $this->checkTierAchievements($user);
                break;
            
            case 'comment_received':
                $this->checkCommunityLeader($user);
                break;
        }
    }

    /**
     * Award "First Report" achievement
     */
    private function checkFirstReport(User $user)
    {
        $reportsCount = $user->reports()->count();
        
        if ($reportsCount >= 1) {
            $this->awardAchievement($user, 'first_report');
        }
    }

    /**
     * Award "Verified Reporter" achievement (5 verified reports)
     */
    private function checkVerifiedReporter(User $user)
    {
        $verifiedCount = $user->reports()->where('status', 'verified')->count();
        
        if ($verifiedCount >= 5) {
            $this->awardAchievement($user, 'verified_reporter');
        }
    }

    /**
     * Award "Top Contributor" achievement (20+ verified reports)
     */
    private function checkTopContributor(User $user)
    {
        $verifiedCount = $user->reports()->where('status', 'verified')->count();
        
        if ($verifiedCount >= 20) {
            $this->awardAchievement($user, 'top_contributor');
        }
    }

    /**
     * Award "Emergency Responder" achievement (5 emergency reports)
     */
    private function checkEmergencyResponder(User $user, array $context)
    {
        $emergencyCount = $user->reports()->where('is_emergency', true)->count();
        
        if ($emergencyCount >= 5) {
            $this->awardAchievement($user, 'emergency_responder');
        }
    }

    /**
     * Award "Community Leader" achievement (100+ comments received)
     */
    private function checkCommunityLeader(User $user)
    {
        // Count total comments on user's reports
        $commentsCount = \App\Models\Comment::whereIn('report_id', 
            $user->reports()->pluck('id')
        )->count();
        
        if ($commentsCount >= 100) {
            $this->awardAchievement($user, 'community_leader');
        }
    }

    /**
     * Check and award tier achievements based on points
     */
    private function checkTierAchievements(User $user)
    {
        $points = $user->total_points ?? 0;

        $tierAchievements = [
            'bronze_tier' => 100,
            'silver_tier' => 501,
            'gold_tier' => 1001,
            'platinum_tier' => 2001,
            'diamond_tier' => 5001,
        ];

        foreach ($tierAchievements as $key => $threshold) {
            if ($points >= $threshold) {
                $this->awardAchievement($user, $key);
            }
        }
    }

    /**
     * Award an achievement to a user if they don't already have it
     */
    private function awardAchievement(User $user, string $achievementKey)
    {
        $achievement = Achievement::where('key', $achievementKey)
            ->where('is_active', true)
            ->first();

        if (!$achievement) {
            return;
        }

        // Check if user already has this achievement
        if ($achievement->isEarnedBy($user)) {
            return;
        }

        // Award the achievement
        $user->achievements()->attach($achievement->id, [
            'earned_at' => now(),
        ]);

        // TODO: Send notification to user about the achievement
        // You could dispatch an event here or send a push notification
    }
}
