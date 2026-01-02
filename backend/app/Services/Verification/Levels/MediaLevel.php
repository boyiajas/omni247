<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class MediaLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $mediaItems = $report->relationLoaded('media') ? $report->media : $report->media()->get();
        $mediaCount = $mediaItems->count();
        $notes = [];

        if ($mediaCount === 0) {
            return $this->result(0, ['No media attached.']);
        }

        $score = $mediaCount >= 2 ? 15 : 10;
        $notes[] = "Media attached: {$mediaCount}";

        $hasVideo = $mediaItems->contains(fn ($item) => $item->type === 'video');
        if ($hasVideo) {
            $score += 3;
            $notes[] = 'Video evidence provided.';
        }

        $recentMedia = $mediaItems->firstWhere('created_at', '>=', $report->created_at?->copy()->subDay());
        if ($recentMedia) {
            $score += 2;
            $notes[] = 'Media captured within 24 hours of report.';
        }

        return $this->result($score, $notes);
    }
}
