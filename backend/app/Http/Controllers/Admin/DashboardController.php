<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Models\Category;
use App\Models\Report;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
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
