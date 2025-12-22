<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id', 'user_id', 'rating', 'comment', 'is_helpful',
    ];

    protected $casts = [
        'is_helpful' => 'boolean',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted()
    {
        static::created(function ($rating) {
            $rating->report->calculateAverageRating();
        });

        static::updated(function ($rating) {
            $rating->report->calculateAverageRating();
        });

        static::deleted(function ($rating) {
            $rating->report->calculateAverageRating();
        });
    }
}
