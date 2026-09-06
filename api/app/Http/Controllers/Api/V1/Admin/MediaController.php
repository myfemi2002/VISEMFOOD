<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\MediaUploadRequest;
use App\Http\Resources\MediaAssetResource;
use App\Models\MediaAsset;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use App\Support\ImageUploadService;
use App\Support\MediaLibraryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request, MediaLibraryService $mediaLibrary): JsonResponse
    {
        $assets = $mediaLibrary->applyAdminLibraryContext(MediaAsset::query());

        if ($purpose = trim((string) $request->query('purpose', ''))) {
            $assets->where('purpose', $purpose);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $assets->where(function ($query) use ($search): void {
                $query
                    ->where('filename', 'like', '%'.$search.'%')
                    ->orWhere('original_filename', 'like', '%'.$search.'%')
                    ->orWhere('alt_text', 'like', '%'.$search.'%');
            });
        }

        $paginator = $assets
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            MediaAssetResource::collection($paginator->getCollection()),
            'Media assets fetched successfully.',
        );
    }

    public function specs(): JsonResponse
    {
        return ApiResponse::success(
            'Media specifications fetched successfully.',
            config('visemfood-media.specs', []),
        );
    }

    public function show(MediaAsset $mediaAsset, MediaLibraryService $mediaLibrary): JsonResponse
    {
        return ApiResponse::success(
            'Media asset fetched successfully.',
            new MediaAssetResource($mediaLibrary->loadAdminLibraryDetails($mediaAsset)),
        );
    }

    public function store(
        MediaUploadRequest $request,
        ImageUploadService $imageUploadService,
        MediaLibraryService $mediaLibrary,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $result = $imageUploadService->upload(
            $request->file('file'),
            $request->string('spec')->toString(),
            $request->input('alt_text'),
            $request->user()?->id,
        );
        $asset = $mediaLibrary->loadAdminLibraryDetails($result['asset']);

        $securityLogger->log(
            AdminSecurityEventType::MediaUploaded,
            $request,
            $request->user(),
            meta: [
                'media_asset_id' => $asset->id,
                'purpose' => $asset->purpose,
                'mime_type' => $asset->mime_type,
                'size_bytes' => $asset->size_bytes,
            ],
        );

        return ApiResponse::success('Image resized and uploaded successfully.', [
            'asset' => new MediaAssetResource($asset),
            'spec' => $result['spec'],
        ], 201);
    }

    public function destroy(
        Request $request,
        MediaAsset $mediaAsset,
        MediaLibraryService $mediaLibrary,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $usage = $mediaLibrary->delete($mediaAsset);

        $securityLogger->log(
            AdminSecurityEventType::MediaDeleted,
            $request,
            $request->user(),
            meta: [
                'media_asset_id' => $mediaAsset->id,
                'purpose' => $mediaAsset->purpose,
                'usage' => $usage,
            ],
        );

        return ApiResponse::success('Image deleted successfully.');
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 24), 100));
    }
}
