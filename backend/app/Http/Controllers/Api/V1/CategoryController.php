<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CategoryStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with('image')
            ->withCount([
                'products' => fn ($query) => $query
                    ->where('status', PublicationStatus::Published->value)
                    ->where('available_for_order', true)
                    ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value),
            ])
            ->where('status', CategoryStatus::Active->value)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            'Categories fetched successfully.',
            CategoryResource::collection($categories),
        );
    }

    public function products(Request $request, string $slug): JsonResponse
    {
        $category = Category::query()
            ->with('image')
            ->where('status', CategoryStatus::Active->value)
            ->where('slug', $slug)
            ->firstOrFail();

        $products = Product::query()
            ->with([
                'category.image',
                'variants' => fn ($query) => $query
                    ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
                    ->orderByDesc('is_default')
                    ->orderBy('sort_order')
                    ->orderBy('id'),
                'primaryMedia',
            ])
            ->where('category_id', $category->id)
            ->where('status', PublicationStatus::Published->value)
            ->where('available_for_order', true)
            ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
            ->whereHas('variants', fn ($query) => $query->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value));

        if ($search = trim((string) $request->query('search', ''))) {
            $products->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        if ($request->filled('featured')) {
            $products->where('featured', $request->boolean('featured'));
        }

        if ($type = $request->query('product_type')) {
            $products->where('product_type', $type);
        }

        $paginator = $products
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            [
                'category' => new CategoryResource($category),
                'products' => ProductResource::collection($paginator->getCollection()),
            ],
            'Category products fetched successfully.',
        );
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 12), 48));
    }
}
