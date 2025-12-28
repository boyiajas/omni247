<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AchievementService;
use Illuminate\Console\Command;

class AwardAchievements extends Command
{
    protected $signature = 'achievements:award-all';
    protected $description = 'Award achievements to all users based on their current stats';

    public function handle()
    {
        $achievementService = app(AchievementService::class);
        $users = User::with(['reports', 'achievements'])->get();

        $this->info("Processing {$users->count()} users...");
        $progressBar = $this->output->createProgressBar($users->count());

        foreach ($users as $user) {
            // Check tier achievements based on points
            $achievementService->checkAndAwardAchievements($user, 'points_updated');

            // Check for first verified report
            if ($user->reports()->where('is_verified', true)->count() >= 1) {
                $achievementService->checkAndAwardAchievements($user, 'report_verified', []);
            }

            // Check for verified reporter (5+ verified reports)
            $verifiedCount = $user->reports()->where('is_verified', true)->count();
            if ($verifiedCount >= 5) {
                $achievementService->checkAndAwardAchievements($user, 'report_verified', []);
            }

            // Check for emergency responder
            $emergencyCount = $user->reports()
                ->where('is_emergency', true)
                ->where('is_verified', true)
                ->count();
            if ($emergencyCount >= 5) {
                $achievementService->checkAndAwardAchievements($user, 'report_verified', ['emergency' => true]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('✓ Achievements awarded successfully!');

        return 0;
    }
}
