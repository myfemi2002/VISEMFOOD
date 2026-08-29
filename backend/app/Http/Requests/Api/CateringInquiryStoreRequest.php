<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CateringInquiryStoreRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['required', 'string', 'min:7', 'max:40'],
            'event_type' => ['required', 'string', 'min:2', 'max:120'],
            'event_date' => ['nullable', 'date'],
            'number_of_guests' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'preferred_service' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'budget' => ['nullable', 'string', 'max:120'],
            'requirements' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
