<?php

namespace App\Services\Verification;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\Levels\VerificationLevelInterface;

class VerificationPipeline
{
    public function __construct(private VerificationSettings $settings)
    {
    }

    public function run(Report $report): VerificationResult
    {
        $user = $report->user;

        if (!$user instanceof User) {
            return new VerificationResult(0, 0, $this->settings->getDefaultTier(), 'pending', [], ['Missing reporter.']);
        }

        $tier = $this->settings->resolveUserTier($user);
        $enabledLevels = $this->settings->resolveUserLevels($user, $tier);
        $levelConfigs = $this->settings->getLevelConfigs();
        $levels = [];
        $totalScore = 0;
        $maxScore = 0;

        foreach ($enabledLevels as $levelKey) {
            if (!isset($levelConfigs[$levelKey])) {
                continue;
            }

            $config = $levelConfigs[$levelKey];
            $class = $config['class'] ?? null;
            $label = $config['label'] ?? $levelKey;
            $max = (int) ($config['max_score'] ?? 0);

            if (!$class || !class_exists($class)) {
                $levels[] = [
                    'key' => $levelKey,
                    'label' => $label,
                    'score' => 0,
                    'max_score' => $max,
                    'notes' => ['Level class missing.'],
                    'signals' => [],
                ];
                $maxScore += $max;
                continue;
            }

            $instance = new $class($levelKey, $label, $max);
            if (!$instance instanceof VerificationLevelInterface) {
                continue;
            }

            $result = $instance->run($report, $user, [
                'services' => $this->settings->getServiceSettings(),
            ]);

            $levels[] = $result->toArray();
            $totalScore += $result->score;
            $maxScore += $result->maxScore;
        }

        if ($maxScore === 0) {
            return new VerificationResult(0, 0, $tier, 'pending', $levels, ['No enabled verification levels.']);
        }

        $tierConfig = $this->settings->getTierConfigs()[$tier] ?? null;
        $autoVerifyScore = (int) ($tierConfig['auto_verify_score'] ?? 80);
        $reviewScore = (int) ($tierConfig['review_score'] ?? 50);

        $status = match (true) {
            $totalScore >= $autoVerifyScore => 'verified',
            $totalScore >= $reviewScore => 'pending',
            default => 'rejected',
        };

        return new VerificationResult($totalScore, $maxScore, $tier, $status, $levels);
    }
}
