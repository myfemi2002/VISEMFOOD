<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    protected function variantSalePrice(mixed $variant): ?float
    {
        return $variant?->compare_price !== null ? (float) $variant->compare_price : null;
    }

    protected function variantEffectivePrice(mixed $variant): float
    {
        return $this->variantSalePrice($variant) ?? (float) ($variant?->price ?? 0);
    }

    protected function salePrice(): ?float
    {
        return $this->compare_price !== null ? (float) $this->compare_price : null;
    }

    protected function effectivePrice(): float
    {
        return $this->salePrice() ?? (float) $this->base_price;
    }

    protected function primaryMedia()
    {
        if ($this->relationLoaded('primaryMedia')) {
            return $this->primaryMedia->first();
        }

        if (! $this->relationLoaded('media')) {
            return null;
        }

        return $this->media->first(
            fn ($media) => (bool) ($media->pivot?->is_primary ?? false),
        ) ?? $this->media->first();
    }

    protected function publicMediaPayload(): array
    {
        if (! $this->relationLoaded('media')) {
            return [];
        }

        return $this->media
            ->map(fn ($media) => [
                'id' => $media->id,
                'url' => $media->url,
                'alt_text' => $media->alt_text,
                'width' => $media->width,
                'height' => $media->height,
                'variants' => $media->variants ?? [],
                'sort_order' => (int) ($media->pivot?->sort_order ?? 0),
                'is_primary' => (bool) ($media->pivot?->is_primary ?? false),
            ])
            ->sortBy([
                ['sort_order', 'asc'],
                ['id', 'asc'],
            ])
            ->values()
            ->all();
    }

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

        $availabilityStatus = $this->availability_status?->value ?? $this->availability_status;
        $hasVisibleVariant = ! $this->relationLoaded('variants') || $this->variants->isNotEmpty();
        $isOrderable = (bool) $this->available_for_order
            && $availabilityStatus !== 'unavailable'
            && $hasVisibleVariant;

        $effectivePrice = $defaultVariant ? $this->variantEffectivePrice($defaultVariant) : $this->effectivePrice();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'product_type' => $this->product_type?->value ?? $this->product_type,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'sale_price' => $this->salePrice(),
            'compare_price' => $this->salePrice(),
            'effective_price' => $effectivePrice,
            'price' => $effectivePrice,
            'currency_code' => $this->currency_code,
            'serving_size' => $this->serving_size,
            'availability_status' => $this->availability_status?->value ?? $this->availability_status,
            'featured' => (bool) $this->featured,
            'available_for_order' => (bool) $this->available_for_order,
            'is_orderable' => $isOrderable,
            'preparation_time_minutes' => $this->preparation_time_minutes,
            'ordering_notes' => $this->ordering_notes,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'variants' => $this->whenLoaded('variants', fn () => ProductVariantResource::collection($this->variants)),
            'default_variant' => $defaultVariant ? new ProductVariantResource($defaultVariant) : null,
            'media' => $this->whenLoaded('media', fn () => $this->publicMediaPayload()),
            'primary_image' => $primaryMedia ? [
                'id' => $primaryMedia->id,
                'url' => $primaryMedia->url,
                'alt_text' => $primaryMedia->alt_text,
                'width' => $primaryMedia->width,
                'height' => $primaryMedia->height,
                'variants' => $primaryMedia->variants ?? [],
            ] : null,
            'primary_image_url' => $primaryMedia?->url,
        ];
    }
}
