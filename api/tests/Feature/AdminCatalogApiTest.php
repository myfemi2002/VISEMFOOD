<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\PermissionSeeder;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            PermissionSeeder::class,
            AdminUserSeeder::class,
            CatalogSeeder::class,
        ]);
    }

    public function test_admin_can_create_a_category_and_product_then_update_availability(): void
    {
        Sanctum::actingAs($this->adminUser());

        $categoryResponse = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Specials',
            'slug' => 'specials',
            'description' => 'Chef specials and seasonal drops.',
            'status' => 'active',
            'sort_order' => 20,
        ])->assertCreated();

        $categoryId = (int) $categoryResponse->json('data.id');

        $productResponse = $this->postJson('/api/v1/admin/products', [
            'category_id' => $categoryId,
            'product_type' => 'menu_item',
            'name' => 'Smoked Turkey Rice',
            'slug' => 'smoked-turkey-rice',
            'short_description' => 'Rice with smoked turkey and heritage spice.',
            'description' => 'A rich rice dish for premium lunch orders.',
            'base_price' => 25.00,
            'currency_code' => 'USD',
            'serving_size' => 'Small bowl',
            'status' => 'published',
            'availability_status' => 'available',
            'featured' => true,
            'available_for_order' => true,
            'variants' => [
                [
                    'name' => 'Small',
                    'portion_label' => 'Small bowl',
                    'price' => 25.00,
                    'availability_status' => 'available',
                    'is_default' => true,
                ],
            ],
        ])->assertCreated();

        $productId = (int) $productResponse->json('data.id');

        $this->patchJson("/api/v1/admin/products/{$productId}/availability", [
            'availability_status' => 'limited',
            'available_for_order' => true,
        ])->assertOk()->assertJsonPath('data.availability_status', 'limited');
    }

    public function test_permission_is_enforced_for_protected_catalog_routes(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/products')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    private function adminUser(): User
    {
        return User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
    }
}
