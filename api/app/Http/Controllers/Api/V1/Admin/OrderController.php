<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\OrderPricingUpdateRequest;
use App\Http\Requests\Api\Admin\OrderStatusUpdateRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['handledBy', 'items']);

        if ($status = $request->query('status')) {
            $orders->where('status', $status);
        }

        if ($deliveryType = $request->query('delivery_type')) {
            $orders->where('delivery_type', $deliveryType);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $orders->where(function ($query) use ($search): void {
                $query
                    ->where('order_number', 'like', '%'.$search.'%')
                    ->orWhere('customer_name', 'like', '%'.$search.'%')
                    ->orWhere('customer_email', 'like', '%'.$search.'%')
                    ->orWhere('customer_phone', 'like', '%'.$search.'%');
            });
        }

        if ($from = $request->query('from')) {
            $orders->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $orders->whereDate('created_at', '<=', $to);
        }

        $paginator = $orders
            ->latest()
            ->paginate($this->perPage($request));

        return ApiResponse::paginated(
            $paginator,
            OrderResource::collection($paginator->getCollection()),
            'Orders fetched successfully.',
        );
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items', 'handledBy', 'statusHistory']);

        return ApiResponse::success(
            'Order fetched successfully.',
            new OrderResource($order),
        );
    }

    public function updateStatus(OrderStatusUpdateRequest $request, Order $order): JsonResponse
    {
        $validated = $request->validated();
        $fromStatus = $order->status?->value ?? $order->status;
        $toStatus = $validated['status'];

        $attributes = [
            'status' => $toStatus,
            'handled_by_user_id' => $request->user()?->id,
        ];

        if ($toStatus === OrderStatus::WhatsAppPending->value && $order->whatsapp_started_at === null) {
            $attributes['whatsapp_started_at'] = now();
        }

        if ($toStatus === OrderStatus::Confirmed->value && $order->confirmed_at === null) {
            $attributes['confirmed_at'] = now();
        }

        if ($toStatus === OrderStatus::Completed->value && $order->completed_at === null) {
            $attributes['completed_at'] = now();
        }

        $order->update($attributes);

        $order->statusHistory()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by_user_id' => $request->user()?->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        $order->load(['items', 'handledBy', 'statusHistory']);

        return ApiResponse::success(
            'Order status updated successfully.',
            new OrderResource($order),
        );
    }

    public function updatePricing(OrderPricingUpdateRequest $request, Order $order): JsonResponse
    {
        $validated = $request->validated();

        $order->update([
            'final_total' => $validated['final_total'],
            'admin_notes' => $validated['admin_notes'] ?? $order->admin_notes,
            'handled_by_user_id' => $request->user()?->id,
        ]);

        $order->load(['items', 'handledBy', 'statusHistory']);

        return ApiResponse::success(
            'Final price saved successfully.',
            new OrderResource($order),
        );
    }

    private function perPage(Request $request): int
    {
        return max(1, min((int) $request->integer('per_page', 15), 100));
    }
}
