<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = $this->settings();

        return ApiResponse::success(
            'Site settings fetched successfully.',
            new SiteSettingResource($settings),
        );
    }

    public function mediaSpecs(): JsonResponse
    {
        return ApiResponse::success(
            'Media specifications fetched successfully.',
            config('visemfood-media.specs', []),
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
