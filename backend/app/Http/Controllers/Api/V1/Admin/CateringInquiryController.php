<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CateringInquiryUpdateRequest;
use App\Http\Resources\CateringInquiryResource;
use App\Models\CateringInquiry;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CateringInquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $inquiries = CateringInquiry::query()
            ->with('assignedTo');

        if ($status = $request->query('status')) {
            $inquiries->where('status', $status);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $inquiries->where(function ($query) use ($search): void {
                $query
                    ->where('reference_number', 'like', '%'.$search.'%')
                    ->orWhere('customer_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('event_type', 'like', '%'.$search.'%');
            });
        }

        if ($eventDate = $request->query('event_date')) {
            $inquiries->whereDate('event_date', $eventDate);
        }

        if ($from = $request->query('from')) {
            $inquiries->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $inquiries->whereDate('created_at', '<=', $to);
        }

        $paginator = $inquiries
            ->latest()
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            CateringInquiryResource::collection($paginator->getCollection()),
            'Catering inquiries fetched successfully.',
        );
    }

    public function show(CateringInquiry $cateringInquiry): JsonResponse
    {
        $cateringInquiry->load('assignedTo');

        return ApiResponse::success(
            'Catering inquiry fetched successfully.',
            new CateringInquiryResource($cateringInquiry),
        );
    }

    public function update(
        CateringInquiryUpdateRequest $request,
        CateringInquiry $cateringInquiry,
    ): JsonResponse {
        $validated = $request->validated();

        $cateringInquiry->update([
            'status' => $validated['status'],
            'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? $cateringInquiry->assigned_to_user_id,
            'internal_notes' => $validated['internal_notes'] ?? $cateringInquiry->internal_notes,
        ]);

        $cateringInquiry->load('assignedTo');

        return ApiResponse::success(
            'Catering inquiry updated successfully.',
            new CateringInquiryResource($cateringInquiry),
        );
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
