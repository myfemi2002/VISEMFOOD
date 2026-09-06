<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderPricingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('orders.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'final_total' => ['required', 'numeric', 'min:0'],
            'admin_notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
