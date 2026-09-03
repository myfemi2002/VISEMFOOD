<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'singleton_key',
        'business_name',
        'tagline',
        'support_email',
        'support_phone',
        'secondary_phone',
        'whatsapp_order_number',
        'whatsapp_contact_number',
        'whatsapp_ordering_enabled',
        'whatsapp_order_intro',
        'business_address',
        'city',
        'state_region',
        'country',
        'business_hours',
        'opening_hours',
        'currency_code',
        'currency_symbol',
        'currency_locale',
        'delivery_information',
        'checkout_notice',
        'social_links',
        'seo_default_title',
        'seo_default_description',
        'default_share_image_url',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'opening_hours' => 'array',
            'whatsapp_ordering_enabled' => 'boolean',
        ];
    }
}
