<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_name' => $this->business_name,
            'support_email' => $this->support_email,
            'support_phone' => $this->support_phone,
            'whatsapp_order_number' => $this->whatsapp_order_number,
            'whatsapp_contact_number' => $this->whatsapp_contact_number,
            'business_address' => $this->business_address,
            'business_hours' => $this->business_hours,
            'currency_code' => $this->currency_code,
            'currency_symbol' => $this->currency_symbol,
            'delivery_information' => $this->delivery_information,
            'checkout_notice' => $this->checkout_notice,
            'social_links' => $this->social_links ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
