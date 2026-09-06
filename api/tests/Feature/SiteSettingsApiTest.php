<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            PermissionSeeder::class,
            AdminUserSeeder::class,
            SiteSettingSeeder::class,
        ]);
    }

    public function test_public_settings_endpoint_returns_only_public_fields(): void
    {
        $this->getJson('/api/v1/site-settings')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.business_name', 'VISEMFOOD')
            ->assertJsonPath('data.currency_code', 'USD')
            ->assertJsonPath('data.currency_symbol', '$')
            ->assertJsonPath('data.currency_locale', 'en-US')
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.singleton_key')
            ->assertJsonMissingPath('data.created_at')
            ->assertJsonMissingPath('data.updated_at');
    }

    public function test_authenticated_admin_can_fetch_site_settings(): void
    {
        [$cookieName, $cookieValue] = $this->loginAsSeededAdmin();

        $this->withCookie($cookieName, $cookieValue)
            ->getJson('/api/v1/admin/settings')
            ->assertOk()
            ->assertJsonPath('data.business_name', 'VISEMFOOD')
            ->assertJsonPath('data.updated_at', fn ($value) => is_string($value) && $value !== '');
    }

    public function test_guest_cannot_update_site_settings(): void
    {
        $this->putJson('/api/v1/admin/settings', $this->validPayload())
            ->assertStatus(401);
    }

    public function test_admin_without_settings_permission_cannot_view_or_update_site_settings(): void
    {
        $admin = User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
        $admin->role?->permissions()->where('name', 'settings.manage')->detach();

        [$cookieName, $cookieValue] = $this->loginAsSeededAdmin();

        $this->withCookie($cookieName, $cookieValue)
            ->getJson('/api/v1/admin/settings')
            ->assertStatus(403);

        $this->withCookie($cookieName, $cookieValue)
            ->putJson('/api/v1/admin/settings', $this->validPayload())
            ->assertStatus(403);
    }

    public function test_authenticated_admin_can_update_site_settings_and_public_endpoint_reflects_changes(): void
    {
        [$cookieName, $cookieValue] = $this->loginAsSeededAdmin();
        $payload = $this->validPayload();

        $this->withCookie($cookieName, $cookieValue)
            ->putJson('/api/v1/admin/settings', $payload)
            ->assertOk()
            ->assertJsonPath('data.business_name', 'VISEMFOOD Hospitality')
            ->assertJsonPath('data.support_email', 'hello@example.com')
            ->assertJsonPath('data.support_phone', '+1 555 123 4567')
            ->assertJsonPath('data.whatsapp_order_number', '15557654321')
            ->assertJsonPath('data.whatsapp_ordering_enabled', true)
            ->assertJsonPath('data.opening_hours.monday.opens_at', '09:00');

        $this->assertDatabaseHas('site_settings', [
            'singleton_key' => 'default',
            'business_name' => 'VISEMFOOD Hospitality',
            'support_email' => 'hello@example.com',
            'support_phone' => '+1 555 123 4567',
            'business_address' => '1458 Heritage Avenue',
            'city' => 'Houston',
            'state_region' => 'Texas',
            'country' => 'United States',
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'currency_locale' => 'en-US',
        ]);

        $this->getJson('/api/v1/site-settings')
            ->assertOk()
            ->assertJsonPath('data.business_name', 'VISEMFOOD Hospitality')
            ->assertJsonPath('data.tagline', 'Premium African Catering & Hospitality')
            ->assertJsonPath('data.support_email', 'hello@example.com')
            ->assertJsonPath('data.support_phone', '+1 555 123 4567')
            ->assertJsonPath('data.whatsapp_order_number', '15557654321')
            ->assertJsonPath('data.city', 'Houston')
            ->assertJsonPath('data.state_region', 'Texas')
            ->assertJsonPath('data.country', 'United States')
            ->assertJsonPath('data.opening_hours.monday.is_open', true)
            ->assertJsonPath('data.social_links.instagram', 'https://instagram.com/visemfood')
            ->assertJsonPath('data.currency_locale', 'en-US')
            ->assertJsonMissingPath('data.id');
    }

    public function test_site_settings_update_validates_payload(): void
    {
        [$cookieName, $cookieValue] = $this->loginAsSeededAdmin();
        $payload = $this->validPayload();
        $payload['support_email'] = 'not-an-email';
        $payload['social_links']['instagram'] = 'notaurl';
        $payload['whatsapp_order_number'] = null;
        $payload['whatsapp_contact_number'] = null;
        $payload['opening_hours']['monday'] = [
            'is_open' => true,
            'opens_at' => '20:00',
            'closes_at' => '09:00',
        ];

        $response = $this->withCookie($cookieName, $cookieValue)
            ->putJson('/api/v1/admin/settings', $payload);

        $response
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.support_email.0', 'The support email field must be a valid email address.');

        $errors = $response->json('errors');

        $this->assertSame(
            'The social links.instagram field must be a valid URL.',
            $errors['social_links.instagram'][0] ?? null,
        );
        $this->assertSame(
            'A WhatsApp number is required when WhatsApp ordering is enabled.',
            $errors['whatsapp_order_number'][0] ?? null,
        );
        $this->assertSame(
            'Closing time must be later than opening time.',
            $errors['opening_hours.monday.closes_at'][0] ?? null,
        );
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function loginAsSeededAdmin(): array
    {
        $response = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $cookieName = config('session.cookie');
        $sessionCookie = $response->getCookie($cookieName);

        $this->assertNotNull($sessionCookie, 'Login response did not include a session cookie.');

        return [$cookieName, $sessionCookie->getValue()];
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(): array
    {
        return [
            'business_name' => 'VISEMFOOD Hospitality',
            'tagline' => 'Premium African Catering & Hospitality',
            'support_email' => 'hello@example.com',
            'support_phone' => '+1 555 123 4567',
            'secondary_phone' => '+1 555 123 8900',
            'whatsapp_order_number' => '+1 555 765 4321',
            'whatsapp_contact_number' => '+1 555 765 4321',
            'whatsapp_ordering_enabled' => true,
            'whatsapp_order_intro' => 'Hello VISEMFOOD, I would like to start an order.',
            'business_address' => '1458 Heritage Avenue',
            'city' => 'Houston',
            'state_region' => 'Texas',
            'country' => 'United States',
            'opening_hours' => [
                'monday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
                'tuesday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
                'wednesday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
                'thursday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
                'friday' => ['is_open' => true, 'opens_at' => '09:00', 'closes_at' => '20:00'],
                'saturday' => ['is_open' => true, 'opens_at' => '10:00', 'closes_at' => '18:00'],
                'sunday' => ['is_open' => false, 'opens_at' => null, 'closes_at' => null],
            ],
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'currency_locale' => 'en-US',
            'delivery_information' => 'Pickup and delivery are available based on order size and scheduling.',
            'checkout_notice' => 'You will continue to WhatsApp to confirm availability and final pricing.',
            'social_links' => [
                'instagram' => 'https://instagram.com/visemfood',
                'facebook' => 'https://facebook.com/visemfood',
                'tiktok' => 'https://tiktok.com/@visemfood',
                'youtube' => 'https://youtube.com/@visemfood',
            ],
            'seo_default_title' => 'VISEMFOOD | Premium African Catering Platform',
            'seo_default_description' => 'Warm African hospitality, trays, bowls, coolers, and premium event catering.',
            'default_share_image_url' => 'https://example.com/share-image.jpg',
        ];
    }
}
