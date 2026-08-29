<?php

namespace Tests\Feature;

use App\Models\Order;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutApiTest extends TestCase
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

    public function test_checkout_preview_calculates_totals_on_the_server(): void
    {
        $response = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.test',
            'customer_phone' => '+2348000011111',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Lekki, Lagos',
            'preferred_fulfillment_at' => '2026-08-30 12:00:00',
            'items' => [
                [
                    'slug' => 'signature-jollof-rice',
                    'quantity' => 2,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.totals.estimated_total', 17000)
            ->assertJsonPath('data.order.status', 'draft');

        $orderNumber = (string) $response->json('data.order.order_number');
        $order = Order::query()->where('order_number', $orderNumber)->firstOrFail();

        $this->assertSame(17000.0, (float) $order->estimated_total);
    }

    public function test_continue_on_whatsapp_marks_the_order_and_returns_a_url(): void
    {
        $preview = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'John Doe',
            'customer_phone' => '+2348000011111',
            'delivery_type' => 'pickup',
            'items' => [
                [
                    'slug' => 'signature-jollof-rice',
                    'quantity' => 1,
                ],
            ],
        ])->assertCreated();

        $orderNumber = (string) $preview->json('data.order.order_number');

        $response = $this->postJson("/api/v1/checkout/{$orderNumber}/whatsapp");

        $response
            ->assertOk()
            ->assertJsonPath('data.order.status', 'whatsapp_pending')
            ->assertJsonPath('data.whatsapp.number', '2348000000000');
    }
}
