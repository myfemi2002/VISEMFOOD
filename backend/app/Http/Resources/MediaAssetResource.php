<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaAssetResource extends JsonResource
{
    /**
     * @return array<string, int>
     */
    private function usageSummary(): array
    {
        $categories = (int) ($this->categories_count ?? 0);
        $products = (int) ($this->products_count ?? 0);
        $packages = (int) ($this->catering_packages_count ?? 0);
        $primaryProducts = (int) ($this->primary_products_count ?? 0);
        $contentSections = (int) ($this->content_sections_count ?? 0);

        return [
            'total' => $categories + $products + $packages + $contentSections,
            'categories' => $categories,
            'products' => $products,
            'catering_packages' => $packages,
            'primary_products' => $primaryProducts,
            'gallery_products' => max($products - $primaryProducts, 0),
            'content_sections' => $contentSections,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $usage = $this->usageSummary();

        return [
            'id' => $this->id,
            'url' => $this->url,
            'path' => $this->path,
            'disk' => $this->disk,
            'storage_driver' => $this->storage_driver,
            'directory' => $this->directory,
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'purpose' => $this->purpose,
            'alt_text' => $this->alt_text,
            'width' => $this->width,
            'height' => $this->height,
            'mime_type' => $this->mime_type,
            'extension' => $this->extension,
            'size_bytes' => $this->size_bytes,
            'variants' => $this->variants ?? [],
            'metadata' => $this->metadata ?? [],
            'uploaded_by' => $this->whenLoaded('uploader', fn () => $this->uploader ? [
                'id' => $this->uploader->id,
                'name' => $this->uploader->name,
            ] : null),
            'usage_count' => $usage['total'],
            'usage' => $usage,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            $this->mergeWhen(
                $this->relationLoaded('categories')
                || $this->relationLoaded('products')
                || $this->relationLoaded('cateringPackages')
                || $this->relationLoaded('contentSections'),
                [
                    'used_by' => [
                        'categories' => $this->relationLoaded('categories')
                            ? $this->categories->map(fn ($category) => [
                                'id' => $category->id,
                                'name' => $category->name,
                                'slug' => $category->slug,
                            ])->values()
                            : [],
                        'products' => $this->relationLoaded('products')
                            ? $this->products->map(fn ($product) => [
                                'id' => $product->id,
                                'name' => $product->name,
                                'slug' => $product->slug,
                            ])->values()
                            : [],
                        'catering_packages' => $this->relationLoaded('cateringPackages')
                            ? $this->cateringPackages->map(fn ($package) => [
                                'id' => $package->id,
                                'name' => $package->name,
                                'slug' => $package->slug,
                            ])->values()
                            : [],
                        'content_sections' => $this->relationLoaded('contentSections')
                            ? $this->contentSections->map(fn ($section) => [
                                'id' => $section->id,
                                'section_key' => $section->section_key,
                                'title' => $section->title,
                            ])->values()
                            : [],
                    ],
                ],
            ),
        ];
    }
}