<?php

namespace App\Support;

use App\Enums\CategoryStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SiteSetting;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array{
     *   order: Order,
     *   line_items: array<int, array<string, mixed>>,
     *   totals: array<string, string|float|int>,
     *   whatsapp_number: string|null
     * }
     */
    public function createOrRefreshDraft(array $payload, array $items, ReferenceGenerator $references): array
    {
        $validatedItems = $this->validateItems(collect($items));

        $subtotal = collect($validatedItems)->sum(fn (array $item) => $item['line_total']);
        $deliveryFee = 0.0;
        $discount = 0.0;
        $estimatedTotal = $subtotal + $deliveryFee - $discount;

        /** @var Order $order */
        $order = Order::query()->updateOrCreate(
            ['order_number' => $payload['order_number'] ?? $references->nextOrderNumber()],
            [
                'customer_name' => $payload['customer_name'],
                'customer_email' => $payload['customer_email'] ?? null,
                'customer_phone' => $payload['customer_phone'],
                'delivery_type' => $payload['delivery_type'],
                'delivery_address' => $payload['delivery_address'] ?? null,
                'preferred_fulfillment_at' => $payload['preferred_fulfillment_at'] ?? null,
                'customer_notes' => $payload['customer_notes'] ?? null,
                'currency_code' => config('visemfood.default_currency_code', 'USD'),
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount_amount' => $discount,
                'estimated_total' => $estimatedTotal,
                'status' => OrderStatus::Draft,
                'ordered_at' => now(),
            ],
        );

        $order->items()->delete();

        foreach ($validatedItems as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'product_variant_id' => $item['product_variant_id'],
                'product_name' => $item['product_name'],
                'variant_name' => $item['variant_name'],
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'line_total' => $item['line_total'],
                'meta' => [
                    'slug' => $item['slug'],
                ],
            ]);
        }

        $this->recordStatus($order, null, OrderStatus::Draft->value, 'Draft order created from checkout preview.');

        $settings = SiteSetting::query()->first();

        return [
            'order' => $order->load('items'),
            'line_items' => $validatedItems,
            'totals' => [
                'subtotal' => round($subtotal, 2),
                'delivery_fee' => round($deliveryFee, 2),
                'discount_amount' => round($discount, 2),
                'estimated_total' => round($estimatedTotal, 2),
            ],
            'whatsapp_number' => $settings?->whatsapp_order_number,
        ];
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    private function validateItems(Collection $items): array
    {
        if ($items->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => ['Add at least one item to continue checkout.'],
            ]);
        }

        return $items->map(function (array $item, int $index): array {
            $productId = ! empty($item['product_id']) ? (int) $item['product_id'] : null;
            $slug = (string) ($item['slug'] ?? '');
            $quantity = (int) ($item['quantity'] ?? 0);

            if (($productId === null && $slug === '') || $quantity < 1) {
                throw ValidationException::withMessages([
                    "items.$index" => ['Each cart line must include a valid product reference and quantity.'],
                ]);
            }

            $productQuery = Product::query()
                ->with(['variants' => fn ($query) => $query->orderByDesc('is_default')->orderBy('sort_order')])
                ->where('status', PublicationStatus::Published->value)
                ->whereHas('category', fn ($query) => $query->where('status', CategoryStatus::Active->value));

            if ($productId !== null) {
                $productQuery->whereKey($productId);
            } else {
                $productQuery->where('slug', $slug);
            }

            $product = $productQuery->first();

            if ($product === null || ! $product->available_for_order) {
                throw ValidationException::withMessages([
                    "items.$index" => [($slug !== '' ? $slug : "Product {$productId}") . ' is not currently available for ordering.'],
                ]);
            }

            if ($slug !== '' && $product->slug !== $slug) {
                throw ValidationException::withMessages([
                    "items.$index.slug" => ['The selected product reference does not match the current product.'],
                ]);
            }

            if ($product->availability_status === ProductAvailabilityStatus::Unavailable) {
                throw ValidationException::withMessages([
                    "items.$index" => ["{$product->name} is currently unavailable."],
                ]);
            }

            $variant = null;

            if (! empty($item['variant_id'])) {
                $variant = $product->variants->firstWhere('id', (int) $item['variant_id']);

                if ($variant === null) {
                    throw ValidationException::withMessages([
                        "items.$index.variant_id" => ["The selected option for {$product->name} is invalid."],
                    ]);
                }
            }

            if ($variant === null) {
                $variant = $product->variants->firstWhere('is_default', true) ?? $product->variants->first();
            }

            if ($variant?->availability_status === ProductAvailabilityStatus::Unavailable) {
                throw ValidationException::withMessages([
                    "items.$index.variant_id" => ["The selected option for {$product->name} is currently unavailable."],
                ]);
            }

            $unitPrice = (float) ($variant?->price ?? $product->base_price);
            $variantName = $variant?->name;

            return [
                'slug' => $slug,
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'product_name' => $product->name,
                'variant_name' => $variantName,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'line_total' => round($unitPrice * $quantity, 2),
            ];
        })->all();
    }

    public function markWhatsAppStarted(Order $order): void
    {
        $fromStatus = $order->status?->value;

        $order->forceFill([
            'status' => OrderStatus::WhatsAppPending,
            'whatsapp_started_at' => now(),
        ])->save();

        $this->recordStatus(
            $order,
            $fromStatus,
            OrderStatus::WhatsAppPending->value,
            'Customer initiated WhatsApp checkout.',
        );
    }

    public function buildWhatsAppUrl(Order $order): array
    {
        $settings = SiteSetting::query()->first();
        $whatsAppNumber = preg_replace('/\D+/', '', (string) $settings?->whatsapp_order_number);

        if ($whatsAppNumber === '') {
            throw ValidationException::withMessages([
                'whatsapp' => ['WhatsApp ordering is not configured yet.'],
            ]);
        }

        $itemsText = $order->items
            ->map(function ($item) {
                $variant = $item->variant_name ? sprintf(' (%s)', $item->variant_name) : '';

                return sprintf(
                    '%d x %s%s',
                    $item->quantity,
                    $item->product_name,
                    $variant,
                );
            })
            ->implode("\n");

        $deliveryLine = $order->delivery_type->value === 'delivery'
            ? ($order->delivery_address ?: 'Delivery address to be confirmed')
            : 'Pickup';

        $preferredDate = $order->preferred_fulfillment_at?->format('Y-m-d') ?? 'To be confirmed';

        $message = trim(implode("\n\n", [
            'Hello VISEMFOOD,',
            'I would like to complete this order.',
            'Order Reference: '.$order->order_number,
            "Customer:\n{$order->customer_name}",
            "Items:\n{$itemsText}",
            'Estimated Total: '.config('visemfood.default_currency_symbol', '$').number_format((float) $order->estimated_total, 2),
            "Delivery:\n{$deliveryLine}",
            "Preferred Date:\n{$preferredDate}",
            'Please confirm availability and final pricing.',
            'Thank you.',
        ]));

        return [
            'number' => $whatsAppNumber,
            'message' => $message,
            'url' => 'https://wa.me/'.$whatsAppNumber.'?text='.rawurlencode($message),
        ];
    }

    private function recordStatus(Order $order, ?string $fromStatus, string $toStatus, string $notes): void
    {
        $alreadyExists = $order->statusHistory()
            ->where('from_status', $fromStatus)
            ->where('to_status', $toStatus)
            ->where('notes', $notes)
            ->exists();

        if ($alreadyExists) {
            return;
        }

        $order->statusHistory()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes,
        ]);
    }
}
