<?php

namespace Tests\Feature;

use App\Enums\AdminSecurityEventType;
use App\Enums\CategoryStatus;
use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\PublicationStatus;
use App\Models\AdminSecurityEvent;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
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

    public function test_public_products_only_return_published_orderable_products_in_active_categories(): void
    {
        $activeCategory = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $draftProduct = Product::query()->create([
            'category_id' => $activeCategory->id,
            'product_type' => 'menu_item',
            'name' => 'Draft Rice Bowl',
            'slug' => 'draft-rice-bowl',
            'short_description' => 'Should stay hidden.',
            'base_price' => 22.00,
            'currency_code' => 'USD',
            'serving_size' => 'Single bowl',
            'status' => PublicationStatus::Draft,
            'availability_status' => ProductAvailabilityStatus::Available,
            'available_for_order' => true,
        ]);
        $draftProduct->variants()->create([
            'name' => 'Standard',
            'slug' => 'standard',
            'price' => 22.00,
            'currency_code' => 'USD',
            'availability_status' => ProductAvailabilityStatus::Available,
            'is_default' => true,
            'sort_order' => 0,
        ]);

        $inactiveCategory = Category::query()->create([
            'name' => 'Hidden Rice',
            'slug' => 'hidden-rice',
            'description' => 'Inactive category products stay hidden.',
            'status' => CategoryStatus::Inactive,
            'sort_order' => 50,
        ]);
        $inactiveCategoryProduct = Product::query()->create([
            'category_id' => $inactiveCategory->id,
            'product_type' => 'menu_item',
            'name' => 'Hidden Rice Plate',
            'slug' => 'hidden-rice-plate',
            'short_description' => 'Should not appear publicly.',
            'base_price' => 18.00,
            'currency_code' => 'USD',
            'serving_size' => 'Dinner plate',
            'status' => PublicationStatus::Published,
            'availability_status' => ProductAvailabilityStatus::Available,
            'available_for_order' => true,
        ]);
        $inactiveCategoryProduct->variants()->create([
            'name' => 'Standard',
            'slug' => 'standard',
            'price' => 18.00,
            'currency_code' => 'USD',
            'availability_status' => ProductAvailabilityStatus::Available,
            'is_default' => true,
            'sort_order' => 0,
        ]);

        $response = $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonPath('success', true);

        $items = collect($response->json('data'));

        $this->assertTrue($items->contains(fn (array $item): bool => $item['slug'] === 'signature-jollof-rice'));
        $this->assertFalse($items->contains(fn (array $item): bool => $item['slug'] === 'draft-rice-bowl'));
        $this->assertFalse($items->contains(fn (array $item): bool => $item['slug'] === 'hidden-rice-plate'));
    }

    public function test_public_product_detail_returns_variants_and_hides_unavailable_variants(): void
    {
        $product = Product::query()->where('slug', 'signature-jollof-rice')->firstOrFail();
        $product->variants()->where('name', 'Medium')->firstOrFail()->update([
            'availability_status' => ProductAvailabilityStatus::Unavailable,
        ]);

        $response = $this->getJson('/api/v1/products/signature-jollof-rice')
            ->assertOk()
            ->assertJsonPath('data.slug', 'signature-jollof-rice')
            ->assertJsonPath('data.default_variant.name', 'Small')
            ->assertJsonPath('data.base_price', 25)
            ->assertJsonPath('data.price', 25)
            ->assertJsonPath('data.currency_code', 'USD');

        $variants = collect($response->json('data.variants'));

        $this->assertCount(2, $variants);
        $this->assertFalse($variants->contains(fn (array $variant): bool => $variant['name'] === 'Medium'));
    }

    public function test_unknown_public_product_slug_returns_not_found(): void
    {
        $this->getJson('/api/v1/products/does-not-exist')->assertNotFound();
    }

    public function test_admin_can_create_a_product_with_variants_and_audit_events(): void
    {
        Sanctum::actingAs($this->adminUser());
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $response = $this->postJson('/api/v1/admin/products', [
            'category_id' => $category->id,
            'product_type' => 'menu_item',
            'name' => 'Signature Jollof Rice Deluxe',
            'slug' => 'signature-jollof-rice-deluxe',
            'short_description' => 'A richer party-ready rice option.',
            'description' => 'A premium rice dish for elevated hospitality service.',
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
                    'sort_order' => 0,
                ],
                [
                    'name' => 'Medium',
                    'portion_label' => 'Medium bowl',
                    'price' => 40.00,
                    'availability_status' => 'available',
                    'sort_order' => 1,
                ],
                [
                    'name' => 'Large',
                    'portion_label' => 'Large bowl',
                    'price' => 60.00,
                    'availability_status' => 'available',
                    'sort_order' => 2,
                ],
            ],
        ])->assertCreated();

        $productId = (int) $response->json('data.id');

        $this->assertDatabaseHas('products', [
            'id' => $productId,
            'slug' => 'signature-jollof-rice-deluxe',
            'currency_code' => 'USD',
            'featured' => 1,
        ]);
        $this->assertSame(
            3,
            ProductVariant::query()->where('product_id', $productId)->count(),
        );
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::ProductCreated->value,
        ]);
        $this->assertSame(
            3,
            AdminSecurityEvent::query()->where('event_type', AdminSecurityEventType::VariantCreated->value)->count(),
        );
    }

    public function test_admin_can_update_a_product_without_forcing_slug_changes(): void
    {
        Sanctum::actingAs($this->adminUser());
        $product = Product::query()
            ->with('variants')
            ->where('slug', 'signature-jollof-rice')
            ->firstOrFail();

        $variants = $product->variants->sortBy('sort_order')->values();

        $this->putJson("/api/v1/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'product_type' => $product->product_type->value,
            'name' => 'Signature Jollof Rice Updated',
            'short_description' => 'Updated short description.',
            'description' => 'Updated long description.',
            'base_price' => 25.00,
            'currency_code' => 'USD',
            'serving_size' => 'Small bowl',
            'status' => 'published',
            'availability_status' => 'available',
            'featured' => false,
            'available_for_order' => true,
            'variants' => [
                [
                    'id' => $variants[0]->id,
                    'name' => 'Small',
                    'portion_label' => 'Small bowl',
                    'price' => 25.00,
                    'availability_status' => 'available',
                    'is_default' => true,
                    'sort_order' => 0,
                ],
                [
                    'id' => $variants[1]->id,
                    'name' => 'Medium',
                    'portion_label' => 'Medium bowl',
                    'price' => 42.00,
                    'availability_status' => 'available',
                    'sort_order' => 1,
                ],
                [
                    'id' => $variants[2]->id,
                    'name' => 'Large',
                    'portion_label' => 'Large bowl',
                    'price' => 60.00,
                    'availability_status' => 'available',
                    'sort_order' => 2,
                ],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'signature-jollof-rice')
            ->assertJsonPath('data.name', 'Signature Jollof Rice Updated');

        $product->refresh();
        $mediumVariant = ProductVariant::query()->whereKey($variants[1]->id)->firstOrFail();

        $this->assertSame('signature-jollof-rice', $product->slug);
        $this->assertSame('Signature Jollof Rice Updated', $product->name);
        $this->assertSame(42.0, (float) $mediumVariant->price);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::ProductUpdated->value,
        ]);
    }

    public function test_variant_from_another_product_is_rejected_when_updating(): void
    {
        Sanctum::actingAs($this->adminUser());
        $product = Product::query()->with('variants')->where('slug', 'signature-jollof-rice')->firstOrFail();
        $foreignVariant = ProductVariant::query()
            ->whereHas('product', fn ($query) => $query->where('slug', 'egusi-soup-bowl'))
            ->firstOrFail();

        $this->putJson("/api/v1/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'product_type' => $product->product_type->value,
            'name' => $product->name,
            'slug' => $product->slug,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'base_price' => (float) $product->base_price,
            'currency_code' => 'USD',
            'serving_size' => $product->serving_size,
            'status' => $product->status->value,
            'availability_status' => $product->availability_status->value,
            'featured' => (bool) $product->featured,
            'available_for_order' => (bool) $product->available_for_order,
            'variants' => [
                [
                    'id' => $foreignVariant->id,
                    'name' => $foreignVariant->name,
                    'portion_label' => $foreignVariant->portion_label,
                    'price' => (float) $foreignVariant->price,
                    'availability_status' => $foreignVariant->availability_status->value,
                    'is_default' => true,
                    'sort_order' => 0,
                ],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['variants.0.id']);
    }

    public function test_removing_a_variant_with_order_history_deactivates_it_instead_of_deleting_it(): void
    {
        Sanctum::actingAs($this->adminUser());
        $product = Product::query()->with('variants')->where('slug', 'signature-jollof-rice')->firstOrFail();
        $variants = $product->variants->sortBy('sort_order')->values();
        $mediumVariant = $variants[1];
        $this->createOrderForProduct($product, $mediumVariant);

        $this->putJson("/api/v1/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'product_type' => $product->product_type->value,
            'name' => $product->name,
            'slug' => $product->slug,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'base_price' => (float) $product->base_price,
            'currency_code' => 'USD',
            'serving_size' => $product->serving_size,
            'status' => $product->status->value,
            'availability_status' => $product->availability_status->value,
            'featured' => (bool) $product->featured,
            'available_for_order' => (bool) $product->available_for_order,
            'variants' => [
                [
                    'id' => $variants[0]->id,
                    'name' => $variants[0]->name,
                    'portion_label' => $variants[0]->portion_label,
                    'price' => (float) $variants[0]->price,
                    'availability_status' => $variants[0]->availability_status->value,
                    'is_default' => true,
                    'sort_order' => 0,
                ],
                [
                    'id' => $variants[2]->id,
                    'name' => $variants[2]->name,
                    'portion_label' => $variants[2]->portion_label,
                    'price' => (float) $variants[2]->price,
                    'availability_status' => $variants[2]->availability_status->value,
                    'sort_order' => 2,
                ],
            ],
        ])->assertOk();

        $mediumVariant->refresh();

        $this->assertDatabaseHas('product_variants', [
            'id' => $mediumVariant->id,
            'product_id' => $product->id,
            'availability_status' => ProductAvailabilityStatus::Unavailable->value,
        ]);
        $this->assertFalse((bool) $mediumVariant->is_default);
    }

    public function test_product_referenced_by_orders_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->adminUser());
        $product = Product::query()->where('slug', 'signature-jollof-rice')->firstOrFail();
        $variant = $product->variants()->where('name', 'Small')->firstOrFail();
        $this->createOrderForProduct($product, $variant);

        $this->deleteJson("/api/v1/admin/products/{$product->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Unable to delete product.');

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_category_foreign_key_restricts_deletion_when_products_exist(): void
    {
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $this->expectException(QueryException::class);

        Category::query()->whereKey($category->id)->delete();
    }

    private function createOrderForProduct(Product $product, ?ProductVariant $variant = null): Order
    {
        $variant ??= $product->variants()->first();
        $unitPrice = (float) ($variant?->price ?? $product->base_price);

        $order = Order::query()->create([
            'order_number' => 'VF-TEST-'.str()->random(8),
            'customer_name' => 'Test Customer',
            'customer_email' => 'customer@example.test',
            'customer_phone' => '+15551234567',
            'delivery_type' => DeliveryType::Pickup,
            'currency_code' => 'USD',
            'subtotal' => $unitPrice,
            'delivery_fee' => 0,
            'discount_amount' => 0,
            'estimated_total' => $unitPrice,
            'status' => OrderStatus::Draft,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'product_name' => $product->name,
            'variant_name' => $variant?->name,
            'unit_price' => $unitPrice,
            'quantity' => 1,
            'line_total' => $unitPrice,
        ]);

        return $order;
    }

    private function adminUser(): User
    {
        return User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
    }
}
