<?php

use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('product_type', 30)->default(ProductType::MenuItem->value)->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 255)->nullable();
            $table->longText('description')->nullable();
            $table->decimal('base_price', 12, 2)->default(0);
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->string('currency_code', 10)->default(config('visemfood.default_currency_code', 'USD'));
            $table->string('serving_size')->nullable();
            $table->string('status', 20)->default(PublicationStatus::Published->value)->index();
            $table->string('availability_status', 20)->default(ProductAvailabilityStatus::Available->value)->index();
            $table->boolean('featured')->default(false)->index();
            $table->boolean('available_for_order')->default(true)->index();
            $table->unsignedInteger('preparation_time_minutes')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->text('ordering_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('sku')->nullable()->index();
            $table->string('portion_label')->nullable();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('compare_price', 12, 2)->nullable();
            $table->string('currency_code', 10)->default(config('visemfood.default_currency_code', 'USD'));
            $table->string('availability_status', 20)->default(ProductAvailabilityStatus::Available->value)->index();
            $table->boolean('is_default')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('product_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_asset_id')->constrained('media_assets')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['product_id', 'media_asset_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_media');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};


