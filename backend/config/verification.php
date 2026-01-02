<?php

return [
    'enabled' => env('REPORT_VERIFICATION_ENABLED', false),
    'default_tier' => 'basic',
    'tiers' => [
        'basic' => [
            'label' => 'Basic',
            'auto_verify_score' => 80,
            'review_score' => 50,
            'levels' => [
                'reputation',
                'location',
                'media',
                'content',
            ],
        ],
        'standard' => [
            'label' => 'Standard',
            'auto_verify_score' => 85,
            'review_score' => 55,
            'levels' => [
                'reputation',
                'location',
                'media',
                'temporal',
                'content',
                'community',
            ],
        ],
        'advanced' => [
            'label' => 'Advanced',
            'auto_verify_score' => 90,
            'review_score' => 60,
            'levels' => [
                'reputation',
                'location',
                'media',
                'temporal',
                'content',
                'community',
                'external_signals',
            ],
        ],
    ],
    'levels' => [
        'reputation' => [
            'label' => 'User reputation',
            'max_score' => 30,
            'class' => App\Services\Verification\Levels\ReputationLevel::class,
        ],
        'location' => [
            'label' => 'Location intelligence',
            'max_score' => 20,
            'class' => App\Services\Verification\Levels\LocationLevel::class,
        ],
        'media' => [
            'label' => 'Media authenticity',
            'max_score' => 20,
            'class' => App\Services\Verification\Levels\MediaLevel::class,
        ],
        'temporal' => [
            'label' => 'Temporal signals',
            'max_score' => 10,
            'class' => App\Services\Verification\Levels\TemporalLevel::class,
        ],
        'content' => [
            'label' => 'Content quality',
            'max_score' => 10,
            'class' => App\Services\Verification\Levels\ContentLevel::class,
        ],
        'community' => [
            'label' => 'Community validation',
            'max_score' => 10,
            'class' => App\Services\Verification\Levels\CommunityLevel::class,
        ],
        'external_signals' => [
            'label' => 'External data checks',
            'max_score' => 10,
            'class' => App\Services\Verification\Levels\ExternalSignalsLevel::class,
        ],
    ],
    'services' => [
        'vision' => [
            'label' => 'Image analysis',
            'providers' => ['google_vision', 'aws_rekognition'],
        ],
        'weather' => [
            'label' => 'Weather verification',
            'providers' => ['openweather', 'weatherapi'],
        ],
        'news' => [
            'label' => 'News cross-check',
            'providers' => ['newsapi', 'gnews'],
        ],
        'social' => [
            'label' => 'Social trends',
            'providers' => ['x', 'reddit'],
        ],
    ],
];
