<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewReportEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Report $report)
    {
    }

    public function broadcastOn(): array
    {
        $gridX = floor($this->report->latitude * 100);
        $gridY = floor($this->report->longitude * 100);
        
        return [
            new Channel('incidents'),
            new Channel("location.{$gridX}.{$gridY}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'IncidentReported';
    }

    public function broadcastWith(): array
    {
        return [
            'incident' => [
                'id' => $this->report->id,
                'title' => $this->report->title,
                'category' => $this->report->category->name,
                'latitude' => $this->report->latitude,
                'longitude' => $this->report->longitude,
                'priority' => $this->report->priority,
                'is_emergency' => $this->report->is_emergency,
                'created_at' => $this->report->created_at->toISOString(),
            ],
        ];
    }
}
