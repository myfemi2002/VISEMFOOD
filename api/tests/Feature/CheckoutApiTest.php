<?php

namespace Tests\Feature;

use App\Enums\CategoryStatus;
use App\Models\Order;
use App\Models\Product;
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
        $product = Product::query()
            ->where('slug', 'signature-jollof-rice')
            ->firstOrFail();
        $mediumVariant = $product->variants()->where('name', 'Medium')->firstOrFail();

        $response = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'John Doe',
            'customer_email' => 'john@example.test',
            'customer_phone' => '+2348000011111',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Lekki, Lagos',
            'preferred_fulfillment_at' => '2026-08-30 12:00:00',
            'items' => [
                [
                    'product_id' => $product->id,
                    'slug' => 'signature-jollof-rice',
                    'variant_id' => $mediumVariant->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.totals.estimated_total', 80)
            ->assertJsonPath('data.order.status', 'draft')
            ->assertJsonPath('data.order.currency_code', 'USD')
            ->assertJsonPath('data.line_items.0.product_id', $product->id)
            ->assertJsonPath('data.line_items.0.product_variant_id', $mediumVariant->id);

        $orderNumber = (string) $response->json('data.order.order_number');
        $order = Order::query()->where('order_number', $orderNumber)->firstOrFail();

        $this->assertSame(80.0, (float) $order->estimated_total);
    }

    public function test_checkout_preview_accepts_tray_and_cooler_products_with_real_variant_ids(): void
    {
        $tray = Product::query()->where('slug', 'jollof-rice-party-tray')->firstOrFail();
        $trayVariant = $tray->variants()->where('name', 'Medium Tray')->firstOrFail();
        $cooler = Product::query()->where('slug', 'party-jollof-cooler')->firstOrFail();
        $coolerVariant = $cooler->variants()->where('name', '20 Litres')->firstOrFail();

        $response = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'Tray Customer',
            'customer_phone' => '+15551234567',
            'delivery_type' => 'pickup',
            'items' => [
                [
                    'product_id' => $tray->id,
                    'slug' => $tray->slug,
                    'variant_id' => $trayVariant->id,
                    'quantity' => 2,
                ],
                [
                    'product_id' => $cooler->id,
                    'slug' => $cooler->slug,
                    'variant_id' => $coolerVariant->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.totals.estimated_total', 340)
            ->assertJsonPath('data.line_items.0.product_id', $tray->id)
            ->assertJsonPath('data.line_items.0.product_variant_id', $trayVariant->id)
            ->assertJsonPath('data.line_items.0.variant_name', 'Medium Tray')
            ->assertJsonPath('data.line_items.1.product_id', $cooler->id)
            ->assertJsonPath('data.line_items.1.product_variant_id', $coolerVariant->id)
            ->assertJsonPath('data.line_items.1.variant_name', '20 Litres');
    }

    public function test_checkout_preview_rejects_products_from_inactive_categories(): void
    {
        $tray = Product::query()->where('slug', 'jollof-rice-party-tray')->firstOrFail();
        $tray->category()->update(['status' => CategoryStatus::Inactive]);
        $trayVariant = $tray->variants()->where('name', 'Small Tray')->firstOrFail();

        $response = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'Hidden Category Customer',
            'customer_phone' => '+15557654321',
            'delivery_type' => 'pickup',
            'items' => [
                [
                    'product_id' => $tray->id,
                    'slug' => $tray->slug,
                    'variant_id' => $trayVariant->id,
                    'quantity' => 1,
                ],
            ],
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('success', false);

        $errors = $response->json('errors');

        $this->assertSame(
            'jollof-rice-party-tray is not currently available for ordering.',
            $errors['items.0'][0] ?? null,
        );
    }

    public function test_continue_on_whatsapp_marks_the_order_and_returns_a_url(): void
    {
        $product = Product::query()
            ->where('slug', 'signature-jollof-rice')
            ->firstOrFail();
        $smallVariant = $product->variants()->where('name', 'Small')->firstOrFail();

        $preview = $this->postJson('/api/v1/checkout/preview', [
            'customer_name' => 'John Doe',
            'customer_phone' => '+2348000011111',
            'delivery_type' => 'pickup',
            'items' => [
                [
                    'product_id' => $product->id,
                    'slug' => 'signature-jollof-rice',
                    'variant_id' => $smallVariant->id,
                    'quantity' => 1,
                ],
            ],
        ])->assertCreated();

        $orderNumber = (string) $preview->json('data.order.order_number');

        $response = $this->postJson("/api/v1/checkout/{$orderNumber}/whatsapp");

        $response
            ->assertOk()
            ->assertJsonPath('data.order.status', 'whatsapp_pending')
            ->assertJsonPath('data.whatsapp.number', '15557654321')
            ->assertJsonPath('data.whatsapp.message', fn (string $message) => str_contains($message, 'Estimated Total: $25.00'))
            ->assertJsonPath('data.whatsapp.message', fn (string $message) => str_contains($message, 'Signature Jollof Rice (Small)'));
    }
}
