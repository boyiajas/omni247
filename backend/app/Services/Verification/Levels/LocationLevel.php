<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class LocationLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $notes = [];
        $reportLat = $this->normalizeCoord($report->latitude);
        $reportLng = $this->normalizeCoord($report->longitude);
        $submitterLat = $this->normalizeCoord($report->submitter_latitude);
        $submitterLng = $this->normalizeCoord($report->submitter_longitude);

        if ($reportLat === null || $reportLng === null || $submitterLat === null || $submitterLng === null) {
            $notes[] = 'Missing report or submitter coordinates.';
            return $this->result(0, $notes);
        }

        if (!$this->coordsValid($reportLat, $reportLng) || !$this->coordsValid($submitterLat, $submitterLng)) {
            $notes[] = 'Invalid coordinates supplied.';
            return $this->result(0, $notes);
        }

        $distance = $this->calculateDistanceKm($reportLat, $reportLng, $submitterLat, $submitterLng);
        $notes[] = 'Distance between report and submitter: ' . number_format($distance, 2) . ' km';

        $score = match (true) {
            $distance <= 0.5 => 20,
            $distance <= 2 => 15,
            $distance <= 5 => 10,
            $distance <= 10 => 5,
            default => 0,
        };

        if ($report->submitter_accuracy !== null) {
            $accuracy = (float) $report->submitter_accuracy;
            if ($accuracy <= 50) {
                $score += 2;
                $notes[] = 'High GPS accuracy.';
            } elseif ($accuracy <= 100) {
                $score += 1;
                $notes[] = 'Moderate GPS accuracy.';
            } else {
                $notes[] = 'Low GPS accuracy.';
            }
        }

        return $this->result($score, $notes, ['distance_km' => $distance]);
    }

    private function normalizeCoord($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        $floatValue = (float) $value;

        if (!is_finite($floatValue)) {
            return null;
        }

        return $floatValue;
    }

    private function coordsValid(float $lat, float $lng): bool
    {
        return $lat >= -90 && $lat <= 90 && $lng >= -180 && $lng <= 180;
    }

    private function calculateDistanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
