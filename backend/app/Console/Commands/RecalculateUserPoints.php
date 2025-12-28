<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AchievementService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateUserPoints extends Command
{
    protected $signature = 'points:recalculate-verified';
    protected $description = 'Recalculate user points and rewards based only on verified reports';

    public function handle()
    {
        $achievementService = app(AchievementService::class);
        $users = User::with(['reports', 'rewards'])->get();

        $this->info("Processing {$users->count()} users...");
        $progressBar = $this->output->createProgressBar($users->count());

        foreach ($users as $user) {
            DB::transaction(function () use ($user, $achievementService) {
                $user->rewards()
                    ->whereIn('reason', ['Report verified', 'Report created'])
                    ->delete();

                $verifiedReports = $user->reports()
                    ->where('is_verified', true)
                    ->get(['id', 'verified_at', 'updated_at']);

                $totalPoints = $verifiedReports->count() * 50;
                $user->update(['total_points' => $totalPoints]);

                foreach ($verifiedReports as $report) {
                    $timestamp = $report->verified_at ?? $report->updated_at ?? now();
                    $user->rewards()->create([
                        'report_id' => $report->id,
                        'type' => 'achievement',
                        'points' => 50,
                        'reason' => 'Report verified',
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ]);
                }

                $achievementService->checkAndAwardAchievements($user, 'points_updated');
            });

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('✓ Points recalculated successfully!');

        return 0;
    }
}
