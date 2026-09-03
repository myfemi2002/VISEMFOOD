<?php

namespace Database\Seeders;

use App\Enums\CateringPackageStatus;
use App\Models\CateringPackage;
use App\Models\MediaAsset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CateringPackageSeeder extends Seeder
{
    public function run(): void
    {
        $currencyCode = config('visemfood.default_currency_code', 'USD');

        $packages = [
            [
                'name' => 'Essential Gathering Package',
                'slug' => 'essential-gathering-package',
                'short_description' => 'A warm buffet-style setup for birthdays, family gatherings, and church celebrations.',
                'description' => 'Balanced rice, proteins, sides, and service support for events that need dependable hospitality without excess complexity.',
                'starting_price' => 450.00,
                'minimum_guests' => 20,
                'maximum_guests' => 60,
                'featured' => false,
                'sort_order' => 0,
                'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80',
                'inclusions' => ['Signature rice selection', 'Protein pairing', 'Disposable service packs'],
            ],
            [
                'name' => 'Celebration Catering Package',
                'slug' => 'celebration-catering-package',
                'short_description' => 'Flexible catering for birthdays, family celebrations, and polished private gatherings.',
                'description' => 'Built for milestone events with vibrant mains, sides, drinks support, and room for custom vegetarian or service upgrades.',
                'starting_price' => 850.00,
                'minimum_guests' => 30,
                'maximum_guests' => 100,
                'featured' => true,
                'sort_order' => 1,
                'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
                'inclusions' => ['Buffet service line', 'Protein duo', 'Dessert add-on planning'],
            ],
            [
                'name' => 'Premium Event Package',
                'slug' => 'premium-event-package',
                'short_description' => 'Elevated hospitality for weddings, executive events, and premium celebrations.',
                'description' => 'A concierge-led package with premium menu curation, presentation planning, and service coordination for high-stakes occasions.',
                'starting_price' => 1500.00,
                'minimum_guests' => 60,
                'maximum_guests' => 250,
                'featured' => true,
                'sort_order' => 2,
                'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
                'inclusions' => ['Custom menu planning', 'Premium presentation', 'Service team coordination'],
            ],
        ];

        foreach ($packages as $packageData) {
            $image = $this->remoteMedia(
                $packageData['image'],
                $packageData['name'].' catering package image',
                'catering',
            );

            CateringPackage::query()->updateOrCreate(
                ['slug' => $packageData['slug']],
                [
                    'name' => $packageData['name'],
                    'short_description' => $packageData['short_description'],
                    'description' => $packageData['description'],
                    'starting_price' => $packageData['starting_price'],
                    'currency_code' => $currencyCode,
                    'minimum_guests' => $packageData['minimum_guests'],
                    'maximum_guests' => $packageData['maximum_guests'],
                    'image_media_id' => $image->id,
                    'inclusions' => $packageData['inclusions'],
                    'featured' => $packageData['featured'],
                    'status' => CateringPackageStatus::Active,
                    'sort_order' => $packageData['sort_order'],
                ],
            );
        }
    }

    private function remoteMedia(string $url, string $altText, string $purpose): MediaAsset
    {
        $filename = basename(parse_url($url, PHP_URL_PATH) ?: Str::slug($altText));

        return MediaAsset::query()->updateOrCreate(
            [
                'url' => $url,
                'purpose' => $purpose,
            ],
            [
                'storage_driver' => 'remote',
                'disk' => 'remote',
                'path' => $url,
                'directory' => 'remote',
                'filename' => $filename,
                'original_filename' => $filename,
                'mime_type' => 'image/jpeg',
                'extension' => 'jpg',
                'size_bytes' => 0,
                'alt_text' => $altText,
                'metadata' => [
                    'source' => 'hotlinked',
                ],
            ],
        );
    }
}