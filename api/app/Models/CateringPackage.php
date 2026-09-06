<?php

namespace App\Models;

use App\Enums\CateringPackageStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CateringPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'short_description',
        'description',
        'starting_price',
        'currency_code',
        'minimum_guests',
        'maximum_guests',
        'image_media_id',
        'inclusions',
        'featured',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'starting_price' => 'decimal:2',
            'minimum_guests' => 'integer',
            'maximum_guests' => 'integer',
            'inclusions' => 'array',
            'featured' => 'boolean',
            'status' => CateringPackageStatus::class,
        ];
    }

    public function image(): BelongsTo
    {
        return $this->belongsTo(MediaAsset::class, 'image_media_id');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(CateringInquiry::class);
    }
}