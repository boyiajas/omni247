<?php

namespace App\Services\Verification;

use App\Models\Setting;
use App\Models\User;

class VerificationSettings
{
    public function isSystemEnabled(): bool
    {
        return (bool) Setting::get('report_verification_enabled', config('verification.enabled'));
    }

    public function getDefaultTier(): string
    {
        $default = (string) Setting::get('report_verification_default_tier', config('verification.default_tier'));

        return array_key_exists($default, $this->getTierConfigs()) ? $default : config('verification.default_tier');
    }

    public function getEnabledLevels(): array
    {
        $configured = array_keys($this->getLevelConfigs());
        $stored = Setting::get('report_verification_levels');

        if (!is_array($stored) || !$stored) {
            return $configured;
        }

        return array_values(array_intersect($stored, $configured));
    }

    public function getEnabledTiers(): array
    {
        $configured = array_keys($this->getTierConfigs());
        $stored = Setting::get('report_verification_tiers');

        if (!is_array($stored) || !$stored) {
            return $configured;
        }

        return array_values(array_intersect($stored, $configured));
    }

    public function resolveUserTier(User $user): string
    {
        $tier = $user->auto_verify_tier ?: $this->getDefaultTier();
        $enabledTiers = $this->getEnabledTiers();

        if (!in_array($tier, $enabledTiers, true)) {
            return $this->getDefaultTier();
        }

        return $tier;
    }

    public function resolveUserLevels(User $user, string $tier): array
    {
        $systemLevels = $this->getEnabledLevels();
        $tierLevels = $this->getTierConfigs()[$tier]['levels'] ?? [];
        $userLevels = is_array($user->auto_verify_levels) && $user->auto_verify_levels
            ? $user->auto_verify_levels
            : $tierLevels;

        return array_values(array_intersect($userLevels, $systemLevels));
    }

    public function getTierConfigs(): array
    {
        return config('verification.tiers', []);
    }

    public function getLevelConfigs(): array
    {
        return config('verification.levels', []);
    }

    public function getServiceSettings(): array
    {
        $defaults = config('verification.services', []);
        $stored = Setting::get('report_verification_services', []);
        $services = [];

        foreach ($defaults as $key => $service) {
            $providers = $service['providers'] ?? [];
            $storedConfig = is_array($stored) ? ($stored[$key] ?? []) : [];

            $services[$key] = [
                'label' => $service['label'] ?? $key,
                'providers' => $providers,
                'enabled' => (bool) ($storedConfig['enabled'] ?? false),
                'provider' => $storedConfig['provider'] ?? ($providers[0] ?? null),
                'api_key' => $storedConfig['api_key'] ?? '',
            ];
        }

        return $services;
    }

    public function shouldRunForUser(User $user): bool
    {
        return $this->isSystemEnabled() && (bool) $user->auto_verify_enabled;
    }
}
