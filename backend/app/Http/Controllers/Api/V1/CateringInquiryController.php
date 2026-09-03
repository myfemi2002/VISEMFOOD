<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CateringInquiryStoreRequest;
use App\Http\Resources\CateringInquiryResource;
use App\Models\CateringInquiry;
use App\Support\ApiResponse;
use App\Support\ReferenceGenerator;
use Illuminate\Http\JsonResponse;

class CateringInquiryController extends Controller
{
    public function store(
        CateringInquiryStoreRequest $request,
        ReferenceGenerator $referenceGenerator,
    ): JsonResponse {
        $validated = $request->validated();

        /** @var CateringInquiry $inquiry */
        $inquiry = CateringInquiry::query()->create([
            ...$validated,
            'reference_number' => $referenceGenerator->nextCateringReference(),
        ]);

        $inquiry->load('cateringPackage');

        return ApiResponse::success(
            'Your catering request has been received. We\'ll contact you shortly.',
            new CateringInquiryResource($inquiry),
            201,
        );
    }
}