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
        /** @var CateringInquiry $inquiry */
        $inquiry = CateringInquiry::query()->create([
            ...$request->validated(),
            'reference_number' => $referenceGenerator->nextCateringReference(),
        ]);

        return ApiResponse::success(
            'Catering inquiry submitted successfully.',
            new CateringInquiryResource($inquiry),
            201,
        );
    }
}
