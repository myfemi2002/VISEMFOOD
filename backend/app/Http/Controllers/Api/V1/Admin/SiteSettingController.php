<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\SiteSettingUpdateRequest;
use App\Http\Resources\AdminSiteSettingResource;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use App\Support\SiteSettingsService;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(SiteSettingsService $siteSettings): JsonResponse
    {
        return ApiResponse::success(
            'Site settings fetched successfully.',
            new AdminSiteSettingResource($siteSettings->getOrCreate()),
        );
    }

    public function update(
        SiteSettingUpdateRequest $request,
        SiteSettingsService $siteSettings,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse
    {
        $settings = $siteSettings->getOrCreate();
        $payload = $siteSettings->normalizeForUpdate($request->validated(), $settings);
        $before = [
            'business_name' => $settings->business_name,
            'support_email' => $settings->support_email,
            'support_phone' => $settings->support_phone,
            'whatsapp_order_number' => $settings->whatsapp_order_number,
            'business_hours' => $settings->business_hours,
        ];

        $settings->update($payload);

        $securityLogger->log(
            AdminSecurityEventType::SettingsUpdated,
            $request,
            $request->user(),
            null,
            [
                'updated_fields' => array_keys($payload),
                'before' => $before,
                'after' => [
                    'business_name' => $settings->business_name,
                    'support_email' => $settings->support_email,
                    'support_phone' => $settings->support_phone,
                    'whatsapp_order_number' => $settings->whatsapp_order_number,
                    'business_hours' => $settings->business_hours,
                ],
            ],
        );

        return ApiResponse::success(
            'Settings updated successfully.',
            new AdminSiteSettingResource($settings->fresh()),
        );
    }
}
