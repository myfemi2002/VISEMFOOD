<?php

namespace App\Models;

use App\Enums\ProductAvailabilityStatus;
use App\Enums\ProductType;
use App\Enums\PublicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'product_type',
        'name',
        'slug',
        'short_description',
        'description',
        'base_price',
        'compare_price',
        'currency_code',
        'serving_size',
        'status',
        'availability_status',
        'featured',
        'available_for_order',
        'preparation_time_minutes',
        'sort_order',
        'ordering_notes',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'featured' => 'boolean',
            'available_for_order' => 'boolean',
            'product_type' => ProductType::class,
            'status' => PublicationStatus::class,
            'availability_status' => ProductAvailabilityStatus::class,
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(MediaAsset::class, 'product_media')
            ->withPivot(['is_primary', 'sort_order'])
            ->withTimestamps();
    }

    public function defaultVariant(): HasMany
    {
        return $this->variants()->where('is_default', true);
    }
}
