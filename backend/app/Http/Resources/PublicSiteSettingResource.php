<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicSiteSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'business_name' => $this->business_name,
            'tagline' => $this->tagline,
            'support_email' => $this->support_email,
            'support_phone' => $this->support_phone,
            'secondary_phone' => $this->secondary_phone,
            'whatsapp_order_number' => $this->whatsapp_order_number,
            'whatsapp_contact_number' => $this->whatsapp_contact_number,
            'whatsapp_ordering_enabled' => (bool) $this->whatsapp_ordering_enabled,
            'whatsapp_order_intro' => $this->whatsapp_order_intro,
            'business_address' => $this->business_address,
            'city' => $this->city,
            'state_region' => $this->state_region,
            'country' => $this->country,
            'business_hours' => $this->business_hours,
            'opening_hours' => $this->opening_hours ?? [],
            'currency_code' => $this->currency_code,
            'currency_symbol' => $this->currency_symbol,
            'currency_locale' => $this->currency_locale,
            'delivery_information' => $this->delivery_information,
            'checkout_notice' => $this->checkout_notice,
            'social_links' => $this->social_links ?? [],
            'seo_default_title' => $this->seo_default_title,
            'seo_default_description' => $this->seo_default_description,
            'default_share_image_url' => $this->default_share_image_url,
        ];
    }
}
