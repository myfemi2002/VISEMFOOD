<?php

namespace App\Support;

use App\Models\MediaAsset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ImageUploadService
{
    /**
     * @return array{asset: MediaAsset, spec: array<string, mixed>}
     */
    public function upload(UploadedFile $file, string $specKey, ?string $altText = null): array
    {
        $spec = config("visemfood-media.specs.$specKey");

        if (! is_array($spec)) {
            throw ValidationException::withMessages([
                'spec' => ['The requested image specification is invalid.'],
            ]);
        }

        $allowed = Arr::wrap($spec['formats'] ?? []);
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, $allowed, true)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded file format is not supported.'],
            ]);
        }

        $size = getimagesize($file->getRealPath());

        if ($size === false) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded file could not be read as an image.'],
            ]);
        }

        [$sourceWidth, $sourceHeight] = $size;

        $maxMegapixels = (int) config('visemfood.max_upload_megapixels', 24);
        if (($sourceWidth * $sourceHeight) > ($maxMegapixels * 1_000_000)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded image is too large to process safely on the server.'],
            ]);
        }

        $image = imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($image === false) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded image format could not be decoded.'],
            ]);
        }

        $image = $this->applyOrientation($file, $image);

        $directory = trim('visemfood/'.$specKey.'/'.now()->format('Y/m'));
        $disk = config('visemfood-media.disks.default', 'public');
        $baseName = Str::uuid()->toString();
        $variants = [];

        foreach (($spec['variants'] ?? []) as $variantKey => $variantSpec) {
            $resized = $this->coverResize(
                $image,
                (int) $variantSpec['width'],
                (int) $variantSpec['height'],
            );

            $relativePath = sprintf('%s/%s-%s.webp', $directory, $baseName, $variantKey);
            $absolutePath = Storage::disk($disk)->path($relativePath);

            if (! is_dir(dirname($absolutePath))) {
                mkdir(dirname($absolutePath), 0777, true);
            }

            imagewebp($resized, $absolutePath, 86);
            imagedestroy($resized);

            $variants[$variantKey] = [
                'path' => $relativePath,
                'url' => Storage::disk($disk)->url($relativePath),
                'width' => (int) $variantSpec['width'],
                'height' => (int) $variantSpec['height'],
            ];
        }

        $primaryVariant = $variants['large'] ?? reset($variants);
        $path = is_array($primaryVariant) ? (string) $primaryVariant['path'] : '';
        $url = is_array($primaryVariant) ? (string) $primaryVariant['url'] : '';

        $asset = MediaAsset::query()->create([
            'storage_driver' => 'local',
            'disk' => $disk,
            'path' => $path,
            'url' => $url,
            'directory' => $directory,
            'filename' => basename($path),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => 'image/webp',
            'extension' => 'webp',
            'size_bytes' => $file->getSize() ?: 0,
            'width' => $sourceWidth,
            'height' => $sourceHeight,
            'alt_text' => $altText,
            'purpose' => $specKey,
            'variants' => $variants,
            'metadata' => [
                'recommended_width' => $spec['width'] ?? null,
                'recommended_height' => $spec['height'] ?? null,
                'ratio' => $spec['ratio'] ?? null,
            ],
        ]);

        imagedestroy($image);

        return [
            'asset' => $asset,
            'spec' => $spec,
        ];
    }

    private function coverResize(\GdImage $source, int $targetWidth, int $targetHeight): \GdImage
    {
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $sourceRatio = $sourceWidth / max($sourceHeight, 1);
        $targetRatio = $targetWidth / max($targetHeight, 1);

        if ($sourceRatio > $targetRatio) {
            $cropHeight = $sourceHeight;
            $cropWidth = (int) round($cropHeight * $targetRatio);
            $srcX = (int) round(($sourceWidth - $cropWidth) / 2);
            $srcY = 0;
        } else {
            $cropWidth = $sourceWidth;
            $cropHeight = (int) round($cropWidth / max($targetRatio, 0.0001));
            $srcX = 0;
            $srcY = (int) round(($sourceHeight - $cropHeight) / 2);
        }

        $destination = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($destination, true);
        imagesavealpha($destination, true);
        imagecopyresampled(
            $destination,
            $source,
            0,
            0,
            $srcX,
            $srcY,
            $targetWidth,
            $targetHeight,
            $cropWidth,
            $cropHeight,
        );

        return $destination;
    }

    private function applyOrientation(UploadedFile $file, \GdImage $image): \GdImage
    {
        $mimeType = $file->getMimeType();

        if ($mimeType !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientation = (int) ($exif['Orientation'] ?? 1);

        return match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };
    }
}
