<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'report_id', 'type', 'url', 'thumbnail_url', 'filename',
        'mime_type', 'size', 'duration', 'width', 'height',
        'metadata', 'is_verified', 'is_deepfake_checked',
        'deepfake_score', 'order',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_verified' => 'boolean',
        'is_deepfake_checked' => 'boolean',
        'deepfake_score' => 'decimal:4',
    ];

    protected $appends = ['full_url'];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function getFullUrlAttribute()
    {
        if (!$this->url) {
            return null;
        }

        // If URL contains Android emulator address (10.0.2.2), convert to current domain
        if (str_contains($this->url, '10.0.2.2:8000')) {
            // Extract the path after the domain
            $path = parse_url($this->url, PHP_URL_PATH);
            return url($path);
        }

        // If URL is already a full URL (starts with http), return as is
        if (str_starts_with($this->url, 'http')) {
            return $this->url;
        }

        // If URL starts with /storage/ or storage/, use it directly
        if (str_starts_with($this->url, '/storage/') || str_starts_with($this->url, 'storage/')) {
            return url($this->url);
        }

        // Otherwise, prepend /storage/
        return url('/storage/' . ltrim($this->url, '/'));
    }
}
