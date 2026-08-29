<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ContactMessageStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CateringInquiryResource;
use App\Http\Resources\ContactMessageResource;
use App\Http\Resources\OrderResource;
use App\Models\CateringInquiry;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $recentOrders = Order::query()
            ->with(['items', 'handledBy'])
            ->latest()
            ->limit(5)
            ->get();

        $recentCatering = CateringInquiry::query()
            ->with('assignedTo')
            ->latest()
            ->limit(5)
            ->get();

        $recentMessages = ContactMessage::query()
            ->with('assignedTo')
            ->latest()
            ->limit(5)
            ->get();

        return ApiResponse::success('Dashboard statistics fetched successfully.', [
            'stats' => [
                'products_total' => Product::query()->count(),
                'products_available' => Product::query()
                    ->where('status', PublicationStatus::Published->value)
                    ->where('available_for_order', true)
                    ->where('availability_status', '!=', ProductAvailabilityStatus::Unavailable->value)
                    ->count(),
                'orders_total' => Order::query()->count(),
                'orders_pending_whatsapp' => Order::query()
                    ->where('status', OrderStatus::WhatsAppPending->value)
                    ->count(),
                'orders_confirmed' => Order::query()
                    ->where('status', OrderStatus::Confirmed->value)
                    ->count(),
                'orders_completed' => Order::query()
                    ->where('status', OrderStatus::Completed->value)
                    ->count(),
                'catering_new' => CateringInquiry::query()
                    ->where('status', 'new')
                    ->count(),
                'contact_unread' => ContactMessage::query()
                    ->where('status', ContactMessageStatus::New->value)
                    ->count(),
            ],
            'recent_orders' => OrderResource::collection($recentOrders),
            'recent_catering' => CateringInquiryResource::collection($recentCatering),
            'recent_contact_messages' => ContactMessageResource::collection($recentMessages),
        ]);
    }
}
