<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Report;
use Illuminate\Http\Request;

class ClientReportController extends Controller
{
    public function categories()
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'is_emergency']);

        return response()->json(['data' => $categories]);
    }

    public function index(Request $request)
    {
        $limit = (int) $request->get('limit', 20);
        $limit = max(1, min($limit, 50));
        $category = $request->get('category');

        $query = Report::query()
            ->with(['category', 'media', 'user'])
            ->withCount(['comments'])
            ->where('status', 'verified');

        if ($category && $category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        $reports = $query->latest()->limit($limit)->get()->map(function ($report) {
            $media = $report->media->first();
            $imageUrl = $this->normalizeMediaUrl($media?->thumbnail_url ?? $media?->url);
            return [
                'id' => $report->id,
                'title' => $report->title,
                'description' => $report->description,
                'created_at' => $report->created_at,
                'status' => $report->status,
                'priority' => $report->priority,
                'address' => $report->address,
                'latitude' => $report->latitude,
                'longitude' => $report->longitude,
                'views_count' => $report->views_count ?? 0,
                'comments_count' => $report->comments_count ?? 0,
                'average_rating' => $report->average_rating ?? 0,
                'category' => $report->category,
                'user' => [
                    'id' => $report->user?->id,
                    'name' => $report->user?->name,
                ],
                'image_url' => $imageUrl,
            ];
        });

        return response()->json(['data' => $reports]);
    }

    public function myReports(Request $request)
    {
        $reports = $request->user('client')->reports()
            ->with(['category', 'media'])
            ->withCount(['comments'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($report) {
            $media = $report->media->first();
            $imageUrl = $this->normalizeMediaUrl($media?->thumbnail_url ?? $media?->url);
            return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'description' => $report->description,
                    'created_at' => $report->created_at,
                    'status' => $report->status,
                    'priority' => $report->priority,
                    'address' => $report->address,
                    'views_count' => $report->views_count ?? 0,
                    'comments_count' => $report->comments_count ?? 0,
                    'category' => $report->category,
                'image_url' => $imageUrl,
            ];
        });

        return response()->json(['data' => $reports]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'submitter_latitude' => 'nullable|numeric',
            'submitter_longitude' => 'nullable|numeric',
            'submitter_accuracy' => 'nullable|numeric',
            'submitter_location_recorded_at' => 'nullable|date',
            'privacy' => 'nullable|in:public,private',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $user = $request->user('client');

        $report = Report::create([
            'user_id' => $user->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'submitter_latitude' => $validated['submitter_latitude'] ?? null,
            'submitter_longitude' => $validated['submitter_longitude'] ?? null,
            'submitter_accuracy' => $validated['submitter_accuracy'] ?? null,
            'submitter_location_recorded_at' => $validated['submitter_location_recorded_at'] ?? null,
            'privacy' => $validated['privacy'] ?? 'public',
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'pending',
            'is_verified' => false,
            'is_anonymous' => false,
            'views_count' => 0,
            'shares_count' => 0,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => $report->load('category'),
        ], 201);
    }

    private function normalizeMediaUrl(?string $url): ?string
    {
        if (!$url) {
            return null;
        }

        if (str_starts_with($url, 'http')) {
            $host = parse_url($url, PHP_URL_HOST);
            $path = parse_url($url, PHP_URL_PATH);
            $localHosts = ['localhost', '127.0.0.1', '10.0.2.2'];
            $appHost = parse_url(config('app.url'), PHP_URL_HOST);

            if ($host && in_array($host, $localHosts, true)) {
                return url($path ?: '/');
            }

            if ($appHost && $host && $host !== $appHost && str_starts_with($path ?? '', '/storage/')) {
                return url($path ?: '/');
            }

            return $url;
        }

        if (str_starts_with($url, '/storage/') || str_starts_with($url, 'storage/')) {
            return url($url);
        }

        return url('/storage/' . ltrim($url, '/'));
    }
}
