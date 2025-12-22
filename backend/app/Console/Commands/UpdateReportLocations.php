<?php

namespace App\Console\Commands;

use App\Models\Report;
use Illuminate\Console\Command;

class UpdateReportLocations extends Command
{
    protected $signature = 'reports:update-locations {--limit=0 : Limit number of reports to update}';

    protected $description = 'Assign fresh geolocations to reports so they are distributed across multiple cities';

    protected array $presets = [
        'crime' => ['lat' => 40.7128, 'lng' => -74.0060, 'radius' => 20], // NYC
        'accident' => ['lat' => 34.0522, 'lng' => -118.2437, 'radius' => 25], // LA
        'event' => ['lat' => 51.5072, 'lng' => -0.1276, 'radius' => 15], // London
        'environment' => ['lat' => 48.8566, 'lng' => 2.3522, 'radius' => 18], // Paris
        'politics' => ['lat' => 38.9072, 'lng' => -77.0369, 'radius' => 12], // DC
        'infrastructure' => ['lat' => 35.6762, 'lng' => 139.6503, 'radius' => 20], // Tokyo
        'other' => ['lat' => -33.8688, 'lng' => 151.2093, 'radius' => 25], // Sydney
    ];

    public function handle(): int
    {
        $limit = (int) $this->option('limit');
        $updated = 0;

        Report::with('category')->chunk(200, function ($reports) use (&$updated, $limit) {
            foreach ($reports as $report) {
                if ($limit && $updated >= $limit) {
                    return false; // stop chunking early
                }

                $preset = $this->presets[$report->category->slug ?? ''] ?? $this->randomPreset();
                [$lat, $lng] = $this->randomPoint($preset['lat'], $preset['lng'], $preset['radius']);

                $report->update([
                    'latitude' => $lat,
                    'longitude' => $lng,
                ]);

                $updated++;
            }
        });

        $this->info("Updated {$updated} reports with new coordinates.");

        return Command::SUCCESS;
    }

    protected function randomPreset(): array
    {
        $centers = [
            ['lat' => -1.2921, 'lng' => 36.8219, 'radius' => 15], // Nairobi
            ['lat' => 19.4326, 'lng' => -99.1332, 'radius' => 20], // Mexico City
            ['lat' => 55.7558, 'lng' => 37.6176, 'radius' => 18], // Moscow
            ['lat' => 52.5200, 'lng' => 13.4050, 'radius' => 16], // Berlin
        ];

        return $centers[array_rand($centers)];
    }

    protected function randomPoint(float $centerLat, float $centerLng, float $radiusKm): array
    {
        $radiusEarth = 6371; // km
        $radLat = deg2rad($centerLat);
        $radLng = deg2rad($centerLng);

        $distance = $radiusKm * sqrt(mt_rand() / mt_getrandmax());
        $bearing = 2 * M_PI * (mt_rand() / mt_getrandmax());

        $lat = asin(
            sin($radLat) * cos($distance / $radiusEarth) +
            cos($radLat) * sin($distance / $radiusEarth) * cos($bearing)
        );

        $lng = $radLng + atan2(
            sin($bearing) * sin($distance / $radiusEarth) * cos($radLat),
            cos($distance / $radiusEarth) - sin($radLat) * sin($lat)
        );

        return [rad2deg($lat), rad2deg($lng)];
    }
}
