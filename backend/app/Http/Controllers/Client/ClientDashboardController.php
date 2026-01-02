<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientDashboardController extends Controller
{
    public function overview(Request $request)
    {
        $user = $request->user('client');

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $recentReports = $user->reports()
            ->with('category')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'created_at' => $report->created_at,
                    'category' => $report->category ? [
                        'id' => $report->category->id,
                        'name' => $report->category->name,
                    ] : null,
                ];
            });

        return response()->json([
            'stats' => [
                'totalReports' => $user->reports()->count(),
                'reputation' => $user->reputation_score ?? 0,
                'points' => $user->total_points ?? 0,
                'badges' => $user->achievements()->count(),
            ],
            'recentReports' => $recentReports,
        ]);
    }
}
