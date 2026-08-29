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
            'email' => $this->email,
            'phone' => $this->phone,
            'event_type' => $this->event_type,
            'event_date' => $this->event_date?->toIso8601String(),
            'number_of_guests' => $this->number_of_guests,
            'preferred_service' => $this->preferred_service,
            'location' => $this->location,
            'budget' => $this->budget,
            'requirements' => $this->requirements,
            'notes' => $this->notes,
            'status' => $this->status?->value ?? $this->status,
            'internal_notes' => $this->internal_notes,
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => new UserResource($this->assignedTo)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
