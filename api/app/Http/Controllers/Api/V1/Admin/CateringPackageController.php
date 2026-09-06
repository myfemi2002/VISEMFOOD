<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CateringPackageStoreRequest;
use App\Http\Requests\Api\Admin\CateringPackageUpdateRequest;
use App\Http\Resources\AdminCateringPackageResource;
use App\Models\CateringPackage;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CateringPackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $packages = CateringPackage::query()
            ->with('image')
            ->withCount('inquiries');

        if ($status = $request->query('status')) {
            $packages->where('status', $status);
        }

        if ($request->filled('featured')) {
            $packages->where('featured', $request->boolean('featured'));
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $packages->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        $paginator = $packages
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            AdminCateringPackageResource::collection($paginator->getCollection()),
            'Catering packages fetched successfully.',
        );
    }

    public function store(CateringPackageStoreRequest $request, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $validated = $request->validated();

        /** @var CateringPackage $package */
        $package = CateringPackage::query()->create($this->packageAttributes($validated));
        $package->load('image')->loadCount('inquiries');

        $securityLogger->log(
            AdminSecurityEventType::CateringPackageCreated,
            $request,
            $request->user(),
            meta: [
                'catering_package_id' => $package->id,
                'slug' => $package->slug,
                'status' => $package->status?->value ?? $package->status,
            ],
        );

        return ApiResponse::success(
            'Catering package created successfully.',
            new AdminCateringPackageResource($package),
            201,
        );
    }

    public function show(CateringPackage $cateringPackage): JsonResponse
    {
        $cateringPackage->load('image')->loadCount('inquiries');

        return ApiResponse::success(
            'Catering package fetched successfully.',
            new AdminCateringPackageResource($cateringPackage),
        );
    }

    public function update(
        CateringPackageUpdateRequest $request,
        CateringPackage $cateringPackage,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $validated = $request->validated();
        $previousStatus = $cateringPackage->status?->value ?? $cateringPackage->status;

        $cateringPackage->fill($this->packageAttributes($validated, $cateringPackage));
        $changedFields = array_keys($cateringPackage->getDirty());

        if ($changedFields !== []) {
            $cateringPackage->save();
        }

        $cateringPackage->load('image')->loadCount('inquiries');

        if ($changedFields !== []) {
            $securityLogger->log(
                AdminSecurityEventType::CateringPackageUpdated,
                $request,
                $request->user(),
                meta: [
                    'catering_package_id' => $cateringPackage->id,
                    'slug' => $cateringPackage->slug,
                    'changed_fields' => $changedFields,
                ],
            );
        }

        if ($cateringPackage->wasChanged('status')) {
            $securityLogger->log(
                AdminSecurityEventType::CateringPackageStatusChanged,
                $request,
                $request->user(),
                meta: [
                    'catering_package_id' => $cateringPackage->id,
                    'slug' => $cateringPackage->slug,
                    'from' => $previousStatus,
                    'to' => $cateringPackage->status?->value ?? $cateringPackage->status,
                ],
            );
        }

        return ApiResponse::success(
            'Catering package updated successfully.',
            new AdminCateringPackageResource($cateringPackage),
        );
    }

    public function destroy(
        Request $request,
        CateringPackage $cateringPackage,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        if ($cateringPackage->inquiries()->exists()) {
            return ApiResponse::validation(
                'Unable to delete catering package.',
                [
                    'package' => ['This catering package is referenced by existing inquiries and cannot be deleted. Deactivate it instead.'],
                ],
            );
        }

        $securityLogger->log(
            AdminSecurityEventType::CateringPackageDeleted,
            $request,
            $request->user(),
            meta: [
                'catering_package_id' => $cateringPackage->id,
                'slug' => $cateringPackage->slug,
                'name' => $cateringPackage->name,
            ],
        );

        $cateringPackage->delete();

        return ApiResponse::success('Catering package deleted successfully.');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function packageAttributes(array $validated, ?CateringPackage $package = null): array
    {
        $inclusions = collect($validated['inclusions'] ?? [])
            ->map(fn (mixed $value) => is_string($value) ? trim($value) : '')
            ->filter()
            ->values()
            ->all();

        return [
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $package?->slug ?? Str::slug($validated['name']),
            'short_description' => $validated['short_description'] ?? null,
            'description' => $validated['description'] ?? null,
            'starting_price' => $validated['starting_price'],
            'currency_code' => config('visemfood.default_currency_code', 'USD'),
            'minimum_guests' => $validated['minimum_guests'],
            'maximum_guests' => $validated['maximum_guests'] ?? null,
            'image_media_id' => $validated['image_media_id'] ?? null,
            'inclusions' => $inclusions,
            'featured' => (bool) ($validated['featured'] ?? false),
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'] ?? 0,
        ];
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}