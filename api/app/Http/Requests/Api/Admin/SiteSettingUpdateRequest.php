<?php

namespace App\Http\Requests\Api\Admin;

use App\Support\SiteSettingsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
        $days = array_keys(SiteSettingsService::DAY_ORDER);
        $rules = [
            'business_name' => ['required', 'string', 'max:150'],
            'tagline' => ['nullable', 'string', 'max:190'],
            'support_email' => ['nullable', 'email:rfc', 'max:190'],
            'support_phone' => ['nullable', 'string', 'max:40'],
            'secondary_phone' => ['nullable', 'string', 'max:40'],
            'whatsapp_order_number' => ['nullable', 'regex:/^\d{7,15}$/'],
            'whatsapp_contact_number' => ['nullable', 'regex:/^\d{7,15}$/'],
            'whatsapp_ordering_enabled' => ['required', 'boolean'],
            'whatsapp_order_intro' => ['nullable', 'string', 'max:255'],
            'business_address' => ['nullable', 'string', 'max:5000'],
            'city' => ['nullable', 'string', 'max:120'],
            'state_region' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:120'],
            'business_hours' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['required', 'array'],
            'currency_code' => ['required', Rule::in(['USD'])],
            'currency_symbol' => ['required', Rule::in(['$'])],
            'currency_locale' => ['required', Rule::in(['en-US'])],
            'delivery_information' => ['nullable', 'string', 'max:10000'],
            'checkout_notice' => ['nullable', 'string', 'max:10000'],
            'social_links' => ['nullable', 'array'],
            'social_links.instagram' => ['nullable', 'url:http,https', 'max:255'],
            'social_links.facebook' => ['nullable', 'url:http,https', 'max:255'],
            'social_links.tiktok' => ['nullable', 'url:http,https', 'max:255'],
            'social_links.youtube' => ['nullable', 'url:http,https', 'max:255'],
            'seo_default_title' => ['nullable', 'string', 'max:160'],
            'seo_default_description' => ['nullable', 'string', 'max:320'],
            'default_share_image_url' => ['nullable', 'url:http,https', 'max:2048'],
        ];

        foreach ($days as $day) {
            $rules["opening_hours.$day"] = ['required', 'array'];
            $rules["opening_hours.$day.is_open"] = ['required', 'boolean'];
            $rules["opening_hours.$day.opens_at"] = ['nullable', 'date_format:H:i'];
            $rules["opening_hours.$day.closes_at"] = ['nullable', 'date_format:H:i'];
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        $openingHours = $this->input('opening_hours', []);

        if (! is_array($openingHours)) {
            $openingHours = [];
        }

        $normalizedOpeningHours = [];
        foreach (array_keys(SiteSettingsService::DAY_ORDER) as $day) {
            $entry = $openingHours[$day] ?? [];
            $normalizedOpeningHours[$day] = [
                'is_open' => filter_var($entry['is_open'] ?? false, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false,
                'opens_at' => $this->normalizeNullableString($entry['opens_at'] ?? null),
                'closes_at' => $this->normalizeNullableString($entry['closes_at'] ?? null),
            ];
        }

        $socialLinks = $this->input('social_links', []);
        if (! is_array($socialLinks)) {
            $socialLinks = [];
        }

        $this->merge([
            'business_name' => $this->normalizeNullableString($this->input('business_name')),
            'tagline' => $this->normalizeNullableString($this->input('tagline')),
            'support_email' => $this->normalizeNullableString($this->input('support_email')),
            'support_phone' => $this->normalizeNullableString($this->input('support_phone')),
            'secondary_phone' => $this->normalizeNullableString($this->input('secondary_phone')),
            'whatsapp_order_number' => $this->normalizeDigits($this->input('whatsapp_order_number')),
            'whatsapp_contact_number' => $this->normalizeDigits($this->input('whatsapp_contact_number')),
            'whatsapp_ordering_enabled' => filter_var($this->input('whatsapp_ordering_enabled', true), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false,
            'whatsapp_order_intro' => $this->normalizeNullableString($this->input('whatsapp_order_intro')),
            'business_address' => $this->normalizeNullableString($this->input('business_address')),
            'city' => $this->normalizeNullableString($this->input('city')),
            'state_region' => $this->normalizeNullableString($this->input('state_region')),
            'country' => $this->normalizeNullableString($this->input('country')),
            'delivery_information' => $this->normalizeNullableString($this->input('delivery_information')),
            'checkout_notice' => $this->normalizeNullableString($this->input('checkout_notice')),
            'seo_default_title' => $this->normalizeNullableString($this->input('seo_default_title')),
            'seo_default_description' => $this->normalizeNullableString($this->input('seo_default_description')),
            'default_share_image_url' => $this->normalizeNullableString($this->input('default_share_image_url')),
            'social_links' => [
                'instagram' => $this->normalizeNullableString($socialLinks['instagram'] ?? null),
                'facebook' => $this->normalizeNullableString($socialLinks['facebook'] ?? null),
                'tiktok' => $this->normalizeNullableString($socialLinks['tiktok'] ?? null),
                'youtube' => $this->normalizeNullableString($socialLinks['youtube'] ?? null),
            ],
            'opening_hours' => $normalizedOpeningHours,
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'currency_locale' => 'en-US',
        ]);
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $openingHours = $this->input('opening_hours', []);

                foreach (array_keys(SiteSettingsService::DAY_ORDER) as $day) {
                    $dayHours = $openingHours[$day] ?? [];
                    $isOpen = (bool) ($dayHours['is_open'] ?? false);
                    $opensAt = $dayHours['opens_at'] ?? null;
                    $closesAt = $dayHours['closes_at'] ?? null;

                    if (! $isOpen) {
                        continue;
                    }

                    if ($opensAt === null || $closesAt === null) {
                        $validator->errors()->add("opening_hours.$day", 'Opening and closing times are required when a day is open.');
                        continue;
                    }

                    if ($opensAt >= $closesAt) {
                        $validator->errors()->add("opening_hours.$day.closes_at", 'Closing time must be later than opening time.');
                    }
                }

                $isOrderingEnabled = (bool) $this->input('whatsapp_ordering_enabled', false);
                $orderNumber = $this->input('whatsapp_order_number');
                $contactNumber = $this->input('whatsapp_contact_number');

                if ($isOrderingEnabled && $orderNumber === null && $contactNumber === null) {
                    $validator->errors()->add('whatsapp_order_number', 'A WhatsApp number is required when WhatsApp ordering is enabled.');
                }
            },
        ];
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function normalizeDigits(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        return $digits === '' ? null : $digits;
    }
}
