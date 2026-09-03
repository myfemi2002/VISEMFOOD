<?php

namespace Database\Seeders;

use App\Enums\CategoryStatus;
use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use App\Models\Category;
use App\Models\MediaAsset;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $currencyCode = config('visemfood.default_currency_code', 'USD');

        $categories = [
            [
                'name' => 'Rice Dishes',
                'slug' => 'rice-dishes',
                'description' => 'Signature rice dishes for individual orders and premium hospitality.',
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'name' => 'Soups',
                'slug' => 'soups',
                'description' => 'Comforting soups layered with depth, proteins, and heritage flavours.',
                'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'name' => 'Small Chops',
                'slug' => 'small-chops',
                'description' => 'Celebration-ready finger foods for meetings, parties, and events.',
                'image' => 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'name' => 'Proteins',
                'slug' => 'proteins',
                'description' => 'Premium proteins and platters for personal meals and hospitality service.',
                'image' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'name' => 'Desserts',
                'slug' => 'desserts',
                'description' => 'Warm, polished dessert finishes with a premium VISEMFOOD touch.',
                'image' => 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'name' => 'Trays',
                'slug' => 'trays',
                'description' => 'Family and party trays built for every gathering.',
                'image' => 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80',
            ],
            [
                'name' => 'Coolers',
                'slug' => 'coolers',
                'description' => 'Bulk coolers for larger events, teams, and day-long service.',
                'image' => 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
            ],
        ];

        $categoryMap = [];

        foreach ($categories as $index => $categoryData) {
            $image = $this->remoteMedia(
                $categoryData['image'],
                $categoryData['name'].' category image',
                'category',
            );

            $category = Category::query()->updateOrCreate(
                ['slug' => $categoryData['slug']],
                [
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description'],
                    'image_media_id' => $image->id,
                    'status' => CategoryStatus::Active,
                    'sort_order' => $index,
                ],
            );

            $categoryMap[$categoryData['slug']] = $category;
        }

        $products = [
            [
                'slug' => 'signature-jollof-rice',
                'name' => 'Signature Jollof Rice',
                'category_slug' => 'rice-dishes',
                'product_type' => ProductType::MenuItem,
                'base_price' => 25.00,
                'short_description' => 'Slow-cooked premium jollof layered with deep pepper richness.',
                'description' => 'A premium VISEMFOOD signature with bold tomato depth, tender protein pairing, and a celebration-ready finish.',
                'serving_size' => 'Small bowl',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
                'variants' => [
                    ['name' => 'Small', 'portion_label' => 'Small bowl', 'price' => 25.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                    ['name' => 'Medium', 'portion_label' => 'Medium bowl', 'price' => 40.00, 'availability_status' => ProductAvailabilityStatus::Available],
                    ['name' => 'Large', 'portion_label' => 'Large bowl', 'price' => 60.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
            [
                'slug' => 'egusi-soup-bowl',
                'name' => 'Egusi Soup Bowl',
                'category_slug' => 'soups',
                'product_type' => ProductType::Bowl,
                'base_price' => 18.00,
                'short_description' => 'Velvety egusi with premium proteins and leafy depth.',
                'description' => 'Comforting, deeply seasoned, and plated with warmth for elevated everyday dining or event service.',
                'serving_size' => 'Shared bowl',
                'availability_status' => ProductAvailabilityStatus::Limited,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
                'variants' => [
                    ['name' => 'Shared', 'portion_label' => 'Shared bowl', 'price' => 18.00, 'availability_status' => ProductAvailabilityStatus::Limited, 'is_default' => true],
                    ['name' => 'Family', 'portion_label' => 'Family bowl', 'price' => 32.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
            [
                'slug' => 'cocktail-small-chops-box',
                'name' => 'Cocktail Small Chops Box',
                'category_slug' => 'small-chops',
                'product_type' => ProductType::HostingPack,
                'base_price' => 48.00,
                'short_description' => 'Golden, event-ready finger foods curated for refined hosting.',
                'description' => 'An assorted premium box of puff-puff, spring rolls, samosas, and savoury bites for meetings, parties, and intimate celebrations.',
                'serving_size' => 'Box for 4 to 6 guests',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
                'variants' => [
                    ['name' => 'Classic', 'portion_label' => 'Box for 4 to 6 guests', 'price' => 48.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                    ['name' => 'Hosting', 'portion_label' => 'Box for 8 to 10 guests', 'price' => 78.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
            [
                'slug' => 'grilled-chicken-platter',
                'name' => 'Grilled Chicken Platter',
                'category_slug' => 'proteins',
                'product_type' => ProductType::MenuItem,
                'base_price' => 35.00,
                'short_description' => 'Charred, juicy, and glazed for premium table presence.',
                'description' => 'A cocoa-spice grilled chicken platter served with herb sauce and garnish for private dinners and corporate hospitality.',
                'serving_size' => 'Platter for 2',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
                'variants' => [
                    ['name' => 'Platter for 2', 'portion_label' => 'Platter for 2', 'price' => 35.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                    ['name' => 'Hosting platter', 'portion_label' => 'Platter for 4', 'price' => 62.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
            [
                'slug' => 'caramel-plantain-cups',
                'name' => 'Caramel Plantain Cups',
                'category_slug' => 'desserts',
                'product_type' => ProductType::MenuItem,
                'base_price' => 12.00,
                'short_description' => 'Soft plantain bites with caramel finish and warm spice notes.',
                'description' => 'A plated dessert that bridges familiarity and polish, ideal for hospitality trays and premium menus.',
                'serving_size' => 'Dessert cup',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
                'variants' => [
                    ['name' => 'Dessert cup', 'portion_label' => 'Dessert cup', 'price' => 12.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                ],
            ],
            [
                'slug' => 'jollof-rice-party-tray',
                'name' => 'Jollof Rice Party Tray',
                'category_slug' => 'trays',
                'product_type' => ProductType::Tray,
                'base_price' => 65.00,
                'short_description' => 'Party-size jollof rice prepared for birthdays, family tables, and polished office hospitality.',
                'description' => 'A celebration-ready tray of signature smoky jollof rice designed for family occasions, gifting, and executive gatherings.',
                'serving_size' => 'Small Tray',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80',
                'variants' => [
                    ['name' => 'Small Tray', 'portion_label' => 'Serves 8 to 12', 'price' => 65.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                    ['name' => 'Medium Tray', 'portion_label' => 'Serves 14 to 20', 'price' => 95.00, 'availability_status' => ProductAvailabilityStatus::Available],
                    ['name' => 'Large Tray', 'portion_label' => 'Serves 22 to 30', 'price' => 135.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
            [
                'slug' => 'party-jollof-cooler',
                'name' => 'Party Jollof Cooler',
                'category_slug' => 'coolers',
                'product_type' => ProductType::Cooler,
                'base_price' => 85.00,
                'short_description' => 'Bulk jollof cooler for retreats, church gatherings, teams, and full-day service.',
                'description' => 'A premium cooler format built for larger events, extended service windows, and celebration weekends that need dependable volume.',
                'serving_size' => '10 Litres',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
                'variants' => [
                    ['name' => '10 Litres', 'portion_label' => 'Serves 14 to 18', 'price' => 85.00, 'availability_status' => ProductAvailabilityStatus::Available, 'is_default' => true],
                    ['name' => '20 Litres', 'portion_label' => 'Serves 26 to 34', 'price' => 150.00, 'availability_status' => ProductAvailabilityStatus::Available],
                    ['name' => '30 Litres', 'portion_label' => 'Serves 38 to 48', 'price' => 210.00, 'availability_status' => ProductAvailabilityStatus::Available],
                ],
            ],
        ];

        foreach ($products as $index => $productData) {
            $category = $categoryMap[$productData['category_slug']];

            $product = Product::query()->updateOrCreate(
                ['slug' => $productData['slug']],
                [
                    'category_id' => $category->id,
                    'product_type' => $productData['product_type'],
                    'name' => $productData['name'],
                    'short_description' => $productData['short_description'],
                    'description' => $productData['description'],
                    'base_price' => $productData['base_price'],
                    'compare_price' => null,
                    'currency_code' => $currencyCode,
                    'serving_size' => $productData['serving_size'],
                    'status' => PublicationStatus::Published,
                    'availability_status' => $productData['availability_status'],
                    'featured' => $productData['featured'],
                    'available_for_order' => true,
                    'preparation_time_minutes' => 90,
                    'sort_order' => $index,
                    'ordering_notes' => null,
                ],
            );

            $product->variants()->delete();

            foreach ($productData['variants'] ?? [] as $variantIndex => $variantData) {
                $product->variants()->create([
                    'name' => $variantData['name'],
                    'slug' => Str::slug($variantData['name']),
                    'portion_label' => $variantData['portion_label'] ?? null,
                    'price' => $variantData['price'],
                    'compare_price' => $variantData['compare_price'] ?? null,
                    'currency_code' => $currencyCode,
                    'availability_status' => $variantData['availability_status'] ?? $productData['availability_status'],
                    'is_default' => (bool) ($variantData['is_default'] ?? false),
                    'sort_order' => $variantData['sort_order'] ?? $variantIndex,
                ]);
            }

            $image = $this->remoteMedia(
                $productData['image'],
                $productData['name'].' product image',
                'product',
            );

            $product->media()->sync([
                $image->id => [
                    'is_primary' => true,
                    'sort_order' => 0,
                ],
            ]);
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
