<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminCateringPackageResource extends CateringPackageResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'image_media_id' => $this->image_media_id,
            'image' => $this->whenLoaded('image', fn () => $this->image ? new MediaAssetResource($this->image) : null),
            'status' => $this->status?->value ?? $this->status,
            'inquiries_count' => $this->when(isset($this->inquiries_count), (int) $this->inquiries_count),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}