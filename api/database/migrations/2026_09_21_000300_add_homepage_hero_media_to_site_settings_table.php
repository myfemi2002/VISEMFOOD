<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->string('homepage_hero_media_type', 30)->default('image')->after('default_share_image_url');
            $table->foreignId('homepage_hero_media_asset_id')->nullable()->after('homepage_hero_media_type')->constrained('media_assets')->nullOnDelete();
            $table->foreignId('homepage_hero_poster_media_id')->nullable()->after('homepage_hero_media_asset_id')->constrained('media_assets')->nullOnDelete();
            $table->text('homepage_hero_external_url')->nullable()->after('homepage_hero_poster_media_id');
            $table->string('homepage_hero_alt_text')->nullable()->after('homepage_hero_external_url');
            $table->boolean('homepage_hero_autoplay')->default(true)->after('homepage_hero_alt_text');
            $table->boolean('homepage_hero_loop')->default(true)->after('homepage_hero_autoplay');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('homepage_hero_poster_media_id');
            $table->dropConstrainedForeignId('homepage_hero_media_asset_id');
            $table->dropColumn([
                'homepage_hero_media_type',
                'homepage_hero_external_url',
                'homepage_hero_alt_text',
                'homepage_hero_autoplay',
                'homepage_hero_loop',
            ]);
        });
    }
};
