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
                'base_price' => 8500,
                'short_description' => 'Slow-cooked premium jollof layered with deep pepper richness.',
                'description' => 'A premium VISEMFOOD signature with bold tomato depth, tender protein pairing, and a celebration-ready finish.',
                'serving_size' => 'Single bowl',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'egusi-soup-bowl',
                'name' => 'Egusi Soup Bowl',
                'category_slug' => 'soups',
                'product_type' => ProductType::Bowl,
                'base_price' => 11000,
                'short_description' => 'Velvety egusi with premium proteins and leafy depth.',
                'description' => 'Comforting, deeply seasoned, and plated with warmth for elevated everyday dining or event service.',
                'serving_size' => 'Shared bowl',
                'availability_status' => ProductAvailabilityStatus::Limited,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'cocktail-small-chops-box',
                'name' => 'Cocktail Small Chops Box',
                'category_slug' => 'small-chops',
                'product_type' => ProductType::HostingPack,
                'base_price' => 14500,
                'short_description' => 'Golden, event-ready finger foods curated for refined hosting.',
                'description' => 'An assorted premium box of puff-puff, spring rolls, samosas, and savoury bites for meetings, parties, and intimate celebrations.',
                'serving_size' => 'Box for 4 to 6 guests',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'grilled-chicken-platter',
                'name' => 'Grilled Chicken Platter',
                'category_slug' => 'proteins',
                'product_type' => ProductType::MenuItem,
                'base_price' => 16000,
                'short_description' => 'Charred, juicy, and glazed for premium table presence.',
                'description' => 'A cocoa-spice grilled chicken platter served with herb sauce and garnish for private dinners and corporate hospitality.',
                'serving_size' => 'Platter for 2',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'caramel-plantain-cups',
                'name' => 'Caramel Plantain Cups',
                'category_slug' => 'desserts',
                'product_type' => ProductType::MenuItem,
                'base_price' => 7000,
                'short_description' => 'Soft plantain bites with caramel finish and warm spice notes.',
                'description' => 'A plated dessert that bridges familiarity and polish, ideal for hospitality trays and premium menus.',
                'serving_size' => 'Dessert cup',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => false,
                'image' => 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'large-jollof-party-tray',
                'name' => 'Large Jollof Party Tray',
                'category_slug' => 'trays',
                'product_type' => ProductType::Tray,
                'base_price' => 85000,
                'short_description' => 'A celebration-sized tray built for family events and executive gatherings.',
                'description' => 'Large-format jollof tray for family occasions, office hospitality, and celebration service.',
                'serving_size' => 'Serves 12 - 18',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80',
            ],
            [
                'slug' => 'executive-cooler-pack',
                'name' => 'Executive Cooler Pack',
                'category_slug' => 'coolers',
                'product_type' => ProductType::Cooler,
                'base_price' => 120000,
                'short_description' => 'Bulk cooler package designed for retreats, teams, and day-long events.',
                'description' => 'A premium cooler package designed for larger events, retreats, teams, and mobile service.',
                'serving_size' => 'Serves 18 - 25',
                'availability_status' => ProductAvailabilityStatus::Available,
                'featured' => true,
                'image' => 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
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
                    'currency_code' => 'NGN',
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
            $product->variants()->create([
                'name' => $productData['serving_size'] ?: 'Standard',
                'slug' => Str::slug($productData['serving_size'] ?: 'standard'),
                'portion_label' => $productData['serving_size'],
                'price' => $productData['base_price'],
                'compare_price' => null,
                'currency_code' => 'NGN',
                'availability_status' => $productData['availability_status'],
                'is_default' => true,
                'sort_order' => 0,
            ]);

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
