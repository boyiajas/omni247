<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LandingController extends Controller
{
    /**
     * Display the landing page
     */
    public function index()
    {
        return view('welcome');
    }

    /**
     * Get public news feed (verified reports only)
     */
    public function publicNews(Request $request)
    {
        $category = $request->query('category');
        $limit = $request->query('limit', 20);

        $query = Report::with(['user', 'category', 'media'])
            ->where('status', 'verified')
            ->where('is_verified', true)
            ->withCount(['comments', 'views'])
            ->latest();

        if ($category && $category !== 'all') {
            $query->whereHas('category', function($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        $reports = $query->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'description' => $report->description,
                    'category' => [
                        'id' => $report->category_id,
                        'name' => $report->category->name ?? 'Other',
                        'slug' => $report->category->slug ?? 'other',
                    ],
                    'location' => $report->address ?? 'Unknown location',
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'image' => $report->media && $report->media->isNotEmpty() ? $report->media->first()->full_url : null,
                    'media_type' => $report->media && $report->media->isNotEmpty() ? $report->media->first()->type : 'image',
                    'rating' => round($report->average_rating ?? 0, 1),
                    'views_count' => $report->views_count ?? 0,
                    'comments_count' => $report->comments_count ?? 0,
                    'is_trending' => $report->is_trending ?? false,
                    'created_at' => $report->created_at->diffForHumans(),
                    'user' => $report->is_anonymous ? null : [
                        'name' => $report->user?->name,
                        'is_verified' => $report->user?->is_verified ?? false,
                    ],
                ];
            }),
        ]);
    }

    /**
     * Get platform statistics
     */
    public function stats()
    {
        $stats = [
            'total_reports' => Report::where('status', 'verified')->count(),
            'active_users' => User::where('is_active', true)->count(),
            'categories' => Category::count(),
            'cities_covered' => Report::distinct('city')->count('city'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Category::select('id', 'name', 'slug', 'icon', 'color')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
