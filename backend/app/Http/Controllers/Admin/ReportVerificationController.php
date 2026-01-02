<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Verification\VerificationSettings;
use Illuminate\Http\Request;

class ReportVerificationController extends Controller
{
    public function show(VerificationSettings $settings)
    {
        $levels = collect($settings->getLevelConfigs())
            ->map(fn ($config) => [
                'label' => $config['label'] ?? 'Unnamed',
                'max_score' => $config['max_score'] ?? 0,
            ])
            ->toArray();

        $tiers = collect($settings->getTierConfigs())
            ->map(fn ($config) => [
                'label' => $config['label'] ?? 'Unnamed',
                'auto_verify_score' => $config['auto_verify_score'] ?? 80,
                'review_score' => $config['review_score'] ?? 50,
                'levels' => $config['levels'] ?? [],
            ])
            ->toArray();

        return response()->json([
            'enabled' => $settings->isSystemEnabled(),
            'enabled_levels' => $settings->getEnabledLevels(),
            'enabled_tiers' => $settings->getEnabledTiers(),
            'default_tier' => $settings->getDefaultTier(),
            'levels' => $levels,
            'tiers' => $tiers,
            'services' => $settings->getServiceSettings(),
        ]);
    }

    public function update(Request $request, VerificationSettings $settings)
    {
        $validated = $request->validate([
            'enabled' => 'nullable|boolean',
            'enabled_levels' => 'nullable|array',
            'enabled_levels.*' => 'string',
            'enabled_tiers' => 'nullable|array',
            'enabled_tiers.*' => 'string',
            'default_tier' => 'nullable|string',
            'services' => 'nullable|array',
        ]);

        $levelKeys = array_keys($settings->getLevelConfigs());
        $tierKeys = array_keys($settings->getTierConfigs());

        if (array_key_exists('enabled', $validated)) {
            Setting::set('report_verification_enabled', (bool) $validated['enabled'], 'boolean', 'reports');
        }

        if (isset($validated['enabled_levels'])) {
            $filtered = array_values(array_intersect($validated['enabled_levels'], $levelKeys));
            Setting::set('report_verification_levels', $filtered, 'json', 'reports');
        }

        if (isset($validated['enabled_tiers'])) {
            $filtered = array_values(array_intersect($validated['enabled_tiers'], $tierKeys));
            Setting::set('report_verification_tiers', $filtered, 'json', 'reports');
        }

        if (isset($validated['default_tier']) && in_array($validated['default_tier'], $tierKeys, true)) {
            Setting::set('report_verification_default_tier', $validated['default_tier'], 'string', 'reports');
        }

        if (isset($validated['services'])) {
            $serviceDefaults = $settings->getServiceSettings();
            $payload = [];

            foreach ($serviceDefaults as $key => $default) {
                $incoming = $validated['services'][$key] ?? [];

                $payload[$key] = [
                    'enabled' => (bool) ($incoming['enabled'] ?? $default['enabled']),
                    'provider' => $incoming['provider'] ?? $default['provider'],
                    'api_key' => $incoming['api_key'] ?? $default['api_key'],
                ];
            }

            Setting::set('report_verification_services', $payload, 'json', 'reports');
        }

        return $this->show($settings);
    }
}
