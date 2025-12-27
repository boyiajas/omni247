<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device_uuid',
        'device_type',
        'device_name',
        'device_model',
        'imei',
        'app_version',
        'os_version',
        'last_ip',
        'push_token',
        'last_active_at',
        'metadata',
    ];

    protected $casts = [
        'last_active_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
