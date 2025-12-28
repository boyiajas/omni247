<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['user:id,name,avatar_url', 'category:id,name,color'])
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('category_id')) {
            $query->where('category_id', $category);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function show(Report $report)
    {
        $report->load([
            'user:id,name,email,avatar_url',
            'category:id,name,color',
            'media:id,report_id,type,url,order',
            'comments.user:id,name,avatar_url',
        ]);

        return response()->json($report);
    }

    public function moderate(Request $request, Report $report)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,verified,investigating,resolved,rejected',
            'priority' => 'nullable|in:low,medium,high,emergency',
            'is_verified' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $status = $data['status'];
        $updates = [];

        if (isset($data['priority'])) {
            $updates['priority'] = $data['priority'];
        }

        if ($status !== 'verified') {
            $updates['status'] = $status;
        }

        if ($status !== 'verified' && array_key_exists('is_verified', $data)) {
            $updates['is_verified'] = $data['is_verified'];
            $updates['verified_at'] = $data['is_verified'] ? now() : null;
        }

        if ($status === 'resolved') {
            $updates['resolved_at'] = now();
        }

        if ($status === 'verified') {
            if ($report->user) {
                if (!$report->is_verified) {
                    $report->markAsVerified();
                } else {
                    $report->update([
                        'status' => 'verified',
                        'verified_at' => $report->verified_at ?? now(),
                    ]);
                }

                $achievementService = app(\App\Services\AchievementService::class);
                $achievementService->checkAndAwardAchievements(
                    $report->user,
                    'report_verified',
                    ['report' => $report, 'emergency' => $report->is_emergency]
                );
            } else {
                $report->update([
                    'status' => 'verified',
                    'verified_at' => $report->verified_at ?? now(),
                ]);
            }
        }

        if (!empty($updates)) {
            $report->update($updates);
        }

        // Send notification to user when report is verified
        if ($status === 'verified' && $report->user) {
            $report->user->notifications()->create([
                'type' => 'report_verified',
                'title' => 'Report Verified',
                'body' => "Your report '{$report->title}' has been verified by our team.",
                'data' => [
                    'report_id' => $report->id,
                    'report_title' => $report->title,
                ],
            ]);
        }

        AuditLogger::log(
            $request->user(),
            'admin.reports.moderate',
            'Moderated report '.$report->id,
            $report,
            array_merge($updates, ['notes' => $data['notes'] ?? null]),
            $request
        );

        return response()->json($report->fresh(['user:id,name', 'category:id,name']));
    }

    public function destroy(Request $request, Report $report)
    {
        $report->delete();

        AuditLogger::log(
            $request->user(),
            'admin.reports.delete',
            'Deleted report '.$report->id,
            $report,
            [],
            $request
        );

        return response()->json(['message' => 'Report deleted']);
    }
}
