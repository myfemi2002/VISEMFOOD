<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'delivery_type' => $this->delivery_type?->value ?? $this->delivery_type,
            'delivery_address' => $this->delivery_address,
            'preferred_fulfillment_at' => $this->preferred_fulfillment_at?->toIso8601String(),
            'customer_notes' => $this->customer_notes,
            'admin_notes' => $this->admin_notes,
            'currency_code' => $this->currency_code,
            'subtotal' => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'discount_amount' => (float) $this->discount_amount,
            'estimated_total' => (float) $this->estimated_total,
            'final_total' => $this->final_total !== null ? (float) $this->final_total : null,
            'status' => $this->status?->value ?? $this->status,
            'whatsapp_started_at' => $this->whatsapp_started_at?->toIso8601String(),
            'ordered_at' => $this->ordered_at?->toIso8601String(),
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => OrderItemResource::collection($this->items)),
            'handled_by' => $this->whenLoaded('handledBy', fn () => new UserResource($this->handledBy)),
            'status_history' => $this->whenLoaded('statusHistory', function () {
                return $this->statusHistory->map(fn ($history) => [
                    'id' => $history->id,
                    'from_status' => $history->from_status,
                    'to_status' => $history->to_status,
                    'notes' => $history->notes,
                    'changed_by_user_id' => $history->changed_by_user_id,
                    'created_at' => $history->created_at?->toIso8601String(),
                ])->values();
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
