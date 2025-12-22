<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::orderBy('order')->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $this->validateCategory($request);
        $category = Category::create($data);

        AuditLogger::log($request->user(), 'admin.categories.create', 'Created category '.$category->name, $category, $data, $request);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $this->validateCategory($request, $category->id);
        $category->update($data);

        AuditLogger::log($request->user(), 'admin.categories.update', 'Updated category '.$category->name, $category, $data, $request);

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->reports()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has reports assigned. Please reassign or archive reports first.',
            ], 422);
        }

        $category->delete();

        AuditLogger::log($request->user(), 'admin.categories.delete', 'Deleted category '.$category->name, $category, [], $request);

        return response()->json(['message' => 'Category deleted']);
    }

    protected function validateCategory(Request $request, ?int $categoryId = null): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $categoryId,
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'is_emergency' => 'nullable|boolean',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $data['slug'] = Str::slug($data['slug'] ?? $data['name']);
        $data['order'] = $data['order'] ?? 0;
        $data['is_active'] = $request->boolean('is_active', true);
        $data['is_emergency'] = $request->boolean('is_emergency', false);

        return $data;
    }
}
