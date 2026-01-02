<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

interface VerificationLevelInterface
{
    public function key(): string;

    public function label(): string;

    public function maxScore(): int;

    public function run(Report $report, User $user, array $context = []): VerificationLevelResult;
}
