<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_counters', function (Blueprint $table) {
            $table->id();
            $table->string('scope');
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('current_number')->default(0);
            $table->timestamps();
            $table->unique(['scope', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference_counters');
    }
};
