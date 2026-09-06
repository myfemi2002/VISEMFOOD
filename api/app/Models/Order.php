<?php

namespace App\Models;

use App\Enums\DeliveryType;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_type',
        'delivery_address',
        'preferred_fulfillment_at',
        'customer_notes',
        'admin_notes',
        'currency_code',
        'subtotal',
        'delivery_fee',
        'discount_amount',
        'estimated_total',
        'final_total',
        'status',
        'whatsapp_started_at',
        'ordered_at',
        'confirmed_at',
        'completed_at',
        'handled_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'preferred_fulfillment_at' => 'datetime',
            'whatsapp_started_at' => 'datetime',
            'ordered_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'estimated_total' => 'decimal:2',
            'final_total' => 'decimal:2',
            'delivery_type' => DeliveryType::class,
            'status' => OrderStatus::class,
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_user_id');
    }
}
