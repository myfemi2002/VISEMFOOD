<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'description' => $this->description,
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
            'products_count' => $this->when(isset($this->products_count), (int) $this->products_count),
        ];
    }
}
