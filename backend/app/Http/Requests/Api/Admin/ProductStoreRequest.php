<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('products.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'product_type' => ['required', Rule::in(ProductType::values())],
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'slug' => ['nullable', 'string', 'max:180', 'unique:products,slug'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'serving_size' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::in(PublicationStatus::values())],
            'availability_status' => ['required', Rule::in(ProductAvailabilityStatus::values())],
            'featured' => ['sometimes', 'boolean'],
            'available_for_order' => ['sometimes', 'boolean'],
            'preparation_time_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'ordering_notes' => ['nullable', 'string', 'max:10000'],
            'media_ids' => ['nullable', 'array'],
            'media_ids.*' => ['integer', 'exists:media_assets,id'],
            'primary_media_id' => ['nullable', 'integer', 'exists:media_assets,id'],
            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required_with:variants', 'string', 'max:150'],
            'variants.*.sku' => ['nullable', 'string', 'max:120'],
            'variants.*.portion_label' => ['nullable', 'string', 'max:120'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.compare_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.availability_status' => ['nullable', Rule::in(ProductAvailabilityStatus::values())],
            'variants.*.is_default' => ['nullable', 'boolean'],
            'variants.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
