<?php

namespace App\Jobs;

use App\Models\Report;
use App\Services\Verification\VerificationPipeline;
use App\Services\Verification\VerificationSettings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class VerifyReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $reportId)
    {
    }

    public function handle(VerificationSettings $settings, VerificationPipeline $pipeline): void
    {
        $report = Report::with(['user', 'media', 'ratings', 'comments'])->find($this->reportId);

        if (!$report) {
            return;
        }

        $user = $report->user;

        if (!$user) {
            $report->update([
                'verification_status' => 'skipped',
                'verification_completed_at' => now(),
            ]);
            return;
        }

        if (!$settings->shouldRunForUser($user)) {
            $report->update([
                'verification_status' => 'disabled',
                'verification_completed_at' => now(),
            ]);
            return;
        }

        $report->update([
            'verification_started_at' => now(),
            'verification_status' => 'processing',
            'verification_tier' => $settings->resolveUserTier($user),
        ]);

        try {
            $result = $pipeline->run($report);
        } catch (\Throwable $e) {
            Log::error('Report verification failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
            ]);

            $report->update([
                'verification_status' => 'failed',
                'verification_completed_at' => now(),
            ]);
            return;
        }

        if ($result->status === 'verified') {
            if (!$report->is_verified) {
                $report->markAsVerified();
            } else {
                $report->update([
                    'status' => 'verified',
                    'verified_at' => $report->verified_at ?? now(),
                ]);
            }
        } elseif ($result->status === 'rejected') {
            $report->update([
                'status' => 'rejected',
                'is_verified' => false,
                'verified_at' => null,
            ]);
        } else {
            $report->update([
                'status' => 'pending',
            ]);
        }

        $report->update([
            'verification_score' => $result->score,
            'verification_breakdown' => $result->levels,
            'verification_status' => $result->status,
            'verification_tier' => $result->tier,
            'verification_completed_at' => now(),
        ]);
    }
}
