<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CategoryStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request): JsonResponse
    {
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
            ->where('status', PublicationStatus::Published->value)
            ->whereHas('category', fn ($query) => $query->where('status', CategoryStatus::Active->value));

        if ($request->boolean('available_only', true)) {
            $products
                ->where('available_for_order', true)
                ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
                ->whereHas('variants', fn ($query) => $query->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value));
        }

        $category = trim((string) $request->query('category', ''));
        if ($category !== '' && strtolower($category) !== 'all') {
            $products->whereHas('category', function ($query) use ($category): void {
                $query
                    ->where('slug', $category)
                    ->orWhere('name', $category);
            });
        }

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

        $productTypes = $request->productTypes();
        if ($productTypes !== []) {
            $products->whereIn('product_type', $productTypes);
        }

        $paginator = $products
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            ProductResource::collection($paginator->getCollection()),
            'Products fetched successfully.',
        );
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::query()
            ->with([
                'category.image',
                'variants' => fn ($query) => $query
                    ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
                    ->orderByDesc('is_default')
                    ->orderBy('sort_order')
                    ->orderBy('id'),
                'media' => fn ($query) => $query->orderByPivot('sort_order')->orderBy('media_assets.id'),
            ])
            ->where('slug', $slug)
            ->where('status', PublicationStatus::Published->value)
            ->whereHas('category', fn ($query) => $query->where('status', CategoryStatus::Active->value))
            ->firstOrFail();

        return ApiResponse::success(
            'Product fetched successfully.',
            new ProductResource($product),
        );
    }

    private function perPage(ProductIndexRequest $request): int
    {
        return max(1, min((int) $request->integer('per_page', 12), 48));
    }
}
