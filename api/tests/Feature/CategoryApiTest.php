<?php

namespace Tests\Feature;

use App\Enums\AdminSecurityEventType;
use App\Enums\CategoryStatus;
use App\Models\AdminSecurityEvent;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryApiTest extends TestCase
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

    public function test_public_categories_only_return_active_rows_in_sort_order(): void
    {
        Category::query()->create([
            'name' => 'Celebration Specials',
            'slug' => 'celebration-specials',
            'description' => 'Seasonal menus and celebration exclusives.',
            'status' => CategoryStatus::Active,
            'sort_order' => 1,
        ]);

        Category::query()->create([
            'name' => 'Hidden Category',
            'slug' => 'hidden-category',
            'description' => 'Should not appear publicly.',
            'status' => CategoryStatus::Inactive,
            'sort_order' => 0,
        ]);

        $response = $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonPath('success', true);

        $items = $response->json('data');

        $this->assertIsArray($items);
        $this->assertNotEmpty($items);
        $this->assertSame('Rice Dishes', $items[0]['name']);
        $this->assertSame('Celebration Specials', $items[1]['name']);
        $this->assertFalse(collect($items)->contains(fn (array $item): bool => $item['slug'] === 'hidden-category'));
        $this->assertFalse(array_key_exists('status', $items[0]));
        $this->assertFalse(array_key_exists('created_at', $items[0]));
    }

    public function test_authenticated_admin_can_list_categories(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->getJson('/api/v1/admin/categories')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'sort_order',
                        'status',
                        'products_count',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'meta' => [
                    'pagination' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                        'from',
                        'to',
                    ],
                ],
            ]);
    }

    public function test_guest_cannot_modify_categories(): void
    {
        $this->postJson('/api/v1/admin/categories', [
            'name' => 'Rice Dishes',
            'status' => 'active',
        ])->assertUnauthorized();
    }

    public function test_user_without_category_permissions_cannot_manage_categories(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $category = Category::query()->firstOrFail();

        $this->getJson('/api/v1/admin/categories')->assertForbidden();
        $this->putJson("/api/v1/admin/categories/{$category->id}", [
            'name' => $category->name,
            'status' => $category->status?->value ?? $category->status,
        ])->assertForbidden();
        $this->deleteJson("/api/v1/admin/categories/{$category->id}")->assertForbidden();
    }

    public function test_admin_can_create_category_with_normalized_slug_and_audit_event(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->postJson('/api/v1/admin/categories', [
            'name' => 'Rice Dishes',
            'slug' => 'Weekend Specials',
            'description' => 'Premium seasonal rice offerings.',
            'status' => 'active',
            'sort_order' => 30,
        ])->assertCreated();

        $categoryId = (int) $response->json('data.id');

        $this->assertDatabaseHas('categories', [
            'id' => $categoryId,
            'slug' => 'weekend-specials',
            'status' => CategoryStatus::Active->value,
            'sort_order' => 30,
        ]);

        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CategoryCreated->value,
        ]);
    }

    public function test_slug_validation_uses_the_normalized_slug_value(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/v1/admin/categories', [
            'name' => 'Rice Dishes',
            'slug' => 'Rice Dishes',
            'description' => 'Duplicate slug after normalization.',
            'status' => 'active',
        ])->assertStatus(422)->assertJsonValidationErrors(['slug']);
    }

    public function test_admin_can_update_category_without_forcing_slug_changes(): void
    {
        Sanctum::actingAs($this->adminUser());
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $this->putJson("/api/v1/admin/categories/{$category->id}", [
            'name' => 'Rice Signatures',
            'description' => 'Updated signature rice dishes.',
            'status' => 'active',
            'sort_order' => 9,
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'rice-dishes')
            ->assertJsonPath('data.name', 'Rice Signatures');

        $category->refresh();

        $this->assertSame('rice-dishes', $category->slug);
        $this->assertSame('Rice Signatures', $category->name);
        $this->assertSame(9, $category->sort_order);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CategoryUpdated->value,
        ]);
    }

    public function test_admin_can_deactivate_and_reactivate_category_and_public_visibility_updates(): void
    {
        Sanctum::actingAs($this->adminUser());
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $this->putJson("/api/v1/admin/categories/{$category->id}", [
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'status' => 'inactive',
            'sort_order' => $category->sort_order,
        ])->assertOk()->assertJsonPath('data.status', 'inactive');

        $category->refresh();
        $this->assertSame(CategoryStatus::Inactive, $category->status);

        $publicAfterDeactivate = $this->getJson('/api/v1/categories')->assertOk()->json('data');
        $this->assertFalse(collect($publicAfterDeactivate)->contains(fn (array $item): bool => $item['slug'] === 'rice-dishes'));

        $this->putJson("/api/v1/admin/categories/{$category->id}", [
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'status' => 'active',
            'sort_order' => $category->sort_order,
        ])->assertOk()->assertJsonPath('data.status', 'active');

        $publicAfterReactivate = $this->getJson('/api/v1/categories')->assertOk()->json('data');
        $this->assertTrue(collect($publicAfterReactivate)->contains(fn (array $item): bool => $item['slug'] === 'rice-dishes'));

        $this->assertSame(
            2,
            AdminSecurityEvent::query()->where('event_type', AdminSecurityEventType::CategoryStatusChanged->value)->count(),
        );
    }

    public function test_category_with_products_cannot_be_deleted_and_products_remain(): void
    {
        Sanctum::actingAs($this->adminUser());
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();
        $productId = Product::query()->where('category_id', $category->id)->value('id');

        $this->deleteJson("/api/v1/admin/categories/{$category->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'This category contains products and cannot be deleted. Deactivate it instead.');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('products', ['id' => $productId]);
    }

    public function test_empty_category_can_be_deleted_and_logs_an_event(): void
    {
        Sanctum::actingAs($this->adminUser());

        $category = Category::query()->create([
            'name' => 'Private Dining',
            'slug' => 'private-dining',
            'description' => 'Custom dining experiences.',
            'status' => CategoryStatus::Active,
            'sort_order' => 50,
        ]);

        $this->deleteJson("/api/v1/admin/categories/{$category->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CategoryDeleted->value,
        ]);
    }

    private function adminUser(): User
    {
        return User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
    }
}
