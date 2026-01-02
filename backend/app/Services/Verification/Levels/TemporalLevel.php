<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class TemporalLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        if ($report->latitude === null || $report->longitude === null) {
            return $this->result(0, ['Missing report coordinates for temporal clustering.']);
        }

        $query = Report::query()
            ->where('id', '!=', $report->id)
            ->where('created_at', '>=', now()->subHours(3));

        $nearbyCount = $query
            ->nearby($report->latitude, $report->longitude, 2)
            ->count();

        $score = match (true) {
            $nearbyCount >= 3 => 10,
            $nearbyCount >= 2 => 7,
            $nearbyCount >= 1 => 4,
            default => 0,
        };

        $notes = ["Nearby reports in 3 hours: {$nearbyCount}"];

        return $this->result($score, $notes);
    }
}
