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
        'support_email',
        'support_phone',
        'whatsapp_order_number',
        'whatsapp_contact_number',
        'business_address',
        'business_hours',
        'currency_code',
        'currency_symbol',
        'delivery_information',
        'checkout_notice',
        'social_links',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
        ];
    }
}
