<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'storage_driver',
        'disk',
        'path',
        'url',
        'directory',
        'filename',
        'original_filename',
        'mime_type',
        'extension',
        'size_bytes',
        'width',
        'height',
        'alt_text',
        'purpose',
        'uploaded_by',
        'variants',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'metadata' => 'array',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'image_media_id');
    }

    public function contentSections(): HasMany
    {
        return $this->hasMany(ContentSection::class, 'image_media_id');
    }

    public function cateringPackages(): HasMany
    {
        return $this->hasMany(CateringPackage::class, 'image_media_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_media')
            ->withPivot(['is_primary', 'sort_order'])
            ->withTimestamps();
    }
}