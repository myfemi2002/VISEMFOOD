<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
