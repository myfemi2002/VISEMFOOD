<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ContactMessageStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\ContactMessageUpdateRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ContactMessage::query()
            ->with('assignedTo');

        if ($status = $request->query('status')) {
            $messages->where('status', $status);
        }

        if ($request->boolean('unread_only')) {
            $messages->where('status', ContactMessageStatus::New->value);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $messages->where(function ($query) use ($search): void {
                $query
                    ->where('reference_number', 'like', '%'.$search.'%')
                    ->orWhere('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('subject', 'like', '%'.$search.'%');
            });
        }

        $paginator = $messages
            ->latest()
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            ContactMessageResource::collection($paginator->getCollection()),
            'Contact messages fetched successfully.',
        );
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        if ($contactMessage->read_at === null) {
            $contactMessage->forceFill([
                'read_at' => now(),
                'status' => ContactMessageStatus::Read,
            ])->save();
        }

        $contactMessage->load('assignedTo');

        return ApiResponse::success(
            'Contact message fetched successfully.',
            new ContactMessageResource($contactMessage),
        );
    }

    public function update(
        ContactMessageUpdateRequest $request,
        ContactMessage $contactMessage,
    ): JsonResponse {
        $validated = $request->validated();

        $contactMessage->update([
            'status' => $validated['status'],
            'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? $contactMessage->assigned_to_user_id,
            'internal_notes' => $validated['internal_notes'] ?? $contactMessage->internal_notes,
            'read_at' => $validated['status'] === ContactMessageStatus::New->value
                ? null
                : ($contactMessage->read_at ?? now()),
        ]);

        $contactMessage->load('assignedTo');

        return ApiResponse::success(
            'Contact message updated successfully.',
            new ContactMessageResource($contactMessage),
        );
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
