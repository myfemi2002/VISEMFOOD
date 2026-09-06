<?php

namespace App\Http\Requests\Api;

use App\Enums\CateringPackageStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'catering_package_id' => [
                'nullable',
                'integer',
                Rule::exists('catering_packages', 'id')->where(fn ($query) => $query->where('status', CateringPackageStatus::Active->value)),
            ],
            'customer_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['required', 'string', 'min:7', 'max:40'],
            'event_type' => ['required', 'string', 'min:2', 'max:120'],
            'event_date' => ['required', 'date', 'after_or_equal:today'],
            'number_of_guests' => ['required', 'integer', 'min:1', 'max:5000'],
            'preferred_service' => ['nullable', 'string', 'max:120'],
            'location' => ['required', 'string', 'min:2', 'max:255'],
            'budget_amount' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'budget' => ['nullable', 'string', 'max:120'],
            'requirements' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}