<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
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
        return response()->json($request->user());
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
