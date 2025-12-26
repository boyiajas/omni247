<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            [
                'key' => 'app_name',
                'value' => 'G-iReport',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Application name displayed throughout the system',
            ],
            [
                'key' => 'app_tagline',
                'value' => 'Community-driven incident reporting',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Application tagline or description',
            ],
            [
                'key' => 'contact_email',
                'value' => 'contact@gireport.com',
                'type' => 'string',
                'group' => 'general',
                'description' => 'General contact email address',
            ],
            [
                'key' => 'support_email',
                'value' => 'support@gireport.com',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Support email address for user inquiries',
            ],

            // Notification Settings
            [
                'key' => 'email_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Enable or disable email notifications system-wide',
            ],
            [
                'key' => 'push_notifications_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Enable or disable push notifications system-wide',
            ],
            [
                'key' => 'sms_notifications_enabled',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Enable or disable SMS notifications system-wide',
            ],

            // Report Settings
            [
                'key' => 'auto_moderation_enabled',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'reports',
                'description' => 'Automatically moderate reports using AI/filters',
            ],
            [
                'key' => 'reports_require_approval',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'reports',
                'description' => 'Require admin approval before reports are published',
            ],
            [
                'key' => 'max_report_age_days',
                'value' => '90',
                'type' => 'number',
                'group' => 'reports',
                'description' => 'Maximum age in days before reports are archived',
            ],

            // System Settings
            [
                'key' => 'maintenance_mode',
                'value' => '0',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Put the application in maintenance mode',
            ],
            [
                'key' => 'registration_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Allow new user registrations',
            ],
            [
                'key' => 'anonymous_reports_enabled',
                'value' => '1',
                'type' => 'boolean',
                'group' => 'system',
                'description' => 'Allow users to submit reports anonymously',
            ],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
