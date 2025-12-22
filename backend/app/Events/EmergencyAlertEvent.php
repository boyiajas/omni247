<?php

namespace App\Events;

use App\Models\Report;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmergencyAlertEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Report $report, public float $radiusKm = 10)
    {
    }

    public function broadcastOn(): array
    {
        // Broadcast to all users in emergency radius
        // Multiple location grids to cover emergency radius
        $channels = [new Channel('emergency-alerts')];
        
        // Calculate grid points within radius
        $gridX = floor($this->report->latitude * 100);
        $gridY = floor($this->report->longitude * 100);
        
        for ($x = $gridX - 1; $x <= $gridX + 1; $x++) {
            for ($y = $gridY - 1; $y <= $gridY + 1; $y++) {
                $channels[] = new Channel("location.{$x}.{$y}");
            }
        }
        
        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'EmergencyAlert';
    }

    public function broadcastWith(): array
    {
        return [
            'alert' => [
                'id' => $this->report->id,
                'title' => $this->report->title,
                'description' => $this->report->description,
                'category' => $this->report->category->name,
                'latitude' => $this->report->latitude,
                'longitude' => $this->report->longitude,
                'priority' => 'emergency',
                'created_at' => $this->report->created_at->toISOString(),
            ],
        ];
    }
}
