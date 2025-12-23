<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Category;
use App\Models\ReportView;
use App\Jobs\ModerateReportJob;
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

        $reports = $query->paginate(20);

        $reports->getCollection()->transform(function ($report) {
            $recentComments = (int) ($report->recent_comments_count ?? 0);
            $recentViews = (int) ($report->recent_views_count ?? 0);
            $report->is_trending = $recentComments >= 5 || $recentViews >= 20;
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
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,emergency',
            'privacy' => 'sometimes|in:public,anonymous,private',
        ]);

        $category = Category::find($validated['category_id']);
        
        $report = $request->user()->reports()->create([
            ...$validated,
            'is_emergency' => $category->is_emergency || ($validated['priority'] ?? '') === 'emergency',
        ]);

        // Dispatch moderation job
        ModerateReportJob::dispatch($report);

        // Broadcast emergency alert if applicable
        if ($report->is_emergency) {
            event(new EmergencyAlertEvent($report));
        }

        // Reward user for creating report
        $request->user()->addPoints(10, 'Report created', $report->id);

        return response()->json($report->load(['category', 'media']), 201);
    }

    public function show(Request $request, $id)
    {
        $report = Report::with(['user', 'category', 'media', 'ratings'])
            ->findOrFail($id);

        $report->incrementViews();
        ReportView::create([
            'report_id' => $report->id,
            'user_id' => $request->user()->id,
            'viewed_at' => now(),
        ]);

        return response()->json($report);
    }

    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $this->authorize('update', $report);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:pending,verified,investigating,resolved,rejected',
        ]);

        $report->update($validated);

        return response()->json($report);
    }

    public function destroy($id)
    {
        $report = Report::findOrFail($id);

        // Check if user owns this report
        if ($report->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
