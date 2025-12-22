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

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
