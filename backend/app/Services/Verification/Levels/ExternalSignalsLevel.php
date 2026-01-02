<?php

namespace App\Services\Verification\Levels;

use App\Models\Report;
use App\Models\User;
use App\Services\Verification\VerificationLevelResult;

class ExternalSignalsLevel extends BaseLevel
{
    public function run(Report $report, User $user, array $context = []): VerificationLevelResult
    {
        $services = $context['services'] ?? [];
        $notes = [];
        $signals = [];

        foreach ($services as $key => $service) {
            $enabled = (bool) ($service['enabled'] ?? false);
            $provider = $service['provider'] ?? null;
            $apiKey = $service['api_key'] ?? null;

            if (!$enabled) {
                $notes[] = "{$service['label']} disabled.";
                continue;
            }

            if (!$apiKey) {
                $notes[] = "{$service['label']} missing API key.";
                continue;
            }

            $signals[$key] = [
                'provider' => $provider,
                'status' => 'configured',
            ];
        }

        if (!$signals) {
            $notes[] = 'No external signals configured yet.';
        }

        return $this->result(0, $notes, $signals);
    }
}
