<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $permissions = null;

        if ($this->relationLoaded('role') && $this->role !== null && $this->role->relationLoaded('permissions')) {
            $permissions = $this->role->permissions->pluck('name')->values()->all();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status?->value ?? $this->status,
            'role' => $this->when($this->role !== null, [
                'id' => $this->role?->id,
                'name' => $this->role?->name,
                'slug' => $this->role?->slug?->value ?? $this->role?->slug,
            ]),
            'permissions' => $permissions,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'two_factor_enabled' => $this->two_factor_confirmed_at !== null,
            'force_password_reset' => (bool) $this->force_password_reset,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
