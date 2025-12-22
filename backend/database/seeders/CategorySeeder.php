<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Crime & Emergency',
                'slug' => 'crime',
                'icon' => 'shield-alert',
                'color' => '#DC2626',
                'description' => 'Crimes, thefts, assaults, and emergencies',
                'is_emergency' => true,
                'order' => 1,
            ],
            [
                'name' => 'Accidents',
                'slug' => 'accident',
                'icon' => 'car-brake-alert',
                'color' => '#EA580C',
                'description' => 'Traffic accidents, collisions, and road incidents',
                'is_emergency' => true,
                'order' => 2,
            ],
            [
                'name' => 'Events & Celebrations',
                'slug' => 'event',
                'icon' => 'party-popper',
                'color' => '#8B5CF6',
                'description' => 'Public events, celebrations, and gatherings',
                'is_emergency' => false,
                'order' => 3,
            ],
            [
                'name' => 'Environment',
                'slug' => 'environment',
                'icon' => 'leaf',
                'color' => '#059669',
                'description' => 'Pollution, waste, environmental hazards',
                'is_emergency' => false,
                'order' => 4,
            ],
            [
                'name' => 'Politics',
                'slug' => 'politics',
                'icon' => 'account-tie',
                'color' => '#0284C7',
                'description' => 'Political rallies, protests, civic activities',
                'is_emergency' => false,
                'order' => 5,
            ],
            [
                'name' => 'Infrastructure',
                'slug' => 'infrastructure',
                'icon' => 'road',
                'color' => '#78716C',
                'description' => 'Road damage, utility issues, public infrastructure',
                'is_emergency' => false,
                'order' => 6,
            ],
            [
                'name' => 'Other',
                'slug' => 'other',
                'icon' => 'alert-circle',
                'color' => '#6B7280',
                'description' => 'Other incidents and reports',
                'is_emergency' => false,
                'order' => 99,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
