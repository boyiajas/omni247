<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlertDismissal;
use App\Models\Category;
use App\Models\Report;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->get('limit', 5);
        if ($limit < 1) {
            $limit = 5;
        }
        if ($limit > 20) {
            $limit = 20;
        }

        $crimeCategoryIds = Category::query()
            ->where('slug', 'crime')
            ->pluck('id');

        $dismissed = AlertDismissal::query()
            ->where('user_id', $request->user()->id)
            ->get()
            ->groupBy('section')
            ->map(fn ($items) => $items->pluck('report_id')->all());

        $highPriority = Report::with(['user', 'category', 'media'])
            ->whereIn('category_id', $crimeCategoryIds)
            ->where('status', 'verified')
            ->when(!empty($dismissed['high_priority']), function ($query) use ($dismissed) {
                $query->whereNotIn('id', $dismissed['high_priority']);
            })
            ->latest()
            ->limit($limit)
            ->get();

        $trending = Report::with(['user', 'category', 'media'])
            ->where('status', 'verified')
            ->when(!empty($dismissed['trending']), function ($query) use ($dismissed) {
                $query->whereNotIn('id', $dismissed['trending']);
            })
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();

        $news = Report::with(['user', 'category', 'media'])
            ->where('status', 'verified')
            ->whereHas('category', function ($query) {
                $query->where('is_emergency', false)
                    ->where('slug', '!=', 'crime');
            })
            ->when(!empty($dismissed['news']), function ($query) use ($dismissed) {
                $query->whereNotIn('id', $dismissed['news']);
            })
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json([
            'high_priority' => $highPriority,
            'trending' => $trending,
            'news' => $news,
        ]);
    }

    public function dismiss(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'section' => 'nullable|in:high_priority,trending,news,positive',
        ]);

        AlertDismissal::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'report_id' => $validated['report_id'],
                'section' => $validated['section'] ?? null,
            ],
            ['dismissed_at' => now()]
        );

        return response()->json(['status' => 'ok']);
    }
}
