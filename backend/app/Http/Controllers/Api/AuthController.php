<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\PrivacyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $defaultRole = Role::where('key', 'user')->first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_anonymous' => false,
            'has_completed_onboarding' => true,
            'role' => $defaultRole?->key ?? 'user',
            'role_id' => $defaultRole?->id,
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        // Register device if device info is provided
        if ($request->has('device_uuid')) {
            \App\Models\UserDevice::updateOrCreate(
                ['device_uuid' => $request->device_uuid],
                [
                    'user_id' => $user->id,
                    'device_type' => $request->device_type,
                    'device_name' => $request->device_name,
                    'device_model' => $request->device_model,
                    'imei' => $request->imei,
                    'app_version' => $request->app_version,
                    'os_version' => $request->os_version,
                    'push_token' => $request->fcm_token,
                    'last_ip' => $request->ip(),
                    'last_active_at' => now(),
                ]
            );
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->update([
            'last_active_at' => now(),
            'has_completed_onboarding' => true,
        ]);
        $token = $user->createToken('mobile')->plainTextToken;

        // Register/update device if device info is provided
        if ($request->has('device_uuid')) {
            \App\Models\UserDevice::updateOrCreate(
                ['device_uuid' => $request->device_uuid],
                [
                    'user_id' => $user->id,
                    'device_type' => $request->device_type,
                    'device_name' => $request->device_name,
                    'device_model' => $request->device_model,
                    'imei' => $request->imei,
                    'app_version' => $request->app_version,
                    'os_version' => $request->os_version,
                    'push_token' => $request->fcm_token,
                    'last_ip' => $request->ip(),
                    'last_active_at' => now(),
                ]
            );
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function anonymousLogin(Request $request)
    {
        $defaultRole = Role::where('key', 'user')->first();

        $user = User::create([
            'name' => 'Anonymous User',
            'is_anonymous' => true,
            'role' => $defaultRole?->key ?? 'user',
            'role_id' => $defaultRole?->id,
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load(['roleModel', 'achievements']);
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'avatar_url' => 'nullable|url',
            'fcm_token' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function notificationSettings(Request $request)
    {
        $user = $request->user();
        $defaults = $this->defaultNotificationSettings();
        $settings = array_merge($defaults, $user->notification_settings ?? []);

        return response()->json([
            'notification_settings' => $settings,
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        $user = $request->user();
        $defaults = $this->defaultNotificationSettings();

        $validated = $request->validate([
            'nearbyIncidents' => 'sometimes|boolean',
            'reportUpdates' => 'sometimes|boolean',
            'achievements' => 'sometimes|boolean',
            'agencyResponses' => 'sometimes|boolean',
            'alertAll' => 'sometimes|boolean',
            'alertEmergency' => 'sometimes|boolean',
            'alertCrime' => 'sometimes|boolean',
            'alertDisaster' => 'sometimes|boolean',
            'alertCelebrations' => 'sometimes|boolean',
            'alertPolitical' => 'sometimes|boolean',
        ]);

        $incoming = [];
        foreach ($validated as $key => $value) {
            if (!is_null($value)) {
                $incoming[$key] = (bool) $value;
            }
        }

        $settings = array_merge($defaults, $user->notification_settings ?? [], $incoming);
        $user->notification_settings = $settings;
        $user->save();

        return response()->json([
            'notification_settings' => $settings,
        ]);
    }

    private function defaultNotificationSettings(): array
    {
        return [
            'nearbyIncidents' => true,
            'reportUpdates' => true,
            'achievements' => true,
            'agencyResponses' => true,
            'alertAll' => true,
            'alertEmergency' => true,
            'alertCrime' => true,
            'alertDisaster' => true,
            'alertCelebrations' => true,
            'alertPolitical' => true,
        ];
    }

    public function rewards(Request $request)
    {
        $user = $request->user();
        $rewards = $user->rewards()
            ->with('report')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($reward) {
                return [
                    'id' => $reward->id,
                    'action' => $reward->reason,
                    'points' => $reward->points >= 0 ? "+{$reward->points}" : "{$reward->points}",
                    'time' => $reward->created_at->diffForHumans(),
                    'created_at' => $reward->created_at,
                    'report_id' => $reward->report_id,
                ];
            });

        return response()->json([
            'total_points' => $user->total_points ?? 0,
            'activities' => $rewards,
        ]);
    }

    public function achievements(Request $request)
    {
        $user = $request->user();
        $achievements = \App\Models\Achievement::where('is_active', true)
            ->orderBy('type')
            ->orderBy('points_required')
            ->get()
            ->map(function ($achievement) use ($user) {
                $earned = $achievement->isEarnedBy($user);
                return [
                    'id' => $achievement->id,
                    'key' => $achievement->key,
                    'name' => $achievement->name,
                    'description' => $achievement->description,
                    'icon' => $achievement->icon,
                    'color' => $achievement->color,
                    'type' => $achievement->type,
                    'earned' => $earned,
                    'earned_at' => $earned ? $user->achievements()->where('achievement_id', $achievement->id)->first()->pivot->earned_at : null,
                ];
            });

        return response()->json([
            'achievements' => $achievements,
        ]);
    }

    public function getPrivacySettings(Request $request)
    {
        $user = $request->user();
        $settings = PrivacyService::mergeWithDefaults($user->privacy_settings);
        
        return response()->json([
            'privacy_settings' => $settings,
        ]);
    }

    public function updatePrivacySettings(Request $request)
    {
        $validated = $request->validate([
            'profile_visibility' => 'sometimes|in:public,friends_only,private',
            'show_location' => 'sometimes|boolean',
            'show_reports' => 'sometimes|boolean',
            'show_achievements' => 'sometimes|boolean',
            'allow_comments' => 'sometimes|boolean',
            'default_report_privacy' => 'sometimes|in:public,anonymous,private',
            'data_sharing.analytics' => 'sometimes|boolean',
            'data_sharing.marketing' => 'sometimes|boolean',
            'data_sharing.research' => 'sometimes|boolean',
        ]);

        // Validate the settings structure
        if (!PrivacyService::validatePrivacySettings($validated)) {
            return response()->json([
                'message' => 'Invalid privacy settings',
            ], 422);
        }

        $user = $request->user();
        $currentSettings = $user->privacy_settings ?? [];
        
        // Merge new settings with existing ones
        $newSettings = array_merge($currentSettings, $validated);
        
        $user->privacy_settings = $newSettings;
        $user->save();

        return response()->json([
            'message' => 'Privacy settings updated successfully',
            'privacy_settings' => PrivacyService::mergeWithDefaults($newSettings),
        ]);
    }

    public function completeOnboarding(Request $request)
    {
        $user = $request->user();
        $user->update(['has_completed_onboarding' => true]);

        return response()->json([
            'message' => 'Onboarding completed',
            'user' => $user
        ]);
    }
}
