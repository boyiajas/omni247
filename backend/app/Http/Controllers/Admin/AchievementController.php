<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index()
    {
        $achievements = Achievement::orderBy('type')->orderBy('points_required')->get();
        return response()->json($achievements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:achievements,key|max:255',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'type' => 'required|in:activity,tier,milestone',
            'criteria' => 'nullable|array',
            'points_required' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $achievement = Achievement::create($validated);
        return response()->json($achievement, 201);
    }

    public function show($id)
    {
        $achievement = Achievement::findOrFail($id);
        return response()->json($achievement);
    }

    public function update(Request $request, $id)
    {
        $achievement = Achievement::findOrFail($id);

        $validated = $request->validate([
            'key' => 'sometimes|string|max:255|unique:achievements,key,' . $id,
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string|max:255',
            'color' => 'sometimes|string|max:7',
            'type' => 'sometimes|in:activity,tier,milestone',
            'criteria' => 'nullable|array',
            'points_required' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $achievement->update($validated);
        return response()->json($achievement);
    }

    public function destroy($id)
    {
        $achievement = Achievement::findOrFail($id);
        $achievement->delete();
        return response()->json(['message' => 'Achievement deleted successfully']);
    }
}
