<?php

namespace App\Support;

use App\Models\SiteSetting;
use Carbon\CarbonImmutable;

class SiteSettingsService
{
    /**
     * @var array<string, string>
     */
    public const DAY_ORDER = [
        'monday' => 'Monday',
        'tuesday' => 'Tuesday',
        'wednesday' => 'Wednesday',
        'thursday' => 'Thursday',
        'friday' => 'Friday',
        'saturday' => 'Saturday',
        'sunday' => 'Sunday',
    ];

    public function getOrCreate(): SiteSetting
    {
        /** @var SiteSetting $settings */
        $settings = SiteSetting::query()->firstOrCreate(
            ['singleton_key' => 'default'],
            $this->defaults(),
        );

        return $settings;
    }

    /**
     * @return array<string, mixed>
     */
    public function defaults(): array
    {
        $openingHours = $this->blankOpeningHours();

        return [
            'business_name' => config('app.name', 'VISEMFOOD'),
            'tagline' => 'Authentic African Food',
            'city' => null,
            'state_region' => null,
            'country' => null,
            'opening_hours' => $openingHours,
            'business_hours' => null,
            'currency_code' => config('visemfood.default_currency_code', 'USD'),
            'currency_symbol' => config('visemfood.default_currency_symbol', '$'),
            'currency_locale' => config('visemfood.default_currency_locale', 'en-US'),
            'whatsapp_ordering_enabled' => true,
            'whatsapp_order_intro' => 'Hello VISEMFOOD, I would like to place an order.',
            'checkout_notice' => 'You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.',
            'seo_default_title' => 'VISEMFOOD | Premium African Catering Platform',
            'seo_default_description' => 'Premium African catering, trays, bowls, coolers, and warm hospitality for gatherings of every size.',
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    public function normalizeForUpdate(array $validated, ?SiteSetting $current = null): array
    {
        $openingHours = $this->normalizeOpeningHours(
            $validated['opening_hours'] ?? $current?->opening_hours ?? $this->defaultOpeningHours(),
        );

        return [
            'business_name' => $this->cleanString($validated['business_name'] ?? $current?->business_name),
            'tagline' => $this->cleanString($validated['tagline'] ?? $current?->tagline),
            'support_email' => $this->cleanString($validated['support_email'] ?? $current?->support_email),
            'support_phone' => $this->cleanString($validated['support_phone'] ?? $current?->support_phone),
            'secondary_phone' => $this->cleanString($validated['secondary_phone'] ?? $current?->secondary_phone),
            'whatsapp_order_number' => $this->normalizeWhatsAppNumber($validated['whatsapp_order_number'] ?? $current?->whatsapp_order_number),
            'whatsapp_contact_number' => $this->normalizeWhatsAppNumber($validated['whatsapp_contact_number'] ?? $current?->whatsapp_contact_number),
            'whatsapp_ordering_enabled' => (bool) ($validated['whatsapp_ordering_enabled'] ?? $current?->whatsapp_ordering_enabled ?? true),
            'whatsapp_order_intro' => $this->cleanString($validated['whatsapp_order_intro'] ?? $current?->whatsapp_order_intro),
            'business_address' => $this->cleanString($validated['business_address'] ?? $current?->business_address),
            'city' => $this->cleanString($validated['city'] ?? $current?->city),
            'state_region' => $this->cleanString($validated['state_region'] ?? $current?->state_region),
            'country' => $this->cleanString($validated['country'] ?? $current?->country),
            'opening_hours' => $openingHours,
            'business_hours' => $this->summarizeOpeningHours($openingHours),
            'currency_code' => config('visemfood.default_currency_code', 'USD'),
            'currency_symbol' => config('visemfood.default_currency_symbol', '$'),
            'currency_locale' => config('visemfood.default_currency_locale', 'en-US'),
            'delivery_information' => $this->cleanString($validated['delivery_information'] ?? $current?->delivery_information),
            'checkout_notice' => $this->cleanString($validated['checkout_notice'] ?? $current?->checkout_notice),
            'social_links' => $this->normalizeSocialLinks($validated['social_links'] ?? $current?->social_links ?? []),
            'seo_default_title' => $this->cleanString($validated['seo_default_title'] ?? $current?->seo_default_title),
            'seo_default_description' => $this->cleanString($validated['seo_default_description'] ?? $current?->seo_default_description),
            'default_share_image_url' => $this->cleanString($validated['default_share_image_url'] ?? $current?->default_share_image_url),
        ];
    }

    /**
     * @return array<string, array<string, string|bool|null>>
     */
    public function defaultOpeningHours(): array
    {
        return [
            'monday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'tuesday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'wednesday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'thursday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'friday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'saturday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
            'sunday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
        ];
    }

    /**
     * @return array<string, array<string, string|bool|null>>
     */
    public function blankOpeningHours(): array
    {
        return [
            'monday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'tuesday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'wednesday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'thursday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'friday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'saturday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            'sunday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
        ];
    }

    /**
     * @param  array<string, mixed>  $openingHours
     * @return array<string, array{is_open: bool, opens_at: string|null, closes_at: string|null}>
     */
    public function normalizeOpeningHours(array $openingHours): array
    {
        $normalized = [];

        foreach (self::DAY_ORDER as $key => $label) {
            $day = is_array($openingHours[$key] ?? null) ? $openingHours[$key] : [];
            $isOpen = (bool) ($day['is_open'] ?? false);
            $opensAt = $this->cleanString($day['opens_at'] ?? null);
            $closesAt = $this->cleanString($day['closes_at'] ?? null);

            $normalized[$key] = [
                'is_open' => $isOpen,
                'opens_at' => $isOpen ? $opensAt : null,
                'closes_at' => $isOpen ? $closesAt : null,
            ];
        }

        return $normalized;
    }

    /**
     * @param  array<string, array{is_open: bool, opens_at: string|null, closes_at: string|null}>  $openingHours
     */
    public function summarizeOpeningHours(array $openingHours): string
    {
        $segments = [];
        $current = null;

        foreach (array_keys(self::DAY_ORDER) as $index => $dayKey) {
            $day = $openingHours[$dayKey] ?? ['is_open' => false, 'opens_at' => null, 'closes_at' => null];
            $hoursKey = $day['is_open']
                ? sprintf('%s|%s', $day['opens_at'] ?? '', $day['closes_at'] ?? '')
                : 'closed';

            if ($current === null) {
                $current = [
                    'start' => $dayKey,
                    'end' => $dayKey,
                    'hours_key' => $hoursKey,
                    'day' => $day,
                ];
                continue;
            }

            if ($current['hours_key'] === $hoursKey) {
                $current['end'] = $dayKey;
            } else {
                $segments[] = $current;
                $current = [
                    'start' => $dayKey,
                    'end' => $dayKey,
                    'hours_key' => $hoursKey,
                    'day' => $day,
                ];
            }

            if ($index === array_key_last(self::DAY_ORDER) && $current !== null) {
                $segments[] = $current;
                $current = null;
            }
        }

        if ($current !== null) {
            $segments[] = $current;
        }

        return collect($segments)
            ->map(function (array $segment): string {
                $dayLabel = $this->segmentDayLabel($segment['start'], $segment['end']);

                if ($segment['hours_key'] === 'closed') {
                    return sprintf('%s, Closed', $dayLabel);
                }

                return sprintf(
                    '%s, %s - %s',
                    $dayLabel,
                    $this->formatDisplayTime($segment['day']['opens_at']),
                    $this->formatDisplayTime($segment['day']['closes_at']),
                );
            })
            ->implode('; ');
    }

    private function segmentDayLabel(string $startDay, string $endDay): string
    {
        $start = $this->shortDayLabel($startDay);
        $end = $this->shortDayLabel($endDay);

        return $start === $end ? $start : sprintf('%s - %s', $start, $end);
    }

    private function shortDayLabel(string $dayKey): string
    {
        return match ($dayKey) {
            'thursday' => 'Thu',
            'saturday' => 'Sat',
            'tuesday' => 'Tue',
            'wednesday' => 'Wed',
            'friday' => 'Fri',
            'sunday' => 'Sun',
            default => 'Mon',
        };
    }

    private function formatDisplayTime(?string $time): string
    {
        if ($time === null || $time === '') {
            return 'Closed';
        }

        try {
            return CarbonImmutable::createFromFormat('H:i', $time)->format('g:ia');
        } catch (\Throwable) {
            return $time;
        }
    }

    private function cleanString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function normalizeWhatsAppNumber(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        return $digits === '' ? null : $digits;
    }

    /**
     * @param  array<string, mixed>  $socialLinks
     * @return array<string, string>
     */
    private function normalizeSocialLinks(array $socialLinks): array
    {
        $normalized = [];

        foreach (['instagram', 'facebook', 'tiktok', 'youtube'] as $key) {
            $value = $this->cleanString($socialLinks[$key] ?? null);

            if ($value !== null) {
                $normalized[$key] = $value;
            }
        }

        return $normalized;
    }
}
