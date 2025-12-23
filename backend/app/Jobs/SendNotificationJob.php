<?php

namespace App\Jobs;

use App\Events\NotificationCreatedEvent;
use App\Models\User;
use App\Models\Notification as NotificationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $title,
        public string $body,
        public array $data = []
    ) {
    }

    public function handle(): void
    {
        // Create notification in database
        $notification = NotificationModel::create([
            'user_id' => $this->user->id,
            'type' => $this->data['type'] ?? 'general',
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
        ]);
        event(new NotificationCreatedEvent($notification));

        // Send push notification via FCM
        if ($this->user->fcm_token) {
            // FCM implementation here
            // This would use HTTP client to send to Firebase
        }
    }
}
