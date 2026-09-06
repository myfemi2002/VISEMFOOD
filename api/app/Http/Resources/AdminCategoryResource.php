<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminCategoryResource extends CategoryResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'image_media_id' => $this->image_media_id,
            'image' => $this->whenLoaded('image', fn () => new MediaAssetResource($this->image)),
            'status' => $this->status?->value ?? $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
