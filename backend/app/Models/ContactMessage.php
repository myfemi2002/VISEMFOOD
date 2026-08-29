<?php

namespace App\Models;

use App\Enums\ContactMessageStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'name',
        'email',
        'phone',
        'subject',
        'event_date',
        'guest_count',
        'message',
        'status',
        'read_at',
        'assigned_to_user_id',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'read_at' => 'datetime',
            'status' => ContactMessageStatus::class,
        ];
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}
