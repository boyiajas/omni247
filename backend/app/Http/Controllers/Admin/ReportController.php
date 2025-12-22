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

        $updates = [
            'status' => $data['status'],
        ];

        if (isset($data['priority'])) {
            $updates['priority'] = $data['priority'];
        }

        if (array_key_exists('is_verified', $data)) {
            $updates['is_verified'] = $data['is_verified'];
            $updates['verified_at'] = $data['is_verified'] ? now() : null;
        }

        if ($data['status'] === 'resolved') {
            $updates['resolved_at'] = now();
        }

        $report->update($updates);

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
