<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminProductVariantResource extends ProductVariantResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
