<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Report $report)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("report.{$this->report->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ReportUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'report' => [
                'id' => $this->report->id,
                'status' => $this->report->status,
                'is_verified' => $this->report->is_verified,
                'average_rating' => $this->report->average_rating,
                'ratings_count' => $this->report->ratings_count,
                'updated_at' => $this->report->updated_at->toISOString(),
            ],
        ];
    }
}
