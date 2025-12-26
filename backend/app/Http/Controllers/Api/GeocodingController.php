<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodingController extends Controller
{
    public function geocode(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|string',
        ]);

        $key = config('services.google.maps_key');
        if (!$key) {
            return response()->json([
                'latitude' => null,
                'longitude' => null,
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ]);
        }

        $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'address' => $validated['address'],
            'key' => $key,
        ]);

        if (!$response->ok()) {
            return response()->json([
                'latitude' => null,
                'longitude' => null,
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ], 502);
        }

        $data = $response->json();
        $result = $data['results'][0] ?? null;
        if (!$result) {
            return response()->json([
                'latitude' => null,
                'longitude' => null,
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ]);
        }

        $components = collect($result['address_components'] ?? []);
        $getComponent = function (string $type) use ($components) {
            $component = $components->first(function ($item) use ($type) {
                return in_array($type, $item['types'] ?? [], true);
            });
            return $component['long_name'] ?? null;
        };

        $location = $result['geometry']['location'] ?? [];

        return response()->json([
            'latitude' => $location['lat'] ?? null,
            'longitude' => $location['lng'] ?? null,
            'address' => $getComponent('route'),
            'city' => $getComponent('locality')
                ?? $getComponent('sublocality')
                ?? $getComponent('administrative_area_level_2'),
            'state' => $getComponent('administrative_area_level_1'),
            'country' => $getComponent('country'),
            'postalCode' => $getComponent('postal_code'),
            'formattedAddress' => $result['formatted_address'] ?? null,
        ]);
    }

    public function reverse(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $key = config('services.google.maps_key');
        if (!$key) {
            return response()->json([
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ]);
        }

        $latlng = $validated['lat'] . ',' . $validated['lng'];
        $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
            'latlng' => $latlng,
            'key' => $key,
        ]);

        if (!$response->ok()) {
            return response()->json([
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ], 502);
        }

        $data = $response->json();
        $result = $data['results'][0] ?? null;
        if (!$result) {
            return response()->json([
                'address' => null,
                'city' => null,
                'state' => null,
                'country' => null,
                'postalCode' => null,
                'formattedAddress' => null,
            ]);
        }

        $components = collect($result['address_components'] ?? []);
        $getComponent = function (string $type) use ($components) {
            $component = $components->first(function ($item) use ($type) {
                return in_array($type, $item['types'] ?? [], true);
            });
            return $component['long_name'] ?? null;
        };

        return response()->json([
            'address' => $getComponent('route'),
            'city' => $getComponent('locality')
                ?? $getComponent('sublocality')
                ?? $getComponent('administrative_area_level_2'),
            'state' => $getComponent('administrative_area_level_1'),
            'country' => $getComponent('country'),
            'postalCode' => $getComponent('postal_code'),
            'formattedAddress' => $result['formatted_address'] ?? null,
        ]);
    }
}
