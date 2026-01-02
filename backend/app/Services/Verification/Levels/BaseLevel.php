<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

abstract class BaseLevel implements VerificationLevelInterface
{
    public function __construct(
        protected string $levelKey,
        protected string $levelLabel,
        protected int $levelMaxScore,
    ) {
    }

    public function key(): string
    {
        return $this->levelKey;
    }

    public function label(): string
    {
        return $this->levelLabel;
    }

    public function maxScore(): int
    {
        return $this->levelMaxScore;
    }

    protected function result(int $score, array $notes = [], array $signals = []): VerificationLevelResult
    {
        $score = max(0, min($this->levelMaxScore, $score));

        return new VerificationLevelResult(
            $this->levelKey,
            $this->levelLabel,
            $score,
            $this->levelMaxScore,
            $notes,
            $signals,
        );
    }

    abstract public function run(Report $report, User $user, array $context = []): VerificationLevelResult;
}
