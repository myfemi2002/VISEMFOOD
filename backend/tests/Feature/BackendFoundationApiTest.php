<?php

namespace Tests\Feature;

use Database\Seeders\SiteSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackendFoundationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sanctum_csrf_cookie_endpoint_is_available(): void
    {
        $this->get('/sanctum/csrf-cookie')
            ->assertNoContent()
            ->assertCookie('XSRF-TOKEN');
    }

    public function test_health_endpoint_returns_safe_status_payload(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'ok')
            ->assertJsonMissingPath('data.environment');
    }

    public function test_public_site_settings_endpoint_returns_seeded_currency_defaults(): void
    {
        $this->seed(SiteSettingSeeder::class);

        $this->getJson('/api/v1/site-settings')
            ->assertOk()
            ->assertJsonPath('data.business_name', 'VISEMFOOD')
            ->assertJsonPath('data.currency_code', 'USD')
            ->assertJsonPath('data.currency_symbol', '$');
    }
}
