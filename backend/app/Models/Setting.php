<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value by key
     */
    public static function set(string $key, mixed $value, string $type = 'string', string $group = 'general', ?string $description = null): void
    {
        $setting = self::firstOrNew(['key' => $key]);
        $setting->value = self::encodeValue($value, $type);
        $setting->type = $type;
        $setting->group = $group;
        $setting->description = $description ?? $setting->description;
        $setting->save();
    }

    /**
     * Cast value based on type
     */
    protected static function castValue(mixed $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($value) ? (float) $value : $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Encode value based on type
     */
    protected static function encodeValue(mixed $value, string $type): string
    {
        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'number' => (string) $value,
            'json' => json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Get accessor for value with automatic casting
     */
    public function getValueAttribute($value): mixed
    {
        return self::castValue($value, $this->type);
    }
}
