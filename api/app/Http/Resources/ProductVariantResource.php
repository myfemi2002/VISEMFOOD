<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    protected function salePrice(): ?float
    {
        return $this->compare_price !== null ? (float) $this->compare_price : null;
    }

    protected function effectivePrice(): float
    {
        return $this->salePrice() ?? (float) $this->price;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'portion_label' => $this->portion_label,
            'description' => $this->description,
            'price' => $this->effectivePrice(),
            'base_price' => (float) $this->price,
            'sale_price' => $this->salePrice(),
            'compare_price' => $this->salePrice(),
            'effective_price' => $this->effectivePrice(),
            'currency_code' => $this->currency_code,
            'availability_status' => $this->availability_status?->value ?? $this->availability_status,
            'is_default' => (bool) $this->is_default,
            'sort_order' => $this->sort_order,
        ];
    }
}
