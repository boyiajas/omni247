<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientSettingsController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user('client');

        return response()->json([
            'theme' => $user->theme ?? 'light',
            'language' => $user->language ?? 'en',
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'nullable|in:light,dark,pink,grey,gold,emerald,ocean,violet,midnight,charcoal,obsidian,slate,indigoNight,amoled',
            'language' => 'nullable|in:en,yo',
        ]);

        $user = $request->user('client');
        $user->update(array_filter($validated, fn ($value) => $value !== null));

        return response()->json([
            'message' => 'Settings updated.',
            'theme' => $user->theme ?? 'light',
            'language' => $user->language ?? 'en',
        ]);
    }
}
