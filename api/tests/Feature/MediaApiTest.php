<?php

namespace Tests\Feature;

use App\Enums\AdminSecurityEventType;
use App\Models\Category;
use App\Models\MediaAsset;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaApiTest extends TestCase
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

        Storage::fake('public');
    }

    public function test_guest_cannot_access_admin_media_endpoints(): void
    {
        $this->getJson('/api/v1/admin/media')->assertUnauthorized();
        $this->getJson('/api/v1/admin/media/specs')->assertUnauthorized();
        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->image('product.jpg', 1200, 1200),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])->assertUnauthorized();
    }

    public function test_authenticated_user_without_media_permission_is_forbidden(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/media')->assertForbidden();
        $this->getJson('/api/v1/admin/media/specs')->assertForbidden();
        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->image('product.jpg', 1200, 1200),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])->assertForbidden();
    }

    public function test_admin_can_fetch_media_specs_and_upload_processed_media(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->getJson('/api/v1/admin/media/specs')
            ->assertOk()
            ->assertJsonPath('data.product.width', 1200)
            ->assertJsonPath('data.product.min_width', 600)
            ->assertJsonPath('data.category.height', 800);

        $response = $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->image('jollof.jpg', 1600, 1600)->size(1800),
            'spec' => 'product',
            'alt_text' => 'Signature Jollof Rice',
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.asset.purpose', 'product')
            ->assertJsonPath('data.asset.mime_type', 'image/webp')
            ->assertJsonPath('data.asset.width', 1200)
            ->assertJsonPath('data.asset.height', 1200)
            ->assertJsonPath('data.asset.alt_text', 'Signature Jollof Rice')
            ->assertJsonPath('data.asset.uploaded_by.id', $this->adminUser()->id)
            ->assertJsonPath('data.asset.metadata.retains_original_upload', false)
            ->assertJsonPath('data.asset.variants.medium.width', 600)
            ->assertJsonPath('data.asset.variants.thumbnail.height', 300);

        $assetId = (int) $response->json('data.asset.id');
        $asset = MediaAsset::query()->findOrFail($assetId);

        $this->assertDatabaseHas('media_assets', [
            'id' => $assetId,
            'purpose' => 'product',
            'mime_type' => 'image/webp',
            'uploaded_by' => $this->adminUser()->id,
        ]);
        Storage::disk('public')->assertExists($asset->path);
        Storage::disk('public')->assertExists($asset->variants['medium']['path']);
        Storage::disk('public')->assertExists($asset->variants['thumbnail']['path']);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::MediaUploaded->value,
        ]);
    }

    public function test_upload_validation_rejects_invalid_mime_oversized_tiny_and_corrupt_images(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->create('malware.jpg', 24, 'text/plain'),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonPath('errors.file.0', 'The uploaded file MIME type is not supported. Upload a JPG, PNG, or WebP image.');

        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->create('oversized.jpg', 6000, 'image/jpeg'),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonPath('errors.file.0', 'The uploaded image is larger than the 5 MB limit.');

        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->image('tiny.png', 200, 200)->size(100),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonPath('errors.file.0', 'The uploaded image is too small. Minimum source size for this upload is 600 x 600 pixels.');

        $this->post('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->create('corrupt.jpg', 100, 'image/jpeg'),
            'spec' => 'product',
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonPath('errors.file.0', 'The uploaded file could not be read as an image.');
    }

    public function test_admin_media_library_returns_usage_details_and_safe_delete_blocking(): void
    {
        Sanctum::actingAs($this->adminUser());

        $asset = $this->createStoredMediaAsset('product', 'Reusable event image');
        $product = Product::query()->where('slug', 'signature-jollof-rice')->firstOrFail();
        $category = Category::query()->where('slug', 'rice-dishes')->firstOrFail();

        $product->media()->syncWithoutDetaching([
            $asset->id => [
                'is_primary' => false,
                'sort_order' => 5,
            ],
        ]);
        $category->update(['image_media_id' => $asset->id]);

        $this->getJson('/api/v1/admin/media?purpose=product')
            ->assertOk()
            ->assertJsonPath('data.0.id', $asset->id);

        $this->getJson("/api/v1/admin/media/{$asset->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $asset->id)
            ->assertJsonPath('data.usage.products', 1)
            ->assertJsonPath('data.usage.categories', 1)
            ->assertJsonPath('data.usage.total', 2)
            ->assertJsonCount(1, 'data.used_by.products')
            ->assertJsonCount(1, 'data.used_by.categories');

        $this->deleteJson("/api/v1/admin/media/{$asset->id}")
            ->assertStatus(422)
            ->assertJsonPath('errors.media.0', 'This image is currently used by 2 records and cannot be deleted.');
    }

    public function test_unused_media_can_be_deleted_after_detaching_references(): void
    {
        Sanctum::actingAs($this->adminUser());

        $asset = $this->createStoredMediaAsset('product', 'Temporary product image');
        $product = Product::query()->where('slug', 'signature-jollof-rice')->firstOrFail();
        $product->media()->syncWithoutDetaching([
            $asset->id => [
                'is_primary' => false,
                'sort_order' => 6,
            ],
        ]);

        $this->deleteJson("/api/v1/admin/media/{$asset->id}")->assertStatus(422);

        $product->media()->detach($asset->id);

        $this->deleteJson("/api/v1/admin/media/{$asset->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Image deleted successfully.');

        $this->assertDatabaseMissing('media_assets', ['id' => $asset->id]);
        Storage::disk('public')->assertMissing($asset->path);
        Storage::disk('public')->assertMissing($asset->variants['medium']['path']);
        Storage::disk('public')->assertMissing($asset->variants['thumbnail']['path']);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::MediaDeleted->value,
        ]);
    }

    public function test_public_product_detail_returns_primary_image_and_ordered_gallery(): void
    {
        $product = Product::query()->where('slug', 'signature-jollof-rice')->firstOrFail();

        $imageA = $this->createStoredMediaAsset('product', 'Gallery A');
        $imageB = $this->createStoredMediaAsset('product', 'Gallery B');
        $imageC = $this->createStoredMediaAsset('product', 'Gallery C');

        $product->media()->sync([
            $imageB->id => ['is_primary' => true, 'sort_order' => 0],
            $imageA->id => ['is_primary' => false, 'sort_order' => 1],
            $imageC->id => ['is_primary' => false, 'sort_order' => 2],
        ]);

        $this->getJson('/api/v1/products/signature-jollof-rice')
            ->assertOk()
            ->assertJsonPath('data.primary_image.id', $imageB->id)
            ->assertJsonPath('data.media.0.id', $imageB->id)
            ->assertJsonPath('data.media.0.is_primary', true)
            ->assertJsonPath('data.media.1.id', $imageA->id)
            ->assertJsonPath('data.media.1.sort_order', 1)
            ->assertJsonPath('data.media.2.id', $imageC->id)
            ->assertJsonPath('data.media.2.sort_order', 2);

        $catalogResponse = $this->getJson('/api/v1/products')->assertOk();
        $catalogProduct = collect($catalogResponse->json('data'))->firstWhere('slug', 'signature-jollof-rice');

        $this->assertNotNull($catalogProduct);
        $this->assertSame($imageB->id, data_get($catalogProduct, 'primary_image.id'));
        $this->assertArrayNotHasKey('media', $catalogProduct);
    }

    private function createStoredMediaAsset(string $purpose, string $altText): MediaAsset
    {
        $directory = 'visemfood/testing/'.now()->format('Y/m');
        $baseName = Str::uuid()->toString();
        $width = $purpose === 'category' ? 1200 : 1200;
        $height = $purpose === 'category' ? 800 : 1200;
        $mediumWidth = $purpose === 'category' ? 900 : 600;
        $mediumHeight = $purpose === 'category' ? 600 : 600;
        $thumbWidth = $purpose === 'category' ? 450 : 300;
        $thumbHeight = $purpose === 'category' ? 300 : 300;
        $variants = [];

        foreach ([
            'large' => [$width, $height],
            'medium' => [$mediumWidth, $mediumHeight],
            'thumbnail' => [$thumbWidth, $thumbHeight],
        ] as $variantKey => [$variantWidth, $variantHeight]) {
            $path = "{$directory}/{$baseName}-{$variantKey}.webp";
            $contents = sprintf('%s-%s', $altText, $variantKey);
            Storage::disk('public')->put($path, $contents);

            $variants[$variantKey] = [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'width' => $variantWidth,
                'height' => $variantHeight,
                'size_bytes' => strlen($contents),
            ];
        }

        return MediaAsset::query()->create([
            'storage_driver' => 'local',
            'disk' => 'public',
            'path' => $variants['large']['path'],
            'url' => $variants['large']['url'],
            'directory' => $directory,
            'filename' => basename($variants['large']['path']),
            'original_filename' => Str::slug($altText).'.webp',
            'mime_type' => 'image/webp',
            'extension' => 'webp',
            'size_bytes' => $variants['large']['size_bytes'],
            'width' => $width,
            'height' => $height,
            'alt_text' => $altText,
            'purpose' => $purpose,
            'uploaded_by' => $this->adminUser()->id,
            'variants' => $variants,
            'metadata' => [
                'seeded_for_test' => true,
            ],
        ]);
    }

    private function adminUser(): User
    {
        return User::query()->where('email', 'admin@visemfood.test')->firstOrFail();
    }
}
