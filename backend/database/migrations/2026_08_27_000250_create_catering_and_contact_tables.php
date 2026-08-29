<?php

use App\Enums\CateringInquiryStatus;
use App\Enums\ContactMessageStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catering_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('customer_name');
            $table->string('email')->index();
            $table->string('phone', 40);
            $table->string('event_type');
            $table->timestamp('event_date')->nullable()->index();
            $table->unsignedInteger('number_of_guests')->nullable();
            $table->string('preferred_service')->nullable();
            $table->string('location')->nullable();
            $table->string('budget')->nullable();
            $table->text('requirements')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 30)->default(CateringInquiryStatus::New->value)->index();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone', 40)->nullable();
            $table->string('subject');
            $table->timestamp('event_date')->nullable()->index();
            $table->unsignedInteger('guest_count')->nullable();
            $table->longText('message');
            $table->string('status', 20)->default(ContactMessageStatus::New->value)->index();
            $table->timestamp('read_at')->nullable()->index();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('catering_inquiries');
    }
};
