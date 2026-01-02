<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user('client');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'total_reports' => $user->total_reports,
                'total_points' => $user->total_points,
                'reputation_score' => $user->reputation_score,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        $user = $request->user('client');
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated.',
            'user' => $user->only(['id', 'name', 'email', 'phone', 'role']),
        ]);
    }
}
