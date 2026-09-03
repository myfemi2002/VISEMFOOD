<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CateringInquiryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'customer_name' => $this->customer_name,
            'event_type' => $this->event_type,
            'event_date' => $this->event_date?->toIso8601String(),
            'number_of_guests' => $this->number_of_guests,
            'preferred_service' => $this->preferred_service,
            'location' => $this->location,
            'catering_package' => $this->whenLoaded('cateringPackage', fn () => $this->cateringPackage ? [
                'id' => $this->cateringPackage->id,
                'name' => $this->cateringPackage->name,
                'slug' => $this->cateringPackage->slug,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}