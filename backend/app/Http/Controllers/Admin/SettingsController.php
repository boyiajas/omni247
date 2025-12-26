<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Setting::query();

        // Optional: filter by group
        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        // Return grouped or flat list
        if ($request->boolean('grouped')) {
            return response()->json($settings->groupBy('group'));
        }

        return response()->json($settings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|unique:settings,key',
            'value' => 'nullable',
            'type' => 'required|in:boolean,string,number,json',
            'group' => 'required|in:general,notifications,reports,system',
            'description' => 'nullable|string',
        ]);

        $setting = \App\Models\Setting::create($validated);

        return response()->json($setting, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $key)
    {
        $setting = \App\Models\Setting::where('key', $key)->firstOrFail();

        return response()->json($setting);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $key)
    {
        $setting = \App\Models\Setting::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'value' => 'nullable',
            'type' => 'sometimes|in:boolean,string,number,json',
            'group' => 'sometimes|in:general,notifications,reports,system',
            'description' => 'nullable|string',
        ]);

        $setting->update($validated);

        return response()->json($setting);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $key)
    {
        $setting = \App\Models\Setting::where('key', $key)->firstOrFail();
        $setting->delete();

        return response()->json(['message' => 'Setting deleted successfully']);
    }
}
