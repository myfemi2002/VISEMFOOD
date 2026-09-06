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
    public function upload(
        UploadedFile $file,
        string $specKey,
        ?string $altText = null,
        ?int $uploadedById = null,
    ): array
    {
        $spec = config("visemfood-media.specs.$specKey");

        if (! is_array($spec)) {
            throw ValidationException::withMessages([
                'spec' => ['The requested image specification is invalid.'],
            ]);
        }

        $allowed = Arr::wrap($spec['formats'] ?? []);
        $extension = strtolower($file->getClientOriginalExtension());
        $detectedMimeType = strtolower((string) $file->getMimeType());
        $allowedMimeTypes = $this->mimeTypesForFormats($allowed);
        $maxSizeKb = (int) ($spec['max_size_kb'] ?? config('visemfood.max_upload_size_kb', 8192));

        if (! in_array($extension, $allowed, true)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded file format is not supported.'],
            ]);
        }

        if (! in_array($detectedMimeType, $allowedMimeTypes, true)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded file MIME type is not supported. Upload a JPG, PNG, or WebP image.'],
            ]);
        }

        if (($file->getSize() ?: 0) > ($maxSizeKb * 1024)) {
            throw ValidationException::withMessages([
                'file' => [sprintf('The uploaded image is larger than the %d MB limit.', max(1, (int) round($maxSizeKb / 1024)))],
            ]);
        }

        $size = @getimagesize($file->getRealPath());

        if ($size === false) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded file could not be read as an image.'],
            ]);
        }

        [$sourceWidth, $sourceHeight] = $size;
        $detectedImageMime = strtolower((string) ($size['mime'] ?? $detectedMimeType));

        $maxMegapixels = (int) config('visemfood.max_upload_megapixels', 24);
        if (($sourceWidth * $sourceHeight) > ($maxMegapixels * 1_000_000)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded image is too large to process safely on the server.'],
            ]);
        }

        if (! in_array($detectedImageMime, $allowedMimeTypes, true)) {
            throw ValidationException::withMessages([
                'file' => ['The uploaded image could not be validated as a supported JPG, PNG, or WebP file.'],
            ]);
        }

        $minimumWidth = (int) ($spec['min_width'] ?? 0);
        $minimumHeight = (int) ($spec['min_height'] ?? 0);

        if ($sourceWidth < $minimumWidth || $sourceHeight < $minimumHeight) {
            throw ValidationException::withMessages([
                'file' => [
                    sprintf(
                        'The uploaded image is too small. Minimum source size for this upload is %d x %d pixels.',
                        $minimumWidth,
                        $minimumHeight,
                    ),
                ],
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
        $writtenPaths = [];
        $quality = (int) config('visemfood-media.encoding.webp_quality', 84);

        try {
            foreach (($spec['variants'] ?? []) as $variantKey => $variantSpec) {
                $targetWidth = min((int) $variantSpec['width'], $sourceWidth);
                $targetHeight = min((int) $variantSpec['height'], $sourceHeight);

                $resized = $this->coverResize(
                    $image,
                    $targetWidth,
                    $targetHeight,
                );

                $relativePath = sprintf('%s/%s-%s.webp', $directory, $baseName, $variantKey);
                $encoded = $this->encodeWebp($resized, $quality);
                imagedestroy($resized);

                if (! Storage::disk($disk)->put($relativePath, $encoded)) {
                    throw ValidationException::withMessages([
                        'file' => ['The uploaded image could not be written to storage.'],
                    ]);
                }
                $writtenPaths[] = $relativePath;

                $variants[$variantKey] = [
                    'path' => $relativePath,
                    'url' => Storage::disk($disk)->url($relativePath),
                    'width' => $targetWidth,
                    'height' => $targetHeight,
                    'size_bytes' => strlen($encoded),
                ];
            }

            $primaryVariant = $variants['large'] ?? reset($variants);
            $path = is_array($primaryVariant) ? (string) $primaryVariant['path'] : '';
            $url = is_array($primaryVariant) ? (string) $primaryVariant['url'] : '';
            $storedWidth = is_array($primaryVariant) ? (int) ($primaryVariant['width'] ?? $sourceWidth) : $sourceWidth;
            $storedHeight = is_array($primaryVariant) ? (int) ($primaryVariant['height'] ?? $sourceHeight) : $sourceHeight;
            $storedSizeBytes = is_array($primaryVariant) ? (int) ($primaryVariant['size_bytes'] ?? ($file->getSize() ?: 0)) : ($file->getSize() ?: 0);

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
                'size_bytes' => $storedSizeBytes,
                'width' => $storedWidth,
                'height' => $storedHeight,
                'alt_text' => $altText,
                'purpose' => $specKey,
                'uploaded_by' => $uploadedById,
                'variants' => $variants,
                'metadata' => [
                    'source_mime_type' => $detectedImageMime,
                    'source_extension' => $extension,
                    'source_size_bytes' => $file->getSize() ?: 0,
                    'source_width' => $sourceWidth,
                    'source_height' => $sourceHeight,
                    'recommended_width' => $spec['width'] ?? null,
                    'recommended_height' => $spec['height'] ?? null,
                    'minimum_width' => $minimumWidth,
                    'minimum_height' => $minimumHeight,
                    'ratio' => $spec['ratio'] ?? null,
                    'webp_quality' => $quality,
                    'retains_original_upload' => false,
                ],
            ]);
        } catch (\Throwable $exception) {
            foreach ($writtenPaths as $writtenPath) {
                Storage::disk($disk)->delete($writtenPath);
            }

            imagedestroy($image);

            throw $exception;
        }

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

    /**
     * @param  list<string>  $formats
     * @return list<string>
     */
    private function mimeTypesForFormats(array $formats): array
    {
        $mimeTypes = [];

        foreach ($formats as $format) {
            foreach (match (strtolower($format)) {
                'jpg', 'jpeg' => ['image/jpeg'],
                'png' => ['image/png'],
                'webp' => ['image/webp'],
                default => [],
            } as $mimeType) {
                $mimeTypes[] = $mimeType;
            }
        }

        return array_values(array_unique($mimeTypes));
    }

    private function encodeWebp(\GdImage $image, int $quality): string
    {
        ob_start();
        $encoded = imagewebp($image, null, $quality);
        $contents = ob_get_clean();

        if ($encoded === false || ! is_string($contents) || $contents === '') {
            throw ValidationException::withMessages([
                'file' => ['The uploaded image could not be optimized for storage.'],
            ]);
        }

        return $contents;
    }
}
