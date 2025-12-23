<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Models\Category;
use App\Models\Report;
use App\Models\ReportView;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        $trendWindowStart = now()->subHours(3);
        $weekStart = now()->subDays(7);
        $monthStart = now()->subDays(30);
        $summary = [
            'total_reports' => Report::count(),
            'open_reports' => Report::whereIn('status', ['pending', 'investigating'])->count(),
            'verified_reports' => Report::where('status', 'verified')->count(),
            'resolved_reports' => Report::where('status', 'resolved')->count(),
            'active_users' => User::where('last_active_at', '>=', now()->subDays(7))->count(),
            'agency_accounts' => User::where('role', 'agency')->count(),
            'reward_points' => Reward::sum('points'),
        ];

        $reportsByStatus = Report::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        $topCategories = Category::withCount('reports')
            ->orderByDesc('reports_count')
            ->take(5)
            ->get();

        $recentReports = Report::with(['user:id,name,avatar_url', 'category:id,name,color'])
            ->latest()
            ->take(6)
            ->get();

        $trendingReports = Report::with(['category:id,name,color', 'user:id,name'])
            ->withCount([
                'comments',
                'comments as recent_comments_count' => function ($q) use ($trendWindowStart) {
                    $q->where('created_at', '>=', $trendWindowStart);
                },
                'views as recent_views_count' => function ($q) use ($trendWindowStart) {
                    $q->where('created_at', '>=', $trendWindowStart);
                },
            ])
            ->latest()
            ->get()
            ->filter(function ($report) {
                $recentComments = (int) ($report->recent_comments_count ?? 0);
                $recentViews = (int) ($report->recent_views_count ?? 0);
                return $recentComments >= 5 || $recentViews >= 20;
            })
            ->sortByDesc(function ($report) {
                return ($report->recent_comments_count * 3) + $report->recent_views_count;
            })
            ->take(6)
            ->values();

        $trendingByCategory = Category::query()
            ->withCount([
                'reports as trending_reports_count' => function ($q) use ($trendWindowStart) {
                    $q->where('created_at', '>=', $trendWindowStart)
                        ->where(function ($inner) use ($trendWindowStart) {
                            $inner->whereHas('comments', function ($c) use ($trendWindowStart) {
                                $c->where('created_at', '>=', $trendWindowStart);
                            })
                            ->orWhereHas('views', function ($v) use ($trendWindowStart) {
                                $v->where('created_at', '>=', $trendWindowStart);
                            });
                        });
                },
            ])
            ->orderByDesc('trending_reports_count')
            ->take(6)
            ->get(['id', 'name', 'color']);

        $trendingRegions = Report::select(
                DB::raw("COALESCE(NULLIF(city, ''), country, 'Unknown') as region"),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', $trendWindowStart)
            ->groupBy('region')
            ->orderByDesc('total')
            ->take(6)
            ->get();

        $viewsByHour = ReportView::select(
                DB::raw("strftime('%H:00', created_at) as hour"),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', now()->subHours(24))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $weeklyReportsTotal = Report::where('created_at', '>=', $weekStart)->count();
        $weeklyVerified = Report::where('created_at', '>=', $weekStart)
            ->where('status', 'verified')
            ->count();
        $weeklyEmergency = Report::where('created_at', '>=', $weekStart)
            ->where('is_emergency', true)
            ->count();
        $weeklyComments = DB::table('comments')
            ->where('created_at', '>=', $weekStart)
            ->count();
        $weeklyViews = ReportView::where('created_at', '>=', $weekStart)->count();

        $resolvedReports = Report::whereNotNull('resolved_at')
            ->where('created_at', '>=', $monthStart)
            ->get(['created_at', 'resolved_at']);
        $avgResolutionHours = 0;
        if ($resolvedReports->isNotEmpty()) {
            $totalHours = $resolvedReports->reduce(function ($carry, $report) {
                return $carry + $report->created_at->diffInHours($report->resolved_at);
            }, 0);
            $avgResolutionHours = round($totalHours / $resolvedReports->count(), 1);
        }

        $openReports = Report::whereIn('status', ['pending', 'investigating'])
            ->get(['created_at']);
        $backlogAging = [
            '0-1' => 0,
            '2-3' => 0,
            '4-7' => 0,
            '8-14' => 0,
            '15+' => 0,
        ];
        foreach ($openReports as $report) {
            $daysOpen = $report->created_at->diffInDays(now());
            if ($daysOpen <= 1) {
                $backlogAging['0-1']++;
            } elseif ($daysOpen <= 3) {
                $backlogAging['2-3']++;
            } elseif ($daysOpen <= 7) {
                $backlogAging['4-7']++;
            } elseif ($daysOpen <= 14) {
                $backlogAging['8-14']++;
            } else {
                $backlogAging['15+']++;
            }
        }

        $topReporters = User::select('users.id', 'users.name', DB::raw('count(reports.id) as total'))
            ->join('reports', 'reports.user_id', '=', 'users.id')
            ->where('reports.created_at', '>=', $monthStart)
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        $qualityTotals = Report::where('created_at', '>=', $monthStart)
            ->select(
                DB::raw("SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified"),
                DB::raw("SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected")
            )
            ->first();
        $qualityCounts = [
            'verified' => (int) ($qualityTotals->verified ?? 0),
            'rejected' => (int) ($qualityTotals->rejected ?? 0),
        ];
        $qualityTotal = max($qualityCounts['verified'] + $qualityCounts['rejected'], 1);
        $reportQuality = [
            'verified' => [
                'count' => $qualityCounts['verified'],
                'percent' => round(($qualityCounts['verified'] / $qualityTotal) * 100),
            ],
            'rejected' => [
                'count' => $qualityCounts['rejected'],
                'percent' => round(($qualityCounts['rejected'] / $qualityTotal) * 100),
            ],
        ];

        $firstCommentTimes = Report::select('reports.id', 'reports.created_at', DB::raw('MIN(comments.created_at) as first_comment_at'))
            ->join('comments', 'comments.report_id', '=', 'reports.id')
            ->where('reports.created_at', '>=', $monthStart)
            ->groupBy('reports.id', 'reports.created_at')
            ->get();
        $commentDiffs = $firstCommentTimes->map(function ($row) {
            return Carbon::parse($row->created_at)->diffInMinutes(Carbon::parse($row->first_comment_at));
        })->sort()->values();
        $medianFirstCommentMinutes = 0;
        if ($commentDiffs->count() > 0) {
            $mid = (int) floor(($commentDiffs->count() - 1) / 2);
            $medianFirstCommentMinutes = $commentDiffs[$mid];
        }

        $resolutionDiffs = $resolvedReports->map(function ($row) {
            return $row->created_at->diffInMinutes($row->resolved_at);
        })->sort()->values();
        $medianResolutionMinutes = 0;
        if ($resolutionDiffs->count() > 0) {
            $mid = (int) floor(($resolutionDiffs->count() - 1) / 2);
            $medianResolutionMinutes = $resolutionDiffs[$mid];
        }

        $auditFeed = Audit::with('user:id,name')
            ->latest()
            ->take(10)
            ->get();

        $deviceStats = UserDevice::select('device_type', DB::raw('count(*) as total'))
            ->groupBy('device_type')
            ->get();

        return response()->json([
            'summary' => $summary,
            'reports_by_status' => $reportsByStatus,
            'top_categories' => $topCategories,
            'recent_reports' => $recentReports,
            'trending_reports' => $trendingReports,
            'trending_by_category' => $trendingByCategory,
            'trending_regions' => $trendingRegions,
            'views_by_hour' => $viewsByHour,
            'weekly_kpis' => [
                'reports' => $weeklyReportsTotal,
                'verification_rate' => $weeklyReportsTotal > 0 ? round(($weeklyVerified / $weeklyReportsTotal) * 100, 1) : 0,
                'emergency_rate' => $weeklyReportsTotal > 0 ? round(($weeklyEmergency / $weeklyReportsTotal) * 100, 1) : 0,
                'comments' => $weeklyComments,
                'views' => $weeklyViews,
                'avg_resolution_hours' => $avgResolutionHours,
            ],
            'backlog_aging' => $backlogAging,
            'top_reporters' => $topReporters,
            'report_quality' => $reportQuality,
            'response_performance' => [
                'median_first_comment_minutes' => $medianFirstCommentMinutes,
                'median_resolution_minutes' => $medianResolutionMinutes,
            ],
            'audit_feed' => $auditFeed,
            'device_stats' => $deviceStats,
        ]);
    }

    public function reportTimeline(Request $request)
    {
        $timeline = Report::select(
                DB::raw('date(created_at) as date'),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($timeline);
    }

    public function mapFeed(Request $request)
    {
        $reports = Report::with([
                'category:id,name,color,icon',
                'user:id,name,role,last_active_at',
            ])
            ->latest()
            ->take(50)
            ->get([
                'id',
                'title',
                'latitude',
                'longitude',
                'status',
                'priority',
                'is_emergency',
                'user_id',
                'category_id',
                'created_at',
            ]);

        return response()->json($reports);
    }
}
