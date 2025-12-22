<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentView;
use App\Models\Notification;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureCommentNotifications($request->user());

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        $collection = $notifications->getCollection();
        $commentIds = $collection
            ->filter(fn ($notification) => $notification->type === 'comment' && !empty($notification->data['comment_id']))
            ->pluck('data.comment_id')
            ->unique()
            ->values()
            ->all();

        $viewedCommentIds = [];
        if (!empty($commentIds)) {
            $viewedCommentIds = CommentView::where('user_id', $request->user()->id)
                ->whereIn('comment_id', $commentIds)
                ->pluck('comment_id')
                ->all();
        }
        $viewedLookup = array_flip($viewedCommentIds);

        $collection->transform(function ($notification) use ($viewedLookup) {
            $commentId = $notification->data['comment_id'] ?? null;
            $commentViewed = $commentId ? isset($viewedLookup[$commentId]) : true;
            $notification->comment_viewed = $commentViewed;
            $notification->is_unread = $notification->read_at === null || !$commentViewed;
            return $notification;
        });

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $this->ensureCommentNotifications($request->user());

        $baseUnread = $request->user()
            ->notifications()
            ->unread()
            ->count();

        $commentNotifications = $request->user()
            ->notifications()
            ->where('type', 'comment')
            ->get(['id', 'data', 'read_at']);

        $commentIds = $commentNotifications
            ->pluck('data.comment_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $viewedLookup = [];
        if (!empty($commentIds)) {
            $viewedLookup = CommentView::where('user_id', $request->user()->id)
                ->whereIn('comment_id', $commentIds)
                ->pluck('comment_id')
                ->flip()
                ->all();
        }

        $extraUnread = 0;
        foreach ($commentNotifications as $notification) {
            $commentId = $notification->data['comment_id'] ?? null;
            if (!$commentId) {
                continue;
            }
            $commentViewed = isset($viewedLookup[$commentId]);
            if (!$commentViewed && $notification->read_at !== null) {
                $extraUnread++;
            }
        }

        return response()->json(['unread_count' => $baseUnread + $extraUnread]);
    }

    private function ensureCommentNotifications($user): void
    {
        if (!$user) {
            return;
        }

        $userId = $user->id;
        $viewedCommentIds = CommentView::where('user_id', $userId)
            ->pluck('comment_id')
            ->all();

        $existingCommentIds = Notification::where('user_id', $userId)
            ->where('type', 'comment')
            ->get(['data'])
            ->pluck('data.comment_id')
            ->filter()
            ->unique()
            ->all();

        $missingCommentsQuery = Comment::query()
            ->where('user_id', '!=', $userId)
            ->whereHas('report', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where(function ($q) {
                        $q->where('is_verified', true)
                            ->orWhere('status', 'verified');
                    });
            })
            ->whereNotIn('id', $viewedCommentIds);

        if (!empty($existingCommentIds)) {
            $missingCommentsQuery->whereNotIn('id', $existingCommentIds);
        }

        $missingComments = $missingCommentsQuery
            ->with('report:id,title')
            ->get();

        foreach ($missingComments as $comment) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'comment',
                'title' => 'New comment on your report',
                'body' => $comment->content,
                'data' => [
                    'report_id' => $comment->report_id,
                    'comment_id' => $comment->id,
                ],
            ]);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy($id, Request $request)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    public function registerDevice(Request $request)
    {
        $validated = $request->validate([
            'device_uuid' => 'required|string',
            'device_type' => 'nullable|string',
            'device_name' => 'nullable|string',
            'app_version' => 'nullable|string',
            'os_version' => 'nullable|string',
            'push_token' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $device = UserDevice::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'device_uuid' => $validated['device_uuid'],
            ],
            [
                'device_type' => $validated['device_type'] ?? $request->header('X-Device-Type'),
                'device_name' => $validated['device_name'] ?? null,
                'app_version' => $validated['app_version'] ?? null,
                'os_version' => $validated['os_version'] ?? null,
                'push_token' => $validated['push_token'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'last_ip' => $request->ip(),
                'last_active_at' => now(),
            ]
        );

        return response()->json($device);
    }
}
