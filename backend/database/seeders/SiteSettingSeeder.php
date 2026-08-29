<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::query()->updateOrCreate(
            ['singleton_key' => 'default'],
            [
                'business_name' => 'VISEMFOOD',
                'support_email' => 'hello@visemfood.com',
                'support_phone' => '+234 800 000 0000',
                'whatsapp_order_number' => '2348000000000',
                'whatsapp_contact_number' => '2348000000000',
                'business_address' => 'Lekki Phase 1, Lagos, Nigeria',
                'business_hours' => 'Mon - Sat, 9:00am - 7:00pm',
                'currency_code' => 'NGN',
                'currency_symbol' => 'NGN',
                'delivery_information' => 'Pickup and delivery are available based on order size and schedule confirmation.',
                'checkout_notice' => 'You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.',
                'social_links' => [
                    'instagram' => 'https://instagram.com/visemfood',
                    'facebook' => 'https://facebook.com/visemfood',
                    'whatsapp' => 'https://wa.me/2348000000000',
                ],
            ],
        );
    }
}
