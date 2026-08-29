<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ProductAvailabilityStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\ProductAvailabilityUpdateRequest;
use App\Http\Requests\Api\Admin\ProductStoreRequest;
use App\Http\Requests\Api\Admin\ProductUpdateRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category.image', 'variants', 'media']);

        if ($categoryId = $request->query('category_id')) {
            $products->where('category_id', $categoryId);
        }

        if ($status = $request->query('status')) {
            $products->where('status', $status);
        }

        if ($availability = $request->query('availability_status')) {
            $products->where('availability_status', $availability);
        }

        if ($request->filled('featured')) {
            $products->where('featured', $request->boolean('featured'));
        }

        if ($type = $request->query('product_type')) {
            $products->where('product_type', $type);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $products->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%');
            });
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

    public function store(ProductStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $product = DB::transaction(function () use ($validated): Product {
            /** @var Product $product */
            $product = Product::query()->create([
                'category_id' => $validated['category_id'],
                'product_type' => $validated['product_type'],
                'name' => $validated['name'],
                'slug' => Str::slug($validated['slug'] ?? $validated['name']),
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'base_price' => $validated['base_price'],
                'compare_price' => $validated['compare_price'] ?? null,
                'currency_code' => $validated['currency_code'] ?? config('visemfood.default_currency_code', 'NGN'),
                'serving_size' => $validated['serving_size'] ?? null,
                'status' => $validated['status'],
                'availability_status' => $validated['availability_status'],
                'featured' => (bool) ($validated['featured'] ?? false),
                'available_for_order' => (bool) ($validated['available_for_order'] ?? true),
                'preparation_time_minutes' => $validated['preparation_time_minutes'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'ordering_notes' => $validated['ordering_notes'] ?? null,
            ]);

            $this->syncVariants($product, $validated['variants'] ?? []);
            $this->syncMedia($product, $validated['media_ids'] ?? [], $validated['primary_media_id'] ?? null);

            return $product;
        });

        $product = $this->loadProduct($product);

        return ApiResponse::success(
            'Product created successfully.',
            new ProductResource($product),
            201,
        );
    }

    public function show(Product $product): JsonResponse
    {
        return ApiResponse::success(
            'Product fetched successfully.',
            new ProductResource($this->loadProduct($product)),
        );
    }

    public function update(ProductUpdateRequest $request, Product $product): JsonResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $product): void {
            $product->update([
                'category_id' => $validated['category_id'],
                'product_type' => $validated['product_type'],
                'name' => $validated['name'],
                'slug' => Str::slug($validated['slug'] ?? $validated['name']),
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'base_price' => $validated['base_price'],
                'compare_price' => $validated['compare_price'] ?? null,
                'currency_code' => $validated['currency_code'] ?? config('visemfood.default_currency_code', 'NGN'),
                'serving_size' => $validated['serving_size'] ?? null,
                'status' => $validated['status'],
                'availability_status' => $validated['availability_status'],
                'featured' => (bool) ($validated['featured'] ?? false),
                'available_for_order' => (bool) ($validated['available_for_order'] ?? true),
                'preparation_time_minutes' => $validated['preparation_time_minutes'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'ordering_notes' => $validated['ordering_notes'] ?? null,
            ]);

            if (array_key_exists('variants', $validated)) {
                $this->syncVariants($product, $validated['variants'] ?? []);
            }

            if (array_key_exists('media_ids', $validated) || array_key_exists('primary_media_id', $validated)) {
                $this->syncMedia($product, $validated['media_ids'] ?? [], $validated['primary_media_id'] ?? null);
            }
        });

        return ApiResponse::success(
            'Product updated successfully.',
            new ProductResource($this->loadProduct($product)),
        );
    }

    public function updateAvailability(
        ProductAvailabilityUpdateRequest $request,
        Product $product,
    ): JsonResponse {
        $validated = $request->validated();

        $product->update([
            'availability_status' => $validated['availability_status'],
            'status' => $validated['status'] ?? $product->status,
            'available_for_order' => $validated['available_for_order'] ?? $product->available_for_order,
        ]);

        return ApiResponse::success(
            'Product availability updated successfully.',
            new ProductResource($this->loadProduct($product)),
        );
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return ApiResponse::success('Product deleted successfully.');
    }

    private function syncVariants(Product $product, array $variants): void
    {
        if ($variants === []) {
            if (! $product->variants()->exists()) {
                $product->variants()->create([
                    'name' => $product->serving_size ?: 'Standard',
                    'slug' => Str::slug(($product->serving_size ?: 'standard').'-'.$product->name),
                    'portion_label' => $product->serving_size,
                    'price' => $product->base_price,
                    'compare_price' => $product->compare_price,
                    'currency_code' => $product->currency_code,
                    'availability_status' => $product->availability_status?->value ?? ProductAvailabilityStatus::Available->value,
                    'is_default' => true,
                    'sort_order' => 0,
                ]);
            }

            return;
        }

        $keepIds = [];
        $hasDefault = collect($variants)->contains(fn (array $variant): bool => (bool) ($variant['is_default'] ?? false));

        foreach ($variants as $index => $variantData) {
            $payload = [
                'name' => $variantData['name'],
                'slug' => Str::slug($variantData['name']),
                'sku' => $variantData['sku'] ?? null,
                'portion_label' => $variantData['portion_label'] ?? null,
                'price' => $variantData['price'],
                'compare_price' => $variantData['compare_price'] ?? null,
                'currency_code' => $product->currency_code,
                'availability_status' => $variantData['availability_status'] ?? ($product->availability_status?->value ?? ProductAvailabilityStatus::Available->value),
                'is_default' => $hasDefault ? (bool) ($variantData['is_default'] ?? false) : $index === 0,
                'sort_order' => $variantData['sort_order'] ?? $index,
            ];

            $variant = null;
            if (! empty($variantData['id'])) {
                $variant = $product->variants()->whereKey($variantData['id'])->first();
            }

            if ($variant instanceof ProductVariant) {
                $variant->update($payload);
            } else {
                $variant = $product->variants()->create($payload);
            }

            $keepIds[] = $variant->id;
        }

        $product->variants()->whereNotIn('id', $keepIds)->delete();

        if (! $product->variants()->where('is_default', true)->exists()) {
            $product->variants()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->limit(1)
                ->update(['is_default' => true]);
        }
    }

    /**
     * @param  array<int, int|string>  $mediaIds
     */
    private function syncMedia(Product $product, array $mediaIds, ?int $primaryMediaId): void
    {
        $mediaIds = array_values(array_unique(array_map('intval', $mediaIds)));

        if ($primaryMediaId !== null && ! in_array($primaryMediaId, $mediaIds, true)) {
            $mediaIds[] = $primaryMediaId;
        }

        $payload = [];

        foreach ($mediaIds as $index => $mediaId) {
            $payload[$mediaId] = [
                'is_primary' => $primaryMediaId !== null ? $mediaId === $primaryMediaId : $index === 0,
                'sort_order' => $index,
            ];
        }

        $product->media()->sync($payload);
    }

    private function loadProduct(Product $product): Product
    {
        return $product->load([
            'category.image',
            'variants' => fn ($query) => $query->orderByDesc('is_default')->orderBy('sort_order')->orderBy('id'),
            'media',
        ]);
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
