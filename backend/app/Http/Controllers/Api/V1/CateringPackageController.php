<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CateringPackageStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CateringPackageResource;
use App\Models\CateringPackage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CateringPackageController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = CateringPackage::query()
            ->with('image')
            ->where('status', CateringPackageStatus::Active->value)
            ->orderByDesc('featured')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            'Catering packages fetched successfully.',
            CateringPackageResource::collection($packages),
        );
    }
}