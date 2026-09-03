<?php

namespace Tests\Feature;

use App\Enums\AdminSecurityEventType;
use App\Enums\CateringInquiryStatus;
use App\Enums\CateringPackageStatus;
use App\Models\CateringInquiry;
use App\Models\CateringPackage;
use App\Models\MediaAsset;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CateringApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            PermissionSeeder::class,
            AdminUserSeeder::class,
        ]);

        Storage::fake('public');
    }

    public function test_public_catering_package_list_returns_only_active_packages_in_expected_order_with_safe_fields(): void
    {
        $standardLater = $this->createPackage([
            'name' => 'Corporate Lunch Package',
            'slug' => 'corporate-lunch-package',
            'sort_order' => 5,
        ]);

        $standardEarlier = $this->createPackage([
            'name' => 'Family Celebration Package',
            'slug' => 'family-celebration-package',
            'sort_order' => 1,
        ]);

        $featured = $this->createPackage([
            'name' => 'Premium Event Package',
            'slug' => 'premium-event-package',
            'featured' => true,
            'sort_order' => 9,
        ]);

        $this->createPackage([
            'name' => 'Archived Catering Package',
            'slug' => 'archived-catering-package',
            'status' => CateringPackageStatus::Inactive->value,
            'sort_order' => 0,
        ]);

        $this->getJson('/api/v1/catering-packages')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', $featured->id)
            ->assertJsonPath('data.1.id', $standardEarlier->id)
            ->assertJsonPath('data.2.id', $standardLater->id)
            ->assertJsonPath('data.0.currency_code', 'USD')
            ->assertJsonPath('data.0.image.id', $featured->image_media_id)
            ->assertJsonMissingPath('data.0.status')
            ->assertJsonMissingPath('data.0.created_at')
            ->assertJsonMissingPath('data.0.updated_at');
    }

    public function test_public_catering_inquiry_can_reference_active_package_without_leaking_private_fields(): void
    {
        $package = $this->createPackage([
            'name' => 'Celebration Catering Package',
            'slug' => 'celebration-catering-package',
            'featured' => true,
        ]);

        $response = $this->postJson('/api/v1/catering', [
            'catering_package_id' => $package->id,
            'customer_name' => 'Test Customer',
            'email' => 'customer@example.test',
            'phone' => '+15550102000',
            'event_type' => 'Birthday',
            'event_date' => now()->addDays(14)->toDateString(),
            'number_of_guests' => 60,
            'preferred_service' => 'Bespoke Catering',
            'location' => 'Test Event Venue',
            'budget_amount' => 1200.00,
            'requirements' => 'Buffet service with vegetarian options.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.customer_name', 'Test Customer')
            ->assertJsonPath('data.catering_package.id', $package->id)
            ->assertJsonPath('data.catering_package.slug', 'celebration-catering-package')
            ->assertJsonMissingPath('data.email')
            ->assertJsonMissingPath('data.phone')
            ->assertJsonMissingPath('data.status')
            ->assertJsonMissingPath('data.internal_notes');

        $inquiry = CateringInquiry::query()->firstOrFail();

        $this->assertSame($package->id, $inquiry->catering_package_id);
        $this->assertSame(CateringInquiryStatus::New, $inquiry->status);
        $this->assertSame('1200.00', $inquiry->budget_amount);
    }

    public function test_public_catering_inquiry_rejects_inactive_package(): void
    {
        $package = $this->createPackage([
            'status' => CateringPackageStatus::Inactive->value,
        ]);

        $this->postJson('/api/v1/catering', [
            'catering_package_id' => $package->id,
            'customer_name' => 'Blocked Customer',
            'email' => 'blocked@example.test',
            'phone' => '+15550102001',
            'event_type' => 'Birthday',
            'event_date' => now()->addDays(10)->toDateString(),
            'number_of_guests' => 40,
            'location' => 'Venue',
        ])
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonValidationErrors(['catering_package_id']);

        $this->assertDatabaseCount('catering_inquiries', 0);
    }

    public function test_guest_cannot_access_admin_catering_routes(): void
    {
        $package = $this->createPackage();
        $inquiry = $this->createInquiry($package);

        $this->getJson('/api/v1/admin/catering-packages')->assertUnauthorized();
        $this->postJson('/api/v1/admin/catering-packages', [
            'name' => 'Guest Package',
            'starting_price' => 500,
            'minimum_guests' => 20,
            'status' => CateringPackageStatus::Active->value,
        ])->assertUnauthorized();
        $this->getJson('/api/v1/admin/catering-inquiries')->assertUnauthorized();
        $this->getJson("/api/v1/admin/catering-inquiries/{$inquiry->id}")->assertUnauthorized();
        $this->patchJson("/api/v1/admin/catering-inquiries/{$inquiry->id}", [
            'status' => CateringInquiryStatus::Contacted->value,
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_without_catering_permissions_is_forbidden(): void
    {
        $package = $this->createPackage();
        $inquiry = $this->createInquiry($package);

        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/admin/catering-packages')->assertForbidden();
        $this->postJson('/api/v1/admin/catering-packages', [
            'name' => 'Forbidden Package',
            'starting_price' => 500,
            'minimum_guests' => 20,
            'status' => CateringPackageStatus::Active->value,
        ])->assertForbidden();
        $this->getJson('/api/v1/admin/catering-inquiries')->assertForbidden();
        $this->getJson("/api/v1/admin/catering-inquiries/{$inquiry->id}")->assertForbidden();
        $this->patchJson("/api/v1/admin/catering-inquiries/{$inquiry->id}", [
            'status' => CateringInquiryStatus::Contacted->value,
        ])->assertForbidden();
    }

    public function test_admin_can_create_list_show_update_and_deactivate_catering_package_with_media(): void
    {
        Sanctum::actingAs($this->adminUser());

        $media = $this->createStoredMediaAsset('catering', 'Celebration package image');

        $createResponse = $this->postJson('/api/v1/admin/catering-packages', [
            'name' => 'Celebration Catering Package',
            'slug' => 'celebration-catering-package',
            'short_description' => 'Flexible catering for private events.',
            'description' => 'A flexible event package for birthdays and family celebrations.',
            'starting_price' => 850.00,
            'minimum_guests' => 30,
            'maximum_guests' => 100,
            'image_media_id' => $media->id,
            'inclusions' => ['Buffet line', 'Vegetarian options'],
            'featured' => true,
            'status' => CateringPackageStatus::Active->value,
            'sort_order' => 1,
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Celebration Catering Package')
            ->assertJsonPath('data.image.id', $media->id)
            ->assertJsonPath('data.starting_price', 850)
            ->assertJsonPath('data.currency_code', 'USD');

        $packageId = (int) $createResponse->json('data.id');

        $this->getJson('/api/v1/admin/catering-packages?featured=true')
            ->assertOk()
            ->assertJsonPath('data.0.id', $packageId);

        $this->getJson("/api/v1/admin/catering-packages/{$packageId}")
            ->assertOk()
            ->assertJsonPath('data.id', $packageId)
            ->assertJsonPath('data.image.id', $media->id);

        $this->putJson("/api/v1/admin/catering-packages/{$packageId}", [
            'name' => 'Celebration Catering Package',
            'slug' => 'celebration-catering-package',
            'short_description' => 'Updated event-ready package.',
            'description' => 'Updated package details for milestone events and private celebrations.',
            'starting_price' => 950.00,
            'minimum_guests' => 40,
            'maximum_guests' => 120,
            'image_media_id' => $media->id,
            'inclusions' => ['Buffet line', 'Vegetarian options', 'Beverage planning'],
            'featured' => false,
            'status' => CateringPackageStatus::Inactive->value,
            'sort_order' => 3,
        ])
            ->assertOk()
            ->assertJsonPath('data.status', CateringPackageStatus::Inactive->value)
            ->assertJsonPath('data.starting_price', 950)
            ->assertJsonPath('data.minimum_guests', 40);

        $package = CateringPackage::query()->findOrFail($packageId);

        $this->assertSame(CateringPackageStatus::Inactive, $package->status);
        $this->assertSame('950.00', $package->starting_price);
        $this->assertSame($media->id, $package->image_media_id);
        $this->assertSame('USD', $package->currency_code);

        $publicIds = collect($this->getJson('/api/v1/catering-packages')->json('data'))->pluck('id');
        $this->assertFalse($publicIds->contains($packageId));

        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringPackageCreated->value,
        ]);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringPackageUpdated->value,
        ]);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringPackageStatusChanged->value,
        ]);
    }

    public function test_catering_package_delete_is_blocked_when_inquiry_exists_and_unused_package_can_be_deleted(): void
    {
        Sanctum::actingAs($this->adminUser());

        $protectedPackage = $this->createPackage([
            'name' => 'Protected Catering Package',
            'slug' => 'protected-catering-package',
        ]);
        $this->createInquiry($protectedPackage);

        $this->deleteJson("/api/v1/admin/catering-packages/{$protectedPackage->id}")
            ->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.package.0', 'This catering package is referenced by existing inquiries and cannot be deleted. Deactivate it instead.');

        $this->assertDatabaseHas('catering_packages', ['id' => $protectedPackage->id]);

        $unusedPackage = $this->createPackage([
            'name' => 'Disposable Catering Package',
            'slug' => 'disposable-catering-package',
        ]);

        $this->deleteJson("/api/v1/admin/catering-packages/{$unusedPackage->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Catering package deleted successfully.');

        $this->assertDatabaseMissing('catering_packages', ['id' => $unusedPackage->id]);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringPackageDeleted->value,
        ]);
    }

    public function test_admin_can_list_show_and_update_catering_inquiries_with_internal_notes(): void
    {
        Sanctum::actingAs($this->adminUser());

        $package = $this->createPackage([
            'name' => 'Inquiry Package',
            'slug' => 'inquiry-package',
            'featured' => true,
        ]);

        $inquiry = $this->createInquiry($package, [
            'customer_name' => 'Event Customer',
            'email' => 'event.customer@example.test',
            'phone' => '+15550102004',
            'event_type' => 'Corporate Dinner',
            'budget_amount' => 1800.00,
        ]);

        $this->getJson('/api/v1/admin/catering-inquiries?status=new')
            ->assertOk()
            ->assertJsonPath('data.0.id', $inquiry->id)
            ->assertJsonPath('data.0.catering_package.id', $package->id);

        $this->getJson("/api/v1/admin/catering-inquiries/{$inquiry->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $inquiry->id)
            ->assertJsonPath('data.email', 'event.customer@example.test')
            ->assertJsonPath('data.catering_package.slug', 'inquiry-package')
            ->assertJsonPath('data.status', CateringInquiryStatus::New->value);

        $this->patchJson("/api/v1/admin/catering-inquiries/{$inquiry->id}", [
            'status' => CateringInquiryStatus::Contacted->value,
            'assigned_to_user_id' => $this->adminUser()->id,
            'internal_notes' => 'Spoke with customer. Preparing quotation.',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', CateringInquiryStatus::Contacted->value)
            ->assertJsonPath('data.internal_notes', 'Spoke with customer. Preparing quotation.')
            ->assertJsonPath('data.assigned_to.id', $this->adminUser()->id);

        $inquiry->refresh();

        $this->assertSame(CateringInquiryStatus::Contacted, $inquiry->status);
        $this->assertSame('Spoke with customer. Preparing quotation.', $inquiry->internal_notes);
        $this->assertSame($this->adminUser()->id, $inquiry->assigned_to_user_id);

        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringInquiryStatusChanged->value,
        ]);
        $this->assertDatabaseHas('admin_security_events', [
            'user_id' => $this->adminUser()->id,
            'event_type' => AdminSecurityEventType::CateringInquiryNotesUpdated->value,
        ]);
    }

    private function createPackage(array $overrides = []): CateringPackage
    {
        $name = $overrides['name'] ?? 'Essential Gathering Package';
        $slug = $overrides['slug'] ?? Str::slug($name).'-'.Str::lower(Str::random(6));
        $image = $overrides['image_media_id'] ?? $this->createStoredMediaAsset('catering', $name.' image')->id;

        return CateringPackage::query()->create([
            'name' => $name,
            'slug' => $slug,
            'short_description' => $overrides['short_description'] ?? 'Flexible catering package for warm, polished events.',
            'description' => $overrides['description'] ?? 'Package built for buffet service, premium hospitality, and practical event coordination.',
            'starting_price' => $overrides['starting_price'] ?? 450.00,
            'currency_code' => 'USD',
            'minimum_guests' => $overrides['minimum_guests'] ?? 20,
            'maximum_guests' => $overrides['maximum_guests'] ?? 60,
            'image_media_id' => $image,
            'inclusions' => $overrides['inclusions'] ?? ['Buffet service', 'Disposable packs'],
            'featured' => $overrides['featured'] ?? false,
            'status' => $overrides['status'] ?? CateringPackageStatus::Active->value,
            'sort_order' => $overrides['sort_order'] ?? 0,
        ]);
    }

    private function createInquiry(?CateringPackage $package = null, array $overrides = []): CateringInquiry
    {
        return CateringInquiry::query()->create([
            'reference_number' => $overrides['reference_number'] ?? 'CAT-TEST-'.Str::upper(Str::random(8)),
            'catering_package_id' => $overrides['catering_package_id'] ?? $package?->id,
            'customer_name' => $overrides['customer_name'] ?? 'Sample Customer',
            'email' => $overrides['email'] ?? 'sample.customer@example.test',
            'phone' => $overrides['phone'] ?? '+15550102003',
            'event_type' => $overrides['event_type'] ?? 'Private Celebration',
            'event_date' => $overrides['event_date'] ?? now()->addDays(10),
            'number_of_guests' => $overrides['number_of_guests'] ?? 50,
            'preferred_service' => $overrides['preferred_service'] ?? 'Bespoke Catering',
            'location' => $overrides['location'] ?? 'Lekki Event Hall',
            'budget' => $overrides['budget'] ?? '$1,000 - $1,500',
            'budget_amount' => $overrides['budget_amount'] ?? 1250.00,
            'requirements' => $overrides['requirements'] ?? 'Buffet service with vegetarian options.',
            'notes' => $overrides['notes'] ?? null,
            'status' => $overrides['status'] ?? CateringInquiryStatus::New->value,
            'assigned_to_user_id' => $overrides['assigned_to_user_id'] ?? null,
            'internal_notes' => $overrides['internal_notes'] ?? null,
        ]);
    }

    private function createStoredMediaAsset(string $purpose, string $altText): MediaAsset
    {
        $directory = 'visemfood/testing/'.now()->format('Y/m');
        $baseName = Str::uuid()->toString();
        $width = $purpose === 'category' ? 1200 : 1600;
        $height = $purpose === 'category' ? 800 : 900;
        $mediumWidth = $purpose === 'category' ? 900 : 1200;
        $mediumHeight = $purpose === 'category' ? 600 : 675;
        $thumbnailWidth = $purpose === 'category' ? 450 : 400;
        $thumbnailHeight = $purpose === 'category' ? 300 : 225;
        $variants = [];

        foreach ([
            'large' => [$width, $height],
            'medium' => [$mediumWidth, $mediumHeight],
            'thumbnail' => [$thumbnailWidth, $thumbnailHeight],
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

