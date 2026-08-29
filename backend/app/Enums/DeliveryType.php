<?php

namespace App\Enums;

enum DeliveryType: string
{
    case Pickup = 'pickup';
    case Delivery = 'delivery';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
