<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('singleton_key')->default('default')->unique();
            $table->string('business_name')->default('VISEMFOOD');
            $table->string('support_email')->nullable();
            $table->string('support_phone', 40)->nullable();
            $table->string('whatsapp_order_number', 40)->nullable();
            $table->string('whatsapp_contact_number', 40)->nullable();
            $table->text('business_address')->nullable();
            $table->string('business_hours')->nullable();
            $table->string('currency_code', 10)->default(config('visemfood.default_currency_code', 'USD'));
            $table->string('currency_symbol', 10)->default(config('visemfood.default_currency_symbol', '$'));
            $table->text('delivery_information')->nullable();
            $table->text('checkout_notice')->nullable();
            $table->json('social_links')->nullable();
            $table->timestamps();
        });

        Schema::create('content_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('group_key')->nullable()->index();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->longText('body')->nullable();
            $table->foreignId('image_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_sections');
        Schema::dropIfExists('site_settings');
    }
};
