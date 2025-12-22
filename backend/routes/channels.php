<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Private user channel for notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel for specific reports
Broadcast::channel('report.{reportId}', function ($user, $reportId) {
    return ['id' => $user->id, 'name' => $user->name];
});

// Public channels (no authorization needed)
Broadcast::channel('incidents', function () {
    return true;
});

Broadcast::channel('emergency-alerts', function () {
    return true;
});

// Location-based channels
Broadcast::channel('location.{gridX}.{gridY}', function () {
    return true;
});
