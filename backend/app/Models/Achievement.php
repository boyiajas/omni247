<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
        'color',
        'type',
        'criteria',
        'points_required',
        'is_active',
    ];

    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
        'points_required' => 'integer',
    ];

    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withTimestamps()
            ->withPivot('earned_at', 'progress');
    }

    // Helper to check if a user has earned this achievement
    public function isEarnedBy(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }
}
