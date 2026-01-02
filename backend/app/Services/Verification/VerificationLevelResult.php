<?php

namespace App\Services\Verification;

class VerificationLevelResult
{
    public function __construct(
        public string $key,
        public string $label,
        public int $score,
        public int $maxScore,
        public array $notes = [],
        public array $signals = [],
    ) {
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'score' => $this->score,
            'max_score' => $this->maxScore,
            'notes' => $this->notes,
            'signals' => $this->signals,
        ];
    }
}
