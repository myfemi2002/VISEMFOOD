<?php

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_email')->nullable()->index();
            $table->string('customer_phone', 40)->index();
            $table->string('delivery_type', 20)->default(DeliveryType::Pickup->value)->index();
            $table->text('delivery_address')->nullable();
            $table->timestamp('preferred_fulfillment_at')->nullable()->index();
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('currency_code', 10)->default(config('visemfood.default_currency_code', 'USD'));
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('estimated_total', 12, 2)->default(0);
            $table->decimal('final_total', 12, 2)->nullable();
            $table->string('status', 30)->default(OrderStatus::Draft->value)->index();
            $table->timestamp('whatsapp_started_at')->nullable()->index();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('handled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete()->index();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete()->index();
            $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->nullOnDelete()->index();
            $table->string('product_name');
            $table->string('variant_name')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 12, 2);
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete()->index();
            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30)->index();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
