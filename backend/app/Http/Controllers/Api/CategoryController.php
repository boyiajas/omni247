<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::active()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('order')
            ->get();

        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with('children')->findOrFail($id);
        return response()->json($category);
    }
}
