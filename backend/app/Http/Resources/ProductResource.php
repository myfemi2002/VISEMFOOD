<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryMedia = null;
        $defaultVariant = null;

        if ($this->relationLoaded('media')) {
            $primaryMedia = $this->media->first(
                fn ($media) => (bool) ($media->pivot?->is_primary ?? false),
            ) ?? $this->media->first();
        }

        if ($this->relationLoaded('variants')) {
            $defaultVariant = $this->variants->firstWhere('is_default', true) ?? $this->variants->first();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'product_type' => $this->product_type?->value ?? $this->product_type,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'compare_price' => $this->compare_price !== null ? (float) $this->compare_price : null,
            'currency_code' => $this->currency_code,
            'serving_size' => $this->serving_size,
            'status' => $this->status?->value ?? $this->status,
            'availability_status' => $this->availability_status?->value ?? $this->availability_status,
            'featured' => (bool) $this->featured,
            'available_for_order' => (bool) $this->available_for_order,
            'preparation_time_minutes' => $this->preparation_time_minutes,
            'sort_order' => $this->sort_order,
            'ordering_notes' => $this->ordering_notes,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'variants' => $this->whenLoaded('variants', fn () => ProductVariantResource::collection($this->variants)),
            'default_variant' => $defaultVariant ? new ProductVariantResource($defaultVariant) : null,
            'media' => $this->whenLoaded('media', fn () => MediaAssetResource::collection($this->media)),
            'primary_image' => $primaryMedia ? new MediaAssetResource($primaryMedia) : null,
            'primary_image_url' => $primaryMedia?->url,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
