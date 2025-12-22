<?php

namespace App\Listeners;

use App\Events\NewReportEvent;
use App\Jobs\SendNotificationJob;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendReportNotification implements ShouldQueue
{
    public function handle(NewReportEvent $event): void
    {
        $report = $event->report;
        
        // Get nearby users (simplified for now)
        $nearbyUsers = User::where('id', '!=', $report->user_id)
            ->limit(10)
            ->get();
        
        foreach ($nearbyUsers as $user) {
            SendNotificationJob::dispatch(
                $user,
                'New Report Nearby',
                "{$report->title} reported near you",
                ['report_id' => $report->id]
            );
        }
    }
}
