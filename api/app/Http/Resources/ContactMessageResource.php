<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'subject' => $this->subject,
            'event_date' => $this->event_date?->toIso8601String(),
            'guest_count' => $this->guest_count,
            'message' => $this->message,
            'status' => $this->status?->value ?? $this->status,
            'read_at' => $this->read_at?->toIso8601String(),
            'internal_notes' => $this->internal_notes,
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => new UserResource($this->assignedTo)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
