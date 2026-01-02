<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Category;
use App\Models\ReportView;
use App\Jobs\VerifyReportJob;
use App\Events\EmergencyAlertEvent;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $trendWindowStart = now()->subHours(3);
        $query = Report::with(['user', 'category', 'media'])
            ->withCount([
                'comments',
                'comments as recent_comments_count' => function ($q) use ($trendWindowStart) {
                    $q->where('created_at', '>=', $trendWindowStart);
                },
                'views as recent_views_count' => function ($q) use ($trendWindowStart) {
                    $q->where('created_at', '>=', $trendWindowStart);
                },
            ])
            ->latest();

        $viewMode = $request->get('view');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by emergency
        if ($request->boolean('emergency')) {
            $query->where('is_emergency', true);
        }

        if (in_array($viewMode, ['global', 'country'], true)) {
            $query->havingRaw('(recent_comments_count >= 5 OR recent_views_count >= 20)');
        }

        if ($viewMode === 'country') {
            $country = $request->get('country') ?: optional($request->user())->last_known_country;
            if ($country) {
                $query->where('country', $country);
            }
        }

        if ($viewMode === 'nearby') {
            $latitude = $request->get('latitude') ?? optional($request->user())->last_known_lat;
            $longitude = $request->get('longitude') ?? optional($request->user())->last_known_lng;
            $radius = $request->get('radius') ?? 25;

            if (is_null($latitude) || is_null($longitude)) {
                return response()->json([
                    'message' => 'Latitude and longitude are required for nearby reports.',
                ], 422);
            }

            $query->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->nearby($latitude, $longitude, $radius);
        }

        $reports = $query->paginate(20);

        $reports->getCollection()->transform(function ($report) {
            $recentComments = (int) ($report->recent_comments_count ?? 0);
            $recentViews = (int) ($report->recent_views_count ?? 0);
            $report->is_trending = $recentComments >= 5 || $recentViews >= 20;
            
            // Add privacy info
            $allowComments = true;
            $isAnonymous = (bool) $report->is_anonymous;
            if ($report->user && $report->user->privacy_settings) {
                try {
                    $privacySettings = \App\Services\PrivacyService::mergeWithDefaults($report->user->privacy_settings);
                    $allowComments = $privacySettings['allow_comments'] ?? true;
                    if (($privacySettings['default_report_privacy'] ?? 'public') === 'anonymous') {
                        $isAnonymous = true;
                    }
                } catch (\Exception $e) {
                    \Log::error('Privacy settings error in index: ' . $e->getMessage());
                }
            }
            if ($report->privacy === 'anonymous') {
                $isAnonymous = true;
            }
            $report->allow_comments = $allowComments;
            $report->is_anonymous = $isAnonymous;
            
            return $report;
        });

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'submitter_latitude' => 'nullable|numeric',
            'submitter_longitude' => 'nullable|numeric',
            'submitter_accuracy' => 'nullable|numeric',
            'submitter_location_recorded_at' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,emergency',
            'privacy' => 'sometimes|in:public,anonymous,private',
        ]);

        $category = Category::find($validated['category_id']);
        
        // Get user's privacy settings for default report privacy
        $privacySettings = \App\Services\PrivacyService::mergeWithDefaults($request->user()->privacy_settings);
        $reportPrivacy = $validated['privacy'] ?? $privacySettings['default_report_privacy'];
        
        // Determine if report should be anonymous or private
        $isAnonymous = $reportPrivacy === 'anonymous';
        $isPrivate = $reportPrivacy === 'private';
        
        $report = $request->user()->reports()->create([
            ...$validated,
            'is_emergency' => $category->is_emergency || ($validated['priority'] ?? '') === 'emergency',
            'is_anonymous' => $isAnonymous,
            'privacy' => $reportPrivacy,
        ]);

        $verificationSettings = app(\App\Services\Verification\VerificationSettings::class);
        if ($verificationSettings->shouldRunForUser($request->user())) {
            VerifyReportJob::dispatch($report->id);
        }

        // Broadcast emergency alert if applicable
        if ($report->is_emergency) {
            event(new EmergencyAlertEvent($report));
        }

        return response()->json($report->load(['category', 'media']), 201);
    }

    public function show(Request $request, Report $report)
    {
        $report->load(['user', 'category', 'media', 'ratings.user']);
        $report->increment('views_count');
        
        // Only create view record if user is authenticated
        if ($request->user()) {
            ReportView::create([
                'report_id' => $report->id,
                'user_id' => $request->user()->id,
            ]);
        }

        // Add privacy info to response
        $allowComments = true;
        $isAnonymous = (bool) $report->is_anonymous;
        if ($report->user && $report->user->privacy_settings) {
            try {
                $privacySettings = \App\Services\PrivacyService::mergeWithDefaults($report->user->privacy_settings);
                $allowComments = $privacySettings['allow_comments'] ?? true;
                if (($privacySettings['default_report_privacy'] ?? 'public') === 'anonymous') {
                    $isAnonymous = true;
                }
            } catch (\Exception $e) {
                // If privacy settings fail, default to allowing comments
                \Log::error('Privacy settings error: ' . $e->getMessage());
            }
        }
        if ($report->privacy === 'anonymous') {
            $isAnonymous = true;
        }
        
        $reportData = $report->toArray();
        $reportData['allow_comments'] = $allowComments;
        $reportData['is_anonymous'] = $isAnonymous;
        
        return response()->json($reportData);
    }

    public function update(Request $request, Report $report)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'address' => 'sometimes|string',
            'submitter_latitude' => 'nullable|numeric',
            'submitter_longitude' => 'nullable|numeric',
            'submitter_accuracy' => 'nullable|numeric',
            'submitter_location_recorded_at' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $report->update($validated);

        return response()->json($report);
    }

    public function destroy(Report $report)
    {
        $report->delete();
        return response()->json(['message' => 'Report deleted successfully']);
    }

    public function nearby(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius' => 'sometimes|numeric|min:1|max:100',
        ]);

        $radius = $validated['radius'] ?? 50;

        $reports = Report::with(['user', 'category', 'media'])
            ->nearby($validated['latitude'], $validated['longitude'], $radius)
            ->paginate(20);

        return response()->json($reports);
    }

    public function rate(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $rating = $report->ratings()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        $report->calculateAverageRating();

        return response()->json([
            'rating' => $rating,
            'report' => $report->fresh(['ratings']),
        ]);
    }

    public function userReports(Request $request)
    {
        $reports = $request->user()->reports()
            ->with(['category', 'media'])
            ->withCount(['comments'])
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }
}
