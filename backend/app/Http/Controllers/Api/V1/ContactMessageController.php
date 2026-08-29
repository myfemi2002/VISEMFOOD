<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ContactMessageStoreRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Support\ApiResponse;
use App\Support\ReferenceGenerator;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function store(
        ContactMessageStoreRequest $request,
        ReferenceGenerator $referenceGenerator,
    ): JsonResponse {
        /** @var ContactMessage $message */
        $message = ContactMessage::query()->create([
            ...$request->validated(),
            'reference_number' => $referenceGenerator->nextContactReference(),
        ]);

        return ApiResponse::success(
            'Contact message submitted successfully.',
            new ContactMessageResource($message),
            201,
        );
    }
}
