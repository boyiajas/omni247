<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Report;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get user's favorites.
     */
    public function index()
    {
        $favorites = Favorite::where('user_id', auth()->id())
            ->with(['report' => function($query) {
                $query->with(['user', 'category', 'media'])
                    ->withCount('comments');
            }])
            ->latest()
            ->get()
            ->pluck('report');

        return response()->json([
            'data' => $favorites,
            'count' => $favorites->count(),
        ]);
    }

    /**
     * Toggle favorite status (add/remove).
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
        ]);

        $userId = auth()->id();
        $reportId = $validated['report_id'];

        $favorite = Favorite::where('user_id', $userId)
            ->where('report_id', $reportId)
            ->first();

        if ($favorite) {
            // Remove favorite
            $favorite->delete();
            return response()->json([
                'favorited' => false,
                'message' => 'Removed from favorites',
            ]);
        } else {
            // Add favorite
            Favorite::create([
                'user_id' => $userId,
                'report_id' => $reportId,
            ]);
            return response()->json([
                'favorited' => true,
                'message' => 'Added to favorites',
            ], 201);
        }
    }

    /**
     * Check if user has favorited a report.
     */
    public function check($reportId)
    {
        $favorited = Favorite::where('user_id', auth()->id())
            ->where('report_id', $reportId)
            ->exists();

        return response()->json([
            'favorited' => $favorited,
        ]);
    }
}
