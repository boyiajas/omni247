<?php

namespace App\Services;

use App\Models\User;

class PrivacyService
{
    /**
     * Get default privacy settings for new users
     */
    public static function getDefaultPrivacySettings(): array
    {
        return [
            'profile_visibility' => 'public', // public, friends_only, private
            'show_location' => true,
            'show_reports' => true,
            'show_achievements' => true,
            'allow_comments' => true,
            'default_report_privacy' => 'public', // public, anonymous, private
            'data_sharing' => [
                'analytics' => true,
                'marketing' => false,
                'research' => false,
            ],
        ];
    }

    /**
     * Validate privacy settings structure
     */
    public static function validatePrivacySettings(array $settings): bool
    {
        $validVisibilities = ['public', 'friends_only', 'private'];
        $validReportPrivacies = ['public', 'anonymous', 'private'];

        // Check profile visibility
        if (isset($settings['profile_visibility']) && !in_array($settings['profile_visibility'], $validVisibilities)) {
            return false;
        }

        // Check default report privacy
        if (isset($settings['default_report_privacy']) && !in_array($settings['default_report_privacy'], $validReportPrivacies)) {
            return false;
        }

        return true;
    }

    /**
     * Merge user settings with defaults
     */
    public static function mergeWithDefaults(?array $userSettings): array
    {
        $defaults = self::getDefaultPrivacySettings();
        
        if (!$userSettings) {
            return $defaults;
        }

        return array_merge($defaults, $userSettings);
    }

    /**
     * Check if viewer can see target user's profile
     */
    public static function canViewProfile(User $viewer, User $target): bool
    {
        $settings = self::mergeWithDefaults($target->privacy_settings);

        // Owner can always see their own profile
        if ($viewer->id === $target->id) {
            return true;
        }

        // Admins and moderators can see all profiles
        if (in_array($viewer->role, ['admin', 'moderator'])) {
            return true;
        }

        // Check visibility setting
        if ($settings['profile_visibility'] === 'private') {
            return false;
        }

        // TODO: Implement friends_only logic when friendship feature is added
        if ($settings['profile_visibility'] === 'friends_only') {
            return true; // For now, allow all
        }

        return true;
    }

    /**
     * Check if viewer can see target user's reports
     */
    public static function canViewReports(User $viewer, User $target): bool
    {
        $settings = self::mergeWithDefaults($target->privacy_settings);

        // Owner can always see their own reports
        if ($viewer->id === $target->id) {
            return true;
        }

        // Admins and moderators can see all reports
        if (in_array($viewer->role, ['admin', 'moderator'])) {
            return true;
        }

        // Check if reports are public
        return $settings['show_reports'] === true;
    }

    /**
     * Apply privacy filters to user data
     */
    public static function applyPrivacyFilters(User $user, ?User $viewer = null): array
    {
        $settings = self::mergeWithDefaults($user->privacy_settings);
        $userData = $user->toArray();

        // If no viewer or viewer is the user themselves, return full data
        if (!$viewer || $viewer->id === $user->id) {
            return $userData;
        }

        // Apply privacy filters based on settings
        if (!$settings['show_location']) {
            unset($userData['last_known_lat']);
            unset($userData['last_known_lng']);
            unset($userData['last_known_city']);
            unset($userData['last_known_country']);
            unset($userData['location_summary']);
        }

        if (!$settings['show_achievements']) {
            unset($userData['achievements']);
        }

        return $userData;
    }
}
