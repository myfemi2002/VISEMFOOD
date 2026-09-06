<?php

namespace App\Enums;

enum ProductAvailabilityStatus: string
{
    case Available = 'available';
    case Limited = 'limited';
    case Unavailable = 'unavailable';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
