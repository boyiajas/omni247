<?php

namespace App\Services;

use App\Models\Audit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogger
{
    public static function log($user, string $action, string $description, ?Model $target = null, array $metadata = [], ?Request $request = null): void
    {
        Audit::create([
            'user_id' => $user?->id,
            'action' => $action,
            'description' => $description,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->getKey(),
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
