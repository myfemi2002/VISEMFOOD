<?php

namespace App\Support;

use App\Enums\AdminSecurityEventType;
use App\Models\AdminSecurityEvent;
use App\Models\User;
use Illuminate\Http\Request;

class AdminSecurityLogger
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public function log(
        AdminSecurityEventType $eventType,
        Request $request,
        ?User $user = null,
        ?string $email = null,
        array $meta = [],
    ): void {
        AdminSecurityEvent::query()->create([
            'user_id' => $user?->id,
            'email' => $email ?? $user?->email,
            'event_type' => $eventType,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 65535),
            'meta' => $meta === [] ? null : $meta,
        ]);
    }
}
