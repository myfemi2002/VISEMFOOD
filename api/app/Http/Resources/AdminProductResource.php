<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminProductResource extends ProductResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryMedia = $this->primaryMedia();
        $defaultVariant = null;

        if ($this->relationLoaded('variants')) {
            $defaultVariant = $this->variants->firstWhere('is_default', true) ?? $this->variants->first();
        }

        return [
            ...parent::toArray($request),
            'category_id' => $this->category_id,
            'status' => $this->status?->value ?? $this->status,
            'sort_order' => $this->sort_order,
            'primary_media_id' => $primaryMedia?->id,
            'media' => $this->whenLoaded('media', fn () => MediaAssetResource::collection($this->media)),
            'variants' => $this->whenLoaded('variants', fn () => AdminProductVariantResource::collection($this->variants)),
            'default_variant' => $defaultVariant ? new AdminProductVariantResource($defaultVariant) : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
