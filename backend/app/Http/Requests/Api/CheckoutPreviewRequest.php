<?php

namespace App\Http\Requests\Api;

use App\Enums\DeliveryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutPreviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order_number' => ['nullable', 'string'],
            'customer_name' => ['required', 'string', 'min:2', 'max:120'],
            'customer_email' => ['nullable', 'email:rfc', 'max:190'],
            'customer_phone' => ['required', 'string', 'min:7', 'max:40'],
            'delivery_type' => ['required', Rule::in(DeliveryType::values())],
            'delivery_address' => ['nullable', 'string', 'max:2000', 'required_if:delivery_type,delivery'],
            'preferred_fulfillment_at' => ['nullable', 'date'],
            'customer_notes' => ['nullable', 'string', 'max:10000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.slug' => ['required', 'string', 'max:190'],
            'items.*.variant_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
