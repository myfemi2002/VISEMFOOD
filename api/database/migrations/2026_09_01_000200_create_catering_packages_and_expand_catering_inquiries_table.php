<?php

use App\Enums\CateringPackageStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catering_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description', 255)->nullable();
            $table->text('description')->nullable();
            $table->decimal('starting_price', 10, 2);
            $table->string('currency_code', 3)->default('USD');
            $table->unsignedInteger('minimum_guests');
            $table->unsignedInteger('maximum_guests')->nullable();
            $table->foreignId('image_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->json('inclusions')->nullable();
            $table->boolean('featured')->default(false)->index();
            $table->string('status', 20)->default(CateringPackageStatus::Active->value)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });

        Schema::table('catering_inquiries', function (Blueprint $table) {
            $table->foreignId('catering_package_id')->nullable()->after('reference_number')->constrained('catering_packages')->restrictOnDelete();
            $table->decimal('budget_amount', 10, 2)->nullable()->after('budget');
        });
    }

    public function down(): void
    {
        Schema::table('catering_inquiries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('catering_package_id');
            $table->dropColumn('budget_amount');
        });

        Schema::dropIfExists('catering_packages');
    }
};