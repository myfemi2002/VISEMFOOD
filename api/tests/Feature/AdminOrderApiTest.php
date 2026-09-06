<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrderApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_admin_can_update_order_status_and_final_price(): void
    {
        Sanctum::actingAs($this->adminUser());

        $order = Order::query()->where('order_number', 'VF-2026-000002')->firstOrFail();

        $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'confirmed',
            'notes' => 'Confirmed after WhatsApp discussion.',
        ])->assertOk()->assertJsonPath('data.status', 'confirmed');

        $this->patchJson("/api/v1/admin/orders/{$order->id}/pricing", [
            'final_total' => 245000,
            'admin_notes' => 'Adjusted for delivery packaging.',
        ])->assertOk()->assertJsonPath('data.final_total', 245000);
    }

    private function adminUser(): User
    {
        return User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
    }
}
