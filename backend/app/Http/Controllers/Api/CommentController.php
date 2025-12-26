<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentView;
use App\Events\NotificationCreatedEvent;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Get all comments for a report.
     */
    public function index(Request $request, $reportId)
    {
        $report = Report::findOrFail($reportId);
        
        $comments = $report->comments()
            ->with(['user:id,name,avatar_url'])
            ->get();

        if ($request->user()) {
            $now = now();
            $viewRows = $comments->map(function ($comment) use ($request, $now) {
                return [
                    'comment_id' => $comment->id,
                    'user_id' => $request->user()->id,
                    'viewed_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })->all();

            if (!empty($viewRows)) {
                CommentView::upsert(
                    $viewRows,
                    ['comment_id', 'user_id'],
                    ['viewed_at', 'updated_at']
                );

                Notification::where('user_id', $request->user()->id)
                    ->where('type', 'comment')
                    ->whereNull('read_at')
                    ->whereJsonContains('data->report_id', $report->id)
                    ->update(['read_at' => $now]);
            }
        }

        return response()->json([
            'data' => $comments,
            'count' => $comments->count(),
        ]);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'content' => 'required|string|min:1|max:1000',
        ]);

        $report = Report::with('user')->findOrFail($validated['report_id']);
        
        // Check if report owner allows comments
        if ($report->user) {
            $privacySettings = \App\Services\PrivacyService::mergeWithDefaults($report->user->privacy_settings);
            if (!$privacySettings['allow_comments']) {
                return response()->json([
                    'message' => 'Comments are disabled for this report',
                ], 403);
            }
        }

        $comment = Comment::create([
            'report_id' => $validated['report_id'],
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        CommentView::updateOrCreate(
            [
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
            ],
            ['viewed_at' => now()]
        );

        if (
            ($report->is_verified || $report->status === 'verified')
            && $report->user_id !== auth()->id()
            && $report->user
        ) {
            $notification = Notification::create([
                'user_id' => $report->user_id,
                'type' => 'comment',
                'title' => 'New comment on your report',
                'body' => $comment->content,
                'data' => [
                    'report_id' => $report->id,
                    'comment_id' => $comment->id,
                ],
            ]);
            event(new NotificationCreatedEvent($notification));
        }

        // Reload with user relationship
        $comment->load('user:id,name,avatar_url');

        return response()->json($comment, 201);
    }

    /**
     * Delete a comment (user can only delete their own).
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);

        // Check if user owns this comment
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
