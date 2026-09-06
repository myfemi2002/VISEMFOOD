<?php

namespace App\Models;

use App\Enums\CateringInquiryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CateringInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'catering_package_id',
        'customer_name',
        'email',
        'phone',
        'event_type',
        'event_date',
        'number_of_guests',
        'preferred_service',
        'location',
        'budget',
        'budget_amount',
        'requirements',
        'notes',
        'status',
        'assigned_to_user_id',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'budget_amount' => 'decimal:2',
            'status' => CateringInquiryStatus::class,
        ];
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function cateringPackage(): BelongsTo
    {
        return $this->belongsTo(CateringPackage::class);
    }
}