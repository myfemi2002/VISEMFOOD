<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Support\SiteSettingsService;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settingsService = app(SiteSettingsService::class);
        $openingHours = $settingsService->defaultOpeningHours();

        SiteSetting::query()->updateOrCreate(
            ['singleton_key' => 'default'],
            array_replace($settingsService->defaults(), [
                'business_name' => 'VISEMFOOD',
                'tagline' => 'Authentic African Food',
                'support_email' => 'hello@visemfood.com',
                'support_phone' => '+1 555 123 4567',
                'secondary_phone' => '+1 555 123 8900',
                'whatsapp_order_number' => '15557654321',
                'whatsapp_contact_number' => '15557654321',
                'whatsapp_ordering_enabled' => true,
                'whatsapp_order_intro' => 'Hello VISEMFOOD, I would like to place an order.',
                'business_address' => 'Downtown Hospitality Kitchen, 1458 Heritage Avenue',
                'city' => 'Houston',
                'state_region' => 'Texas',
                'country' => 'United States',
                'opening_hours' => $openingHours,
                'business_hours' => $settingsService->summarizeOpeningHours($openingHours),
                'currency_code' => config('visemfood.default_currency_code', 'USD'),
                'currency_symbol' => config('visemfood.default_currency_symbol', '$'),
                'currency_locale' => config('visemfood.default_currency_locale', 'en-US'),
                'delivery_information' => 'Pickup and delivery are available based on order size and schedule confirmation.',
                'checkout_notice' => 'You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.',
                'social_links' => [
                    'instagram' => 'https://instagram.com/visemfood',
                    'facebook' => 'https://facebook.com/visemfood',
                    'tiktok' => 'https://tiktok.com/@visemfood',
                    'youtube' => 'https://youtube.com/@visemfood',
                ],
                'seo_default_title' => 'VISEMFOOD | Premium African Catering Platform',
                'seo_default_description' => 'Premium African catering, trays, bowls, coolers, and warm hospitality for gatherings of every size.',
            ]),
        );
    }
}
