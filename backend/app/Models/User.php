<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'role_id',
        'status',
        'is_anonymous',
        'is_verified',
        'has_completed_onboarding',
        'reputation_score',
        'total_reports',
        'total_points',
        'avatar_url',
        'fcm_token',
        'notification_settings',
        'privacy_settings',
        'last_active_at',
        'last_login_ip',
        'last_known_country',
        'last_known_city',
        'last_known_lat',
        'last_known_lng',
        'language',
        'theme',
        'auto_verify_enabled',
        'auto_verify_tier',
        'auto_verify_levels',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_active_at' => 'datetime',
        'is_anonymous' => 'boolean',
        'is_verified' => 'boolean',
        'has_completed_onboarding' => 'boolean',
        'password' => 'hashed',
        'last_known_lat' => 'float',
        'last_known_lng' => 'float',
        'notification_settings' => 'array',
        'privacy_settings' => 'array',
        'auto_verify_enabled' => 'boolean',
        'auto_verify_levels' => 'array',
    ];

    protected $appends = [
        'location_summary',
    ];

    // Relationships
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function roleModel()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class)->latest();
    }

    public function rewards()
    {
        return $this->hasMany(Reward::class);
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('earned_at', 'progress');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedReports()
    {
        return $this->belongsToMany(Report::class, 'bookmarks');
    }

    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function audits()
    {
        return $this->hasMany(Audit::class);
    }

    public function getLocationSummaryAttribute(): ?string
    {
        $parts = array_filter([
            $this->last_known_country,
            $this->last_known_city,
        ]);

        return count($parts) ? implode(' • ', $parts) : null;
    }

    // Scopes
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeAnonymous($query)
    {
        return $query->where('is_anonymous', true);
    }

    // Helper Methods
    public function addPoints(int $points, string $reason, ?int $reportId = null)
    {
        $this->increment('total_points', $points);
        
        $reward = $this->rewards()->create([
            'report_id' => $reportId,
            'type' => 'achievement',
            'points' => $points,
            'reason' => $reason,
        ]);

        // Check for tier achievements after points update
        app(\App\Services\AchievementService::class)->checkAndAwardAchievements($this, 'points_updated');

        return $reward;
    }

    public function isRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function canModerate(): bool
    {
        return in_array($this->role, ['moderator', 'admin']);
    }

    public function assignRole(Role $role): void
    {
        $this->role = $role->key;
        $this->role_id = $role->id;
        $this->save();
    }
}
