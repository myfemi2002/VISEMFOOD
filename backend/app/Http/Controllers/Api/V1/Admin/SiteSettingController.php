<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\SiteSettingUpdateRequest;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return ApiResponse::success(
            'Site settings fetched successfully.',
            new SiteSettingResource($this->settings()),
        );
    }

    public function update(SiteSettingUpdateRequest $request): JsonResponse
    {
        $settings = $this->settings();
        $settings->update($request->validated());

        return ApiResponse::success(
            'Settings updated successfully.',
            new SiteSettingResource($settings->fresh()),
        );
    }

    private function settings(): SiteSetting
    {
        /** @var SiteSetting $settings */
        $settings = SiteSetting::query()->firstOrCreate(
            ['singleton_key' => 'default'],
            [
                'business_name' => config('app.name', 'VISEMFOOD'),
                'currency_code' => config('visemfood.default_currency_code', 'NGN'),
                'currency_symbol' => config('visemfood.default_currency_symbol', 'NGN'),
                'checkout_notice' => 'You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.',
            ],
        );

        return $settings;
    }
}
