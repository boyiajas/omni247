<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class ContentLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $titleLength = strlen(trim((string) $report->title));
        $descriptionLength = strlen(trim((string) $report->description));

        $score = 0;

        if ($descriptionLength >= 120) {
            $score += 7;
        } elseif ($descriptionLength >= 60) {
            $score += 5;
        } elseif ($descriptionLength >= 30) {
            $score += 3;
        }

        if ($titleLength >= 12) {
            $score += 3;
        } elseif ($titleLength >= 6) {
            $score += 1;
        }

        $notes = [
            "Title length: {$titleLength}",
            "Description length: {$descriptionLength}",
        ];

        return $this->result($score, $notes);
    }
}
