<?php

namespace App\Services\Verification;

class VerificationResult
{
    public function __construct(
        public int $score,
        public int $maxScore,
        public string $tier,
        public string $status,
        public array $levels,
        public array $notes = [],
    ) {
    }

    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'max_score' => $this->maxScore,
            'tier' => $this->tier,
            'status' => $this->status,
            'notes' => $this->notes,
            'levels' => $this->levels,
        ];
    }
}
