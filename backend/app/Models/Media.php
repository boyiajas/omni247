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

        // If URL is already a full URL (starts with http), normalize local/dev hosts.
        if (str_starts_with($this->url, 'http')) {
            $host = parse_url($this->url, PHP_URL_HOST);
            $path = parse_url($this->url, PHP_URL_PATH);

            $localHosts = ['localhost', '127.0.0.1', '10.0.2.2'];
            $appHost = parse_url(config('app.url'), PHP_URL_HOST);

            if ($host && in_array($host, $localHosts, true)) {
                return url($path ?: '/');
            }

            if ($appHost && $host && $host !== $appHost && str_starts_with($path ?? '', '/storage/')) {
                return url($path ?: '/');
            }

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
