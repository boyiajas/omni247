<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientRewardsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('client');

        $rewards = $user->rewards()
            ->latest()
            ->limit(30)
            ->get()
            ->map(function ($reward) {
                return [
                    'id' => $reward->id,
                    'reason' => $reward->reason,
                    'points' => $reward->points,
                    'created_at' => $reward->created_at,
                ];
            });

        return response()->json(['data' => $rewards]);
    }
}
