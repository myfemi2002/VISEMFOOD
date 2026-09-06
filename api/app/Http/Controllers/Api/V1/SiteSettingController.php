<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicSiteSettingResource;
use App\Support\ApiResponse;
use App\Support\SiteSettingsService;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(SiteSettingsService $siteSettings): JsonResponse
    {
        $settings = $siteSettings->getOrCreate();

        return ApiResponse::success(
            'Site settings fetched successfully.',
            new PublicSiteSettingResource($settings),
        );
    }

    public function mediaSpecs(): JsonResponse
    {
        return ApiResponse::success(
            'Media specifications fetched successfully.',
            config('visemfood-media.specs', []),
        );
    }

}
