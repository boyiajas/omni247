<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class ReputationLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $score = 0;
        $notes = [];

        $accountAgeDays = $user->created_at ? $user->created_at->diffInDays(now()) : 0;
        if ($accountAgeDays >= 365) {
            $score += 10;
        } elseif ($accountAgeDays >= 180) {
            $score += 8;
        } elseif ($accountAgeDays >= 90) {
            $score += 6;
        } elseif ($accountAgeDays >= 30) {
            $score += 4;
        } elseif ($accountAgeDays >= 7) {
            $score += 2;
        } else {
            $score += 1;
        }

        $verifiedCount = $user->reports()->where('status', 'verified')->count();
        $rejectedCount = $user->reports()->where('status', 'rejected')->count();

        $score += min(10, $verifiedCount * 2);
        $score -= min(10, $rejectedCount * 2);

        $reputationScore = (int) ($user->reputation_score ?? 0);
        if ($reputationScore >= 500) {
            $score += 10;
        } elseif ($reputationScore >= 200) {
            $score += 6;
        } elseif ($reputationScore >= 100) {
            $score += 4;
        } elseif ($reputationScore >= 50) {
            $score += 2;
        }

        $notes[] = "Account age: {$accountAgeDays} days";
        $notes[] = "Verified reports: {$verifiedCount}";
        $notes[] = "Rejected reports: {$rejectedCount}";
        $notes[] = "Reputation score: {$reputationScore}";

        return $this->result($score, $notes);
    }
}
