<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case WhatsAppPending = 'whatsapp_pending';
    case Negotiating = 'negotiating';
    case Confirmed = 'confirmed';
    case Preparing = 'preparing';
    case Ready = 'ready';
    case OutForDelivery = 'out_for_delivery';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
