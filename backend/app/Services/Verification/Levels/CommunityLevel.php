<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class CommunityLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $commentsCount = $report->relationLoaded('comments')
            ? $report->comments->count()
            : $report->comments()->count();

        $ratingsCount = $report->relationLoaded('ratings')
            ? $report->ratings->count()
            : $report->ratings()->count();

        $score = 0;

        if ($commentsCount >= 3) {
            $score += 6;
        } elseif ($commentsCount >= 1) {
            $score += 3;
        }

        if ($ratingsCount >= 3) {
            $score += 4;
        } elseif ($ratingsCount >= 1) {
            $score += 2;
        }

        $notes = [
            "Comments: {$commentsCount}",
            "Ratings: {$ratingsCount}",
        ];

        return $this->result($score, $notes);
    }
}
