<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CateringPackageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'starting_price' => (float) $this->starting_price,
            'currency_code' => $this->currency_code,
            'minimum_guests' => $this->minimum_guests,
            'maximum_guests' => $this->maximum_guests,
            'inclusions' => $this->inclusions ?? [],
            'featured' => (bool) $this->featured,
            'sort_order' => $this->sort_order,
            'image' => $this->whenLoaded('image', fn () => $this->image ? [
                'id' => $this->image->id,
                'url' => $this->image->url,
                'alt_text' => $this->image->alt_text,
                'width' => $this->image->width,
                'height' => $this->image->height,
                'variants' => $this->image->variants ?? [],
            ] : null),
            'image_url' => $this->image?->url,
        ];
    }
}