<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->string('tagline')->nullable()->after('business_name');
            $table->string('secondary_phone', 40)->nullable()->after('support_phone');
            $table->string('city', 120)->nullable()->after('business_address');
            $table->string('state_region', 120)->nullable()->after('city');
            $table->string('country', 120)->nullable()->after('state_region');
            $table->json('opening_hours')->nullable()->after('business_hours');
            $table->boolean('whatsapp_ordering_enabled')->default(true)->after('whatsapp_contact_number');
            $table->string('whatsapp_order_intro', 255)->nullable()->after('whatsapp_ordering_enabled');
            $table->string('currency_locale', 20)->default(config('visemfood.default_currency_locale', 'en-US'))->after('currency_symbol');
            $table->string('seo_default_title', 160)->nullable()->after('checkout_notice');
            $table->text('seo_default_description')->nullable()->after('seo_default_title');
            $table->string('default_share_image_url', 2048)->nullable()->after('seo_default_description');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'tagline',
                'secondary_phone',
                'city',
                'state_region',
                'country',
                'opening_hours',
                'whatsapp_ordering_enabled',
                'whatsapp_order_intro',
                'currency_locale',
                'seo_default_title',
                'seo_default_description',
                'default_share_image_url',
            ]);
        });
    }
};
