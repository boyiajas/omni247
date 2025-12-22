<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Events\NewReportEvent;
use App\Events\ReportUpdatedEvent;

class Report extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'latitude',
        'longitude',
        'address',
        'city',
        'country',
        'status',
        'priority',
        'privacy',
        'is_verified',
        'is_emergency',
        'views_count',
        'shares_count',
        'average_rating',
        'ratings_count',
        'verified_at',
        'resolved_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'average_rating' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_emergency' => 'boolean',
        'verified_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected $dispatchesEvents = [
        'created' => NewReportEvent::class,
        'updated' => ReportUpdatedEvent::class,
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class)->orderBy('order');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function bookmarkedBy()
    {
        return $this->belongsToMany(User::class, 'bookmarks');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeNearby($query, $latitude, $longitude, $radiusKm = 50)
    {
        $R = 6371; // Earth's radius in km
        
        return $query->selectRaw("
            *, ( {$R} * acos( cos( radians(?) ) *
            cos( radians( latitude ) ) *
            cos( radians( longitude ) - radians(?) ) +
            sin( radians(?) ) *
            sin( radians( latitude ) ) ) ) AS distance
        ", [$latitude, $longitude, $latitude])
        ->having('distance', '<=', $radiusKm)
        ->orderBy('distance');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeEmergency($query)
    {
        return $query->where('is_emergency', true);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // Helper Methods
    public function markAsVerified()
    {
        $this->update([
            'is_verified' => true,
            'status' => 'verified',
            'verified_at' => now(),
        ]);
        
        // Reward user
        $this->user->addPoints(50, 'Report verified', $this->id);
    }

    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function calculateAverageRating()
    {
        $average = $this->ratings()->avg('rating');
        $count = $this->ratings()->count();
        
        $this->update([
            'average_rating' => round($average, 2),
            'ratings_count' => $count,
        ]);
    }
}
