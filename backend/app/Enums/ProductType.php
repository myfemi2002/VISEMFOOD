<?php

namespace App\Enums;

enum ProductType: string
{
    case MenuItem = 'menu_item';
    case Bowl = 'bowl';
    case Tray = 'tray';
    case Cooler = 'cooler';
    case HostingPack = 'hosting_pack';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
