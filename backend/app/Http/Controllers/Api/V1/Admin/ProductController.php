<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Enums\ProductAvailabilityStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\ProductAvailabilityUpdateRequest;
use App\Http\Requests\Api\Admin\ProductStoreRequest;
use App\Http\Requests\Api\Admin\ProductUpdateRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with([
                'category.image',
                'variants' => fn ($query) => $query->orderByDesc('is_default')->orderBy('sort_order')->orderBy('id'),
                'media',
            ]);

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
                    ->orWhere('short_description', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        $paginator = $products
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            AdminProductResource::collection($paginator->getCollection()),
            'Products fetched successfully.',
        );
    }

    public function store(ProductStoreRequest $request, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $validated = $request->validated();
        $variantAudit = $this->emptyVariantAudit();
        $mediaAudit = $this->emptyMediaAudit();

        $product = DB::transaction(function () use ($validated, &$variantAudit, &$mediaAudit): Product {
            /** @var Product $product */
            $product = Product::query()->create($this->productAttributes($validated));

            $variantAudit = $this->syncVariants($product, $validated['variants'] ?? []);
            $mediaAudit = $this->syncMedia($product, $validated['media_ids'] ?? [], $validated['primary_media_id'] ?? null);

            return $product;
        });

        $product = $this->loadProduct($product->refresh());

        $securityLogger->log(
            AdminSecurityEventType::ProductCreated,
            $request,
            $request->user(),
            meta: [
                'product_id' => $product->id,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'variant_count' => $product->variants->count(),
            ],
        );
        $this->logVariantEvents($request, $securityLogger, $variantAudit);
        $this->logMediaEvents($request, $securityLogger, $product, $mediaAudit);

        return ApiResponse::success(
            'Product created successfully.',
            new AdminProductResource($product),
            201,
        );
    }

    public function show(Product $product): JsonResponse
    {
        return ApiResponse::success(
            'Product fetched successfully.',
            new AdminProductResource($this->loadProduct($product)),
        );
    }

    public function update(
        ProductUpdateRequest $request,
        Product $product,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $validated = $request->validated();
        $changedFields = [];
        $variantAudit = $this->emptyVariantAudit();
        $mediaAudit = $this->emptyMediaAudit();
        $statusChangeMeta = null;

        DB::transaction(function () use (
            $validated,
            $product,
            &$changedFields,
            &$variantAudit,
            &$mediaAudit,
            &$statusChangeMeta,
        ): void {
            $originalStatus = (string) $product->getRawOriginal('status');
            $originalAvailability = (string) $product->getRawOriginal('availability_status');
            $originalAvailableForOrder = (bool) $product->getRawOriginal('available_for_order');

            $product->fill($this->productAttributes($validated, $product));
            $changedFields = array_keys($product->getDirty());

            if ($changedFields !== []) {
                $product->save();
            }

            if (array_key_exists('variants', $validated)) {
                $variantAudit = $this->syncVariants($product, $validated['variants'] ?? []);
            }

            if (array_key_exists('media_ids', $validated) || array_key_exists('primary_media_id', $validated)) {
                $mediaAudit = $this->syncMedia($product, $validated['media_ids'] ?? [], $validated['primary_media_id'] ?? null);
            }

            $currentStatus = (string) $product->getRawOriginal('status');
            $currentAvailability = (string) $product->getRawOriginal('availability_status');
            $currentAvailableForOrder = (bool) $product->getRawOriginal('available_for_order');

            if (
                $originalStatus !== $currentStatus
                || $originalAvailability !== $currentAvailability
                || $originalAvailableForOrder !== $currentAvailableForOrder
            ) {
                $statusChangeMeta = [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'from' => [
                        'status' => $originalStatus,
                        'availability_status' => $originalAvailability,
                        'available_for_order' => $originalAvailableForOrder,
                    ],
                    'to' => [
                        'status' => $currentStatus,
                        'availability_status' => $currentAvailability,
                        'available_for_order' => $currentAvailableForOrder,
                    ],
                ];
            }
        });

        $product = $this->loadProduct($product->refresh());

        if ($changedFields !== [] || $this->mediaAuditHasChanges($mediaAudit) || $this->variantAuditHasChanges($variantAudit)) {
            $securityLogger->log(
                AdminSecurityEventType::ProductUpdated,
                $request,
                $request->user(),
                meta: [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'changed_fields' => $changedFields,
                    'media_changes' => $this->summarizeMediaAudit($mediaAudit),
                    'variant_changes' => $this->summarizeVariantAudit($variantAudit),
                ],
            );
        }

        if ($statusChangeMeta !== null) {
            $securityLogger->log(
                AdminSecurityEventType::ProductStatusChanged,
                $request,
                $request->user(),
                meta: $statusChangeMeta,
            );
        }

        $this->logVariantEvents($request, $securityLogger, $variantAudit);
        $this->logMediaEvents($request, $securityLogger, $product, $mediaAudit);

        return ApiResponse::success(
            'Product updated successfully.',
            new AdminProductResource($product),
        );
    }

    public function updateAvailability(
        ProductAvailabilityUpdateRequest $request,
        Product $product,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $validated = $request->validated();
        $originalStatus = (string) $product->getRawOriginal('status');
        $originalAvailability = (string) $product->getRawOriginal('availability_status');
        $originalAvailableForOrder = (bool) $product->getRawOriginal('available_for_order');

        $product->update([
            'availability_status' => $validated['availability_status'],
            'status' => $validated['status'] ?? $product->status,
            'available_for_order' => $validated['available_for_order'] ?? $product->available_for_order,
        ]);

        $product = $this->loadProduct($product->refresh());

        if (
            $originalStatus !== (string) $product->getRawOriginal('status')
            || $originalAvailability !== (string) $product->getRawOriginal('availability_status')
            || $originalAvailableForOrder !== (bool) $product->getRawOriginal('available_for_order')
        ) {
            $securityLogger->log(
                AdminSecurityEventType::ProductStatusChanged,
                $request,
                $request->user(),
                meta: [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'from' => [
                        'status' => $originalStatus,
                        'availability_status' => $originalAvailability,
                        'available_for_order' => $originalAvailableForOrder,
                    ],
                    'to' => [
                        'status' => (string) $product->getRawOriginal('status'),
                        'availability_status' => (string) $product->getRawOriginal('availability_status'),
                        'available_for_order' => (bool) $product->getRawOriginal('available_for_order'),
                    ],
                ],
            );
        }

        return ApiResponse::success(
            'Product availability updated successfully.',
            new AdminProductResource($product),
        );
    }

    public function destroy(Request $request, Product $product, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $product = $this->loadProduct($product);

        if ($product->orderItems()->exists() || $product->variants()->whereHas('orderItems')->exists()) {
            return ApiResponse::validation(
                'Unable to delete product.',
                [
                    'product' => ['This product is referenced by existing orders and cannot be deleted. Archive or deactivate it instead.'],
                ],
            );
        }

        $variantAudit = [
            'created' => [],
            'updated' => [],
            'deleted' => $product->variants
                ->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                ])
                ->all(),
            'status_changed' => [],
        ];

        $productId = $product->id;
        $slug = $product->slug;
        $name = $product->name;

        $product->delete();

        $securityLogger->log(
            AdminSecurityEventType::ProductDeleted,
            $request,
            $request->user(),
            meta: [
                'product_id' => $productId,
                'slug' => $slug,
                'name' => $name,
            ],
        );
        $this->logVariantEvents($request, $securityLogger, $variantAudit);

        return ApiResponse::success('Product deleted successfully.');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function productAttributes(array $validated, ?Product $product = null): array
    {
        return [
            'category_id' => $validated['category_id'],
            'product_type' => $validated['product_type'],
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $product?->slug ?? Str::slug($validated['name']),
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'base_price' => $validated['base_price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'currency_code' => config('visemfood.default_currency_code', 'USD'),
            'serving_size' => $validated['serving_size'] ?? null,
            'status' => $validated['status'],
            'availability_status' => $validated['availability_status'],
            'featured' => (bool) ($validated['featured'] ?? false),
            'available_for_order' => (bool) ($validated['available_for_order'] ?? true),
            'preparation_time_minutes' => $validated['preparation_time_minutes'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'ordering_notes' => $validated['ordering_notes'] ?? null,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     * @return array{
     *   created: array<int, array{id:int, name:string}>,
     *   updated: array<int, array{id:int, name:string}>,
     *   deleted: array<int, array{id:int, name:string}>,
     *   status_changed: array<int, array{id:int, name:string, from:?string, to:string}>
     * }
     */
    private function syncVariants(Product $product, array $variants): array
    {
        $audit = $this->emptyVariantAudit();

        if ($variants === []) {
            if (! $product->variants()->exists()) {
                $variant = $product->variants()->create([
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

                $audit['created'][] = [
                    'id' => $variant->id,
                    'name' => $variant->name,
                ];
            }

            return $audit;
        }

        $keepIds = [];
        $hasExplicitDefault = collect($variants)->contains(fn (array $variant): bool => (bool) ($variant['is_default'] ?? false));
        $defaultAssigned = false;

        foreach ($variants as $index => $variantData) {
            $requestedDefault = (bool) ($variantData['is_default'] ?? false);
            $isDefault = $hasExplicitDefault ? (! $defaultAssigned && $requestedDefault) : ! $defaultAssigned;

            if ($isDefault) {
                $defaultAssigned = true;
            }

            $payload = [
                'name' => $variantData['name'],
                'slug' => Str::slug($variantData['name']),
                'sku' => $variantData['sku'] ?? null,
                'portion_label' => $variantData['portion_label'] ?? null,
                'description' => $variantData['description'] ?? null,
                'price' => $variantData['price'],
                'compare_price' => $variantData['compare_price'] ?? null,
                'currency_code' => $product->currency_code,
                'availability_status' => $variantData['availability_status'] ?? ($product->availability_status?->value ?? ProductAvailabilityStatus::Available->value),
                'is_default' => $isDefault,
                'sort_order' => $variantData['sort_order'] ?? $index,
            ];

            $variant = null;
            if (! empty($variantData['id'])) {
                $variant = $product->variants()->whereKey($variantData['id'])->first();

                if (! $variant instanceof ProductVariant) {
                    throw ValidationException::withMessages([
                        "variants.$index.id" => ['This variant does not belong to the selected product.'],
                    ]);
                }
            }

            if ($variant instanceof ProductVariant) {
                $originalAvailability = (string) $variant->getRawOriginal('availability_status');
                $variant->fill($payload);
                $dirty = array_keys($variant->getDirty());

                if ($dirty !== []) {
                    $variant->save();
                    $audit['updated'][] = [
                        'id' => $variant->id,
                        'name' => $variant->name,
                    ];

                    if (in_array('availability_status', $dirty, true)) {
                        $audit['status_changed'][] = [
                            'id' => $variant->id,
                            'name' => $variant->name,
                            'from' => $originalAvailability,
                            'to' => (string) $variant->getRawOriginal('availability_status'),
                        ];
                    }
                }
            } else {
                $variant = $product->variants()->create($payload);
                $audit['created'][] = [
                    'id' => $variant->id,
                    'name' => $variant->name,
                ];
            }

            $keepIds[] = $variant->id;
        }

        $variantsToRemove = $product->variants()
            ->whereNotIn('id', $keepIds)
            ->get();

        foreach ($variantsToRemove as $variant) {
            if ($variant->orderItems()->exists()) {
                $updates = [];
                $from = (string) $variant->getRawOriginal('availability_status');

                if ($from !== ProductAvailabilityStatus::Unavailable->value) {
                    $updates['availability_status'] = ProductAvailabilityStatus::Unavailable->value;
                }

                if ((bool) $variant->is_default) {
                    $updates['is_default'] = false;
                }

                if ($updates !== []) {
                    $variant->update($updates);
                    $audit['updated'][] = [
                        'id' => $variant->id,
                        'name' => $variant->name,
                    ];

                    if (array_key_exists('availability_status', $updates)) {
                        $audit['status_changed'][] = [
                            'id' => $variant->id,
                            'name' => $variant->name,
                            'from' => $from,
                            'to' => ProductAvailabilityStatus::Unavailable->value,
                        ];
                    }
                }

                continue;
            }

            $audit['deleted'][] = [
                'id' => $variant->id,
                'name' => $variant->name,
            ];
            $variant->delete();
        }

        $currentDefault = $product->variants()
            ->where('is_default', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->first();

        if ($currentDefault instanceof ProductVariant) {
            $product->variants()
                ->whereKeyNot($currentDefault->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        if (! $product->variants()->where('is_default', true)->exists()) {
            $fallbackDefault = $product->variants()
                ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->first()
                ?? $product->variants()->orderBy('sort_order')->orderBy('id')->first();

            if ($fallbackDefault instanceof ProductVariant) {
                $fallbackDefault->update(['is_default' => true]);
            }
        }

        return $audit;
    }

    /**
     * @param  array<int, int|string>  $mediaIds
     * @return array{
     *   attached: list<int>,
     *   detached: list<int>,
     *   previous_primary_media_id: ?int,
     *   current_primary_media_id: ?int
     * }
     */
    private function syncMedia(Product $product, array $mediaIds, ?int $primaryMediaId): array
    {
        $mediaIds = array_values(array_unique(array_map('intval', $mediaIds)));

        if ($primaryMediaId !== null && ! in_array($primaryMediaId, $mediaIds, true)) {
            $mediaIds[] = $primaryMediaId;
        }

        $resolvedPrimaryMediaId = $primaryMediaId ?? ($mediaIds[0] ?? null);
        $currentMedia = $product->media()->get();
        $currentMediaIds = $currentMedia->pluck('id')->map(fn ($value) => (int) $value)->all();
        $currentPrimaryMediaId = $currentMedia->first(
            fn ($media) => (bool) ($media->pivot?->is_primary ?? false),
        )?->id ?? $currentMedia->first()?->id;
        $attached = array_values(array_diff($mediaIds, $currentMediaIds));
        $detached = array_values(array_diff($currentMediaIds, $mediaIds));

        $payload = [];

        foreach ($mediaIds as $index => $mediaId) {
            $payload[$mediaId] = [
                'is_primary' => $resolvedPrimaryMediaId !== null ? $mediaId === $resolvedPrimaryMediaId : $index === 0,
                'sort_order' => $index,
            ];
        }

        $product->media()->sync($payload);

        return [
            'attached' => $attached,
            'detached' => $detached,
            'previous_primary_media_id' => $currentPrimaryMediaId ? (int) $currentPrimaryMediaId : null,
            'current_primary_media_id' => $resolvedPrimaryMediaId,
        ];
    }

    private function loadProduct(Product $product): Product
    {
        return $product->load([
            'category.image',
            'variants' => fn ($query) => $query->orderByDesc('is_default')->orderBy('sort_order')->orderBy('id'),
            'media' => fn ($query) => $query->orderByPivot('sort_order')->orderBy('media_assets.id'),
        ]);
    }

    /**
     * @return array{
     *   attached: list<int>,
     *   detached: list<int>,
     *   previous_primary_media_id: ?int,
     *   current_primary_media_id: ?int
     * }
     */
    private function emptyMediaAudit(): array
    {
        return [
            'attached' => [],
            'detached' => [],
            'previous_primary_media_id' => null,
            'current_primary_media_id' => null,
        ];
    }

    /**
     * @param  array{
     *   attached: list<int>,
     *   detached: list<int>,
     *   previous_primary_media_id: ?int,
     *   current_primary_media_id: ?int
     * }  $audit
     */
    private function mediaAuditHasChanges(array $audit): bool
    {
        return $audit['attached'] !== []
            || $audit['detached'] !== []
            || $audit['previous_primary_media_id'] !== $audit['current_primary_media_id'];
    }

    /**
     * @param  array{
     *   attached: list<int>,
     *   detached: list<int>,
     *   previous_primary_media_id: ?int,
     *   current_primary_media_id: ?int
     * }  $audit
     * @return array<string, mixed>
     */
    private function summarizeMediaAudit(array $audit): array
    {
        return [
            'attached_count' => count($audit['attached']),
            'detached_count' => count($audit['detached']),
            'previous_primary_media_id' => $audit['previous_primary_media_id'],
            'current_primary_media_id' => $audit['current_primary_media_id'],
        ];
    }

    /**
     * @param  array{
     *   attached: list<int>,
     *   detached: list<int>,
     *   previous_primary_media_id: ?int,
     *   current_primary_media_id: ?int
     * }  $audit
     */
    private function logMediaEvents(
        Request $request,
        AdminSecurityLogger $securityLogger,
        Product $product,
        array $audit,
    ): void {
        if ($audit['attached'] !== []) {
            $securityLogger->log(
                AdminSecurityEventType::ProductMediaAttached,
                $request,
                $request->user(),
                meta: [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'media_asset_ids' => $audit['attached'],
                ],
            );
        }

        if ($audit['detached'] !== []) {
            $securityLogger->log(
                AdminSecurityEventType::ProductMediaDetached,
                $request,
                $request->user(),
                meta: [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'media_asset_ids' => $audit['detached'],
                ],
            );
        }

        if ($audit['previous_primary_media_id'] !== $audit['current_primary_media_id']) {
            $securityLogger->log(
                AdminSecurityEventType::ProductPrimaryImageChanged,
                $request,
                $request->user(),
                meta: [
                    'product_id' => $product->id,
                    'slug' => $product->slug,
                    'from' => $audit['previous_primary_media_id'],
                    'to' => $audit['current_primary_media_id'],
                ],
            );
        }
    }

    /**
     * @return array{
     *   created: array<int, array{id:int, name:string}>,
     *   updated: array<int, array{id:int, name:string}>,
     *   deleted: array<int, array{id:int, name:string}>,
     *   status_changed: array<int, array{id:int, name:string, from:?string, to:string}>
     * }
     */
    private function emptyVariantAudit(): array
    {
        return [
            'created' => [],
            'updated' => [],
            'deleted' => [],
            'status_changed' => [],
        ];
    }

    /**
     * @param  array{
     *   created: array<int, array{id:int, name:string}>,
     *   updated: array<int, array{id:int, name:string}>,
     *   deleted: array<int, array{id:int, name:string}>,
     *   status_changed: array<int, array{id:int, name:string, from:?string, to:string}>
     * }  $audit
     */
    private function variantAuditHasChanges(array $audit): bool
    {
        return $audit['created'] !== []
            || $audit['updated'] !== []
            || $audit['deleted'] !== []
            || $audit['status_changed'] !== [];
    }

    /**
     * @param  array{
     *   created: array<int, array{id:int, name:string}>,
     *   updated: array<int, array{id:int, name:string}>,
     *   deleted: array<int, array{id:int, name:string}>,
     *   status_changed: array<int, array{id:int, name:string, from:?string, to:string}>
     * }  $audit
     * @return array<string, int>
     */
    private function summarizeVariantAudit(array $audit): array
    {
        return [
            'created' => count($audit['created']),
            'updated' => count($audit['updated']),
            'deleted' => count($audit['deleted']),
            'status_changed' => count($audit['status_changed']),
        ];
    }

    /**
     * @param  array{
     *   created: array<int, array{id:int, name:string}>,
     *   updated: array<int, array{id:int, name:string}>,
     *   deleted: array<int, array{id:int, name:string}>,
     *   status_changed: array<int, array{id:int, name:string, from:?string, to:string}>
     * }  $audit
     */
    private function logVariantEvents(Request $request, AdminSecurityLogger $securityLogger, array $audit): void
    {
        foreach ($audit['created'] as $variant) {
            $securityLogger->log(
                AdminSecurityEventType::VariantCreated,
                $request,
                $request->user(),
                meta: [
                    'variant_id' => $variant['id'],
                    'name' => $variant['name'],
                ],
            );
        }

        foreach ($audit['updated'] as $variant) {
            $securityLogger->log(
                AdminSecurityEventType::VariantUpdated,
                $request,
                $request->user(),
                meta: [
                    'variant_id' => $variant['id'],
                    'name' => $variant['name'],
                ],
            );
        }

        foreach ($audit['deleted'] as $variant) {
            $securityLogger->log(
                AdminSecurityEventType::VariantDeleted,
                $request,
                $request->user(),
                meta: [
                    'variant_id' => $variant['id'],
                    'name' => $variant['name'],
                ],
            );
        }

        foreach ($audit['status_changed'] as $variant) {
            $securityLogger->log(
                AdminSecurityEventType::VariantStatusChanged,
                $request,
                $request->user(),
                meta: [
                    'variant_id' => $variant['id'],
                    'name' => $variant['name'],
                    'from' => $variant['from'],
                    'to' => $variant['to'],
                ],
            );
        }
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
