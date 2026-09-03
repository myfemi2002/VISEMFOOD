<?php

namespace App\Support;

use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaLibraryService
{
    public function applyAdminLibraryContext(Builder $query): Builder
    {
        return $query
            ->with('uploader:id,name')
            ->withCount($this->usageCountDefinitions());
    }

    public function loadAdminLibraryDetails(MediaAsset $asset): MediaAsset
    {
        $asset->load([
            'uploader:id,name',
            'categories:id,name,slug,image_media_id',
            'products:id,name,slug',
            'cateringPackages:id,name,slug,image_media_id',
            'contentSections:id,section_key,title,image_media_id',
        ])->loadCount($this->usageCountDefinitions());

        return $asset;
    }

    /**
     * @return array<string, int>
     */
    public function usageSummary(MediaAsset $asset): array
    {
        $categories = $this->resolveCount($asset, 'categories');
        $products = $this->resolveCount($asset, 'products');
        $packages = $this->resolveCount($asset, 'catering_packages');
        $primaryProducts = $this->resolveCount($asset, 'primary_products');
        $contentSections = $this->resolveCount($asset, 'content_sections');
        $galleryProducts = max($products - $primaryProducts, 0);

        return [
            'total' => $categories + $products + $packages + $contentSections,
            'categories' => $categories,
            'products' => $products,
            'catering_packages' => $packages,
            'primary_products' => $primaryProducts,
            'gallery_products' => $galleryProducts,
            'content_sections' => $contentSections,
        ];
    }

    /**
     * @return array<string, int>
     */
    public function delete(MediaAsset $asset): array
    {
        $asset->loadCount($this->usageCountDefinitions());
        $usage = $this->usageSummary($asset);

        if ($usage['total'] > 0) {
            throw ValidationException::withMessages([
                'media' => [
                    sprintf(
                        'This image is currently used by %d record%s and cannot be deleted.',
                        $usage['total'],
                        $usage['total'] === 1 ? '' : 's',
                    ),
                ],
            ]);
        }

        $this->deleteStoredFiles($asset);
        $asset->delete();

        return $usage;
    }

    /**
     * @return array<string, mixed>
     */
    private function usageCountDefinitions(): array
    {
        return [
            'categories',
            'products',
            'cateringPackages as catering_packages_count',
            'contentSections as content_sections_count',
            'products as primary_products_count' => fn (Builder $query) => $query->wherePivot('is_primary', true),
        ];
    }

    private function resolveCount(MediaAsset $asset, string $key): int
    {
        $attribute = match ($key) {
            'primary_products' => 'primary_products_count',
            'content_sections' => 'content_sections_count',
            default => sprintf('%s_count', $key),
        };

        return (int) ($asset->getAttribute($attribute) ?? 0);
    }

    private function deleteStoredFiles(MediaAsset $asset): void
    {
        if ($asset->storage_driver !== 'local') {
            return;
        }

        $disk = Storage::disk($asset->disk);

        foreach ($this->pathsForAsset($asset) as $path) {
            if (! $disk->exists($path)) {
                continue;
            }

            if (! $disk->delete($path)) {
                throw ValidationException::withMessages([
                    'media' => ['The image files could not be removed from storage. Please check disk permissions and try again.'],
                ]);
            }
        }
    }

    /**
     * @return list<string>
     */
    private function pathsForAsset(MediaAsset $asset): array
    {
        return collect([$asset->path])
            ->merge(
                collect($asset->variants ?? [])
                    ->map(fn (mixed $variant) => is_array($variant) ? ($variant['path'] ?? null) : null),
            )
            ->filter(fn (mixed $path) => is_string($path) && $path !== '' && ! str_starts_with($path, 'http'))
            ->unique()
            ->values()
            ->all();
    }
}