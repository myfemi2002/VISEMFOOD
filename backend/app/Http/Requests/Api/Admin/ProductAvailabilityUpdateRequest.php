<?php

namespace App\Http\Requests\Api\Admin;

use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductAvailabilityUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('products.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'availability_status' => ['required', Rule::in(ProductAvailabilityStatus::values())],
            'status' => ['nullable', Rule::in(PublicationStatus::values())],
            'available_for_order' => ['nullable', 'boolean'],
        ];
    }
}
