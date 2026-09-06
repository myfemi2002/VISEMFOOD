<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferenceCounter extends Model
{
    use HasFactory;

    protected $fillable = [
        'scope',
        'year',
        'current_number',
    ];
}
