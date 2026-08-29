<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SiteSettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('settings.manage') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:150'],
            'support_email' => ['nullable', 'email:rfc', 'max:190'],
            'support_phone' => ['nullable', 'string', 'max:40'],
            'whatsapp_order_number' => ['nullable', 'string', 'max:40'],
            'whatsapp_contact_number' => ['nullable', 'string', 'max:40'],
            'business_address' => ['nullable', 'string', 'max:5000'],
            'business_hours' => ['nullable', 'string', 'max:255'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'currency_symbol' => ['nullable', 'string', 'max:10'],
            'delivery_information' => ['nullable', 'string', 'max:10000'],
            'checkout_notice' => ['nullable', 'string', 'max:10000'],
            'social_links' => ['nullable', 'array'],
        ];
    }
}
