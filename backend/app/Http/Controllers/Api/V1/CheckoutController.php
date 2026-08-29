<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CheckoutPreviewRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use App\Support\CheckoutService;
use App\Support\ReferenceGenerator;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function preview(
        CheckoutPreviewRequest $request,
        CheckoutService $checkoutService,
        ReferenceGenerator $referenceGenerator,
    ): JsonResponse {
        $validated = $request->validated();

        $result = $checkoutService->createOrRefreshDraft(
            $validated,
            $validated['items'],
            $referenceGenerator,
        );

        return ApiResponse::success(
            'Checkout preview created successfully.',
            [
                'order' => new OrderResource($result['order']),
                'line_items' => $result['line_items'],
                'totals' => $result['totals'],
                'whatsapp_number' => $result['whatsapp_number'],
            ],
            201,
        );
    }

    public function continueOnWhatsApp(string $orderNumber, CheckoutService $checkoutService): JsonResponse
    {
        /** @var Order $order */
        $order = Order::query()
            ->with(['items', 'statusHistory'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if ($order->whatsapp_started_at === null) {
            $checkoutService->markWhatsAppStarted($order);
            $order->refresh();
            $order->load(['items', 'statusHistory']);
        }

        $whatsApp = $checkoutService->buildWhatsAppUrl($order);

        return ApiResponse::success(
            'WhatsApp checkout prepared successfully.',
            [
                'order' => new OrderResource($order),
                'whatsapp' => $whatsApp,
            ],
        );
    }
}
