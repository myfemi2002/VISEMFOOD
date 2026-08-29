<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CategoryStoreRequest;
use App\Http\Requests\Api\Admin\CategoryUpdateRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->with('image')
            ->withCount('products');

        if ($status = $request->query('status')) {
            $categories->where('status', $status);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $categories->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        $paginator = $categories
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            CategoryResource::collection($paginator->getCollection()),
            'Categories fetched successfully.',
        );
    }

    public function store(CategoryStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /** @var Category $category */
        $category = Category::query()->create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug'] ?? $validated['name']),
            'description' => $validated['description'] ?? null,
            'image_media_id' => $validated['image_media_id'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        $category->load('image');

        return ApiResponse::success(
            'Category created successfully.',
            new CategoryResource($category),
            201,
        );
    }

    public function show(Category $category): JsonResponse
    {
        $category->load('image')->loadCount('products');

        return ApiResponse::success(
            'Category fetched successfully.',
            new CategoryResource($category),
        );
    }

    public function update(CategoryUpdateRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['slug'] ?? $validated['name']),
            'description' => $validated['description'] ?? null,
            'image_media_id' => $validated['image_media_id'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        $category->load('image')->loadCount('products');

        return ApiResponse::success(
            'Category updated successfully.',
            new CategoryResource($category),
        );
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return ApiResponse::error('Delete all products in this category before deleting it.', 422, [
                'category' => ['This category still has products attached to it.'],
            ]);
        }

        $category->delete();

        return ApiResponse::success('Category deleted successfully.');
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
