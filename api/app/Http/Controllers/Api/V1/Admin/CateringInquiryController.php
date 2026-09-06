<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CateringInquiryUpdateRequest;
use App\Http\Resources\AdminCateringInquiryResource;
use App\Models\CateringInquiry;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CateringInquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $inquiries = CateringInquiry::query()
            ->with(['assignedTo', 'cateringPackage.image']);

        if ($status = $request->query('status')) {
            $inquiries->where('status', $status);
        }

        if ($packageId = $request->query('catering_package_id')) {
            $inquiries->where('catering_package_id', $packageId);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $inquiries->where(function ($query) use ($search): void {
                $query
                    ->where('reference_number', 'like', '%'.$search.'%')
                    ->orWhere('customer_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('event_type', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%');
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
            AdminCateringInquiryResource::collection($paginator->getCollection()),
            'Catering inquiries fetched successfully.',
        );
    }

    public function show(CateringInquiry $cateringInquiry): JsonResponse
    {
        $cateringInquiry->load(['assignedTo', 'cateringPackage.image']);

        return ApiResponse::success(
            'Catering inquiry fetched successfully.',
            new AdminCateringInquiryResource($cateringInquiry),
        );
    }

    public function update(
        CateringInquiryUpdateRequest $request,
        CateringInquiry $cateringInquiry,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $validated = $request->validated();
        $previousStatus = $cateringInquiry->status?->value ?? $cateringInquiry->status;
        $previousNotes = $cateringInquiry->internal_notes;
        $previousAssignee = $cateringInquiry->assigned_to_user_id;

        $cateringInquiry->update([
            'status' => $validated['status'],
            'assigned_to_user_id' => $validated['assigned_to_user_id'] ?? $cateringInquiry->assigned_to_user_id,
            'internal_notes' => $validated['internal_notes'] ?? null,
        ]);

        $cateringInquiry->load(['assignedTo', 'cateringPackage.image']);

        if ($previousStatus !== ($cateringInquiry->status?->value ?? $cateringInquiry->status)) {
            $securityLogger->log(
                AdminSecurityEventType::CateringInquiryStatusChanged,
                $request,
                $request->user(),
                meta: [
                    'catering_inquiry_id' => $cateringInquiry->id,
                    'reference_number' => $cateringInquiry->reference_number,
                    'from' => $previousStatus,
                    'to' => $cateringInquiry->status?->value ?? $cateringInquiry->status,
                ],
            );
        }

        if ($previousNotes !== $cateringInquiry->internal_notes || $previousAssignee !== $cateringInquiry->assigned_to_user_id) {
            $securityLogger->log(
                AdminSecurityEventType::CateringInquiryNotesUpdated,
                $request,
                $request->user(),
                meta: [
                    'catering_inquiry_id' => $cateringInquiry->id,
                    'reference_number' => $cateringInquiry->reference_number,
                    'assigned_to_user_id' => $cateringInquiry->assigned_to_user_id,
                    'notes_changed' => $previousNotes !== $cateringInquiry->internal_notes,
                    'assignee_changed' => $previousAssignee !== $cateringInquiry->assigned_to_user_id,
                ],
            );
        }

        return ApiResponse::success(
            'Catering inquiry updated successfully.',
            new AdminCateringInquiryResource($cateringInquiry),
        );
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}