<?php

namespace Tests\Feature;

use Database\Seeders\CatalogSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            SiteSettingSeeder::class,
            CatalogSeeder::class,
        ]);
    }

    public function test_products_index_returns_seeded_products(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.slug', 'signature-jollof-rice');
    }

    public function test_product_detail_returns_requested_product(): void
    {
        $response = $this->getJson('/api/v1/products/signature-jollof-rice');

        $response
            ->assertOk()
            ->assertJsonPath('data.slug', 'signature-jollof-rice')
            ->assertJsonPath('data.primary_image.url', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80');
    }
}
