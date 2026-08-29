<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\MediaUploadRequest;
use App\Http\Resources\MediaAssetResource;
use App\Support\ApiResponse;
use App\Support\ImageUploadService;
use Illuminate\Http\JsonResponse;

class MediaController extends Controller
{
    public function specs(): JsonResponse
    {
        return ApiResponse::success(
            'Media specifications fetched successfully.',
            config('visemfood-media.specs', []),
        );
    }

    public function store(MediaUploadRequest $request, ImageUploadService $imageUploadService): JsonResponse
    {
        $result = $imageUploadService->upload(
            $request->file('file'),
            $request->string('spec')->toString(),
            $request->input('alt_text'),
        );

        return ApiResponse::success('Image resized and uploaded successfully.', [
            'asset' => new MediaAssetResource($result['asset']),
            'spec' => $result['spec'],
        ], 201);
    }
}
