<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'report_id',
    ];

    /**
     * Get the user who favorited.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the favorited report.
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
