<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlertDismissal extends Model
{
    protected $fillable = [
        'user_id',
        'report_id',
        'section',
        'dismissed_at',
    ];

    protected $casts = [
        'dismissed_at' => 'datetime',
    ];
}
