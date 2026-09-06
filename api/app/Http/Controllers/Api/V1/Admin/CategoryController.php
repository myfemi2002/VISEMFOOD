<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CategoryStoreRequest;
use App\Http\Requests\Api\Admin\CategoryUpdateRequest;
use App\Http\Resources\AdminCategoryResource;
use App\Models\Category;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            AdminCategoryResource::collection($paginator->getCollection()),
            'Categories fetched successfully.',
        );
    }

    public function store(CategoryStoreRequest $request, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $validated = $request->validated();

        /** @var Category $category */
        $category = Category::query()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? str($validated['name'])->slug()->toString(),
            'description' => $validated['description'] ?? null,
            'image_media_id' => $validated['image_media_id'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        $category->load('image')->loadCount('products');

        $securityLogger->log(
            AdminSecurityEventType::CategoryCreated,
            $request,
            $request->user(),
            meta: [
                'category_id' => $category->id,
                'slug' => $category->slug,
                'status' => $category->status?->value ?? $category->status,
            ],
        );

        if ($category->image_media_id !== null) {
            $securityLogger->log(
                AdminSecurityEventType::CategoryImageChanged,
                $request,
                $request->user(),
                meta: [
                    'category_id' => $category->id,
                    'slug' => $category->slug,
                    'from' => null,
                    'to' => $category->image_media_id,
                ],
            );
        }

        return ApiResponse::success(
            'Category created successfully.',
            new AdminCategoryResource($category),
            201,
        );
    }

    public function show(Category $category): JsonResponse
    {
        $category->load('image')->loadCount('products');

        return ApiResponse::success(
            'Category fetched successfully.',
            new AdminCategoryResource($category),
        );
    }

    public function update(CategoryUpdateRequest $request, Category $category, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $validated = $request->validated();
        $previousStatus = $category->status?->value ?? $category->status;
        $previousImageMediaId = $category->image_media_id;

        $category->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $category->slug,
            'description' => $validated['description'] ?? null,
            'image_media_id' => $validated['image_media_id'] ?? null,
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        $category->load('image')->loadCount('products');

        $changedFields = collect(array_keys($category->getChanges()))
            ->reject(fn (string $field) => $field === 'updated_at')
            ->values()
            ->all();

        if ($changedFields !== []) {
            $securityLogger->log(
                AdminSecurityEventType::CategoryUpdated,
                $request,
                $request->user(),
                meta: [
                    'category_id' => $category->id,
                    'slug' => $category->slug,
                    'changed_fields' => $changedFields,
                ],
            );
        }

        if ($category->wasChanged('status')) {
            $securityLogger->log(
                AdminSecurityEventType::CategoryStatusChanged,
                $request,
                $request->user(),
                meta: [
                    'category_id' => $category->id,
                    'slug' => $category->slug,
                    'from' => $previousStatus,
                    'to' => $category->status?->value ?? $category->status,
                ],
            );
        }

        if ($category->wasChanged('image_media_id')) {
            $securityLogger->log(
                AdminSecurityEventType::CategoryImageChanged,
                $request,
                $request->user(),
                meta: [
                    'category_id' => $category->id,
                    'slug' => $category->slug,
                    'from' => $previousImageMediaId,
                    'to' => $category->image_media_id,
                ],
            );
        }

        return ApiResponse::success(
            'Category updated successfully.',
            new AdminCategoryResource($category),
        );
    }

    public function destroy(Request $request, Category $category, AdminSecurityLogger $securityLogger): JsonResponse
    {
        if ($category->products()->exists()) {
            return ApiResponse::error('This category contains products and cannot be deleted. Deactivate it instead.', 422, [
                'category' => ['This category still has products attached to it. Deactivate it instead.'],
            ]);
        }

        $securityLogger->log(
            AdminSecurityEventType::CategoryDeleted,
            $request,
            $request->user(),
            meta: [
                'category_id' => $category->id,
                'slug' => $category->slug,
            ],
        );

        $category->delete();

        return ApiResponse::success('Category deleted successfully.');
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
