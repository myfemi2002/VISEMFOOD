<?php

namespace Database\Seeders;

use App\Enums\RoleSlug;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::query()->where('slug', RoleSlug::SuperAdmin->value)->firstOrFail();
        $adminRole = Role::query()->where('slug', RoleSlug::Admin->value)->firstOrFail();

        User::query()->updateOrCreate(
            ['email' => env('VISEMFOOD_SUPER_ADMIN_EMAIL', 'superadmin@visemfood.test')],
            [
                'role_id' => $superAdminRole->id,
                'name' => env('VISEMFOOD_SUPER_ADMIN_NAME', 'VISEMFOOD Super Admin'),
                'phone' => env('VISEMFOOD_SUPER_ADMIN_PHONE', '+2348000000001'),
                'status' => UserStatus::Active,
                'password' => env('VISEMFOOD_SUPER_ADMIN_PASSWORD', 'Password12345'),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => env('VISEMFOOD_ADMIN_EMAIL', 'admin@visemfood.test')],
            [
                'role_id' => $adminRole->id,
                'name' => env('VISEMFOOD_ADMIN_NAME', 'VISEMFOOD Admin Manager'),
                'phone' => env('VISEMFOOD_ADMIN_PHONE', '+2348000000002'),
                'status' => UserStatus::Active,
                'password' => env('VISEMFOOD_ADMIN_PASSWORD', 'Password12345'),
            ],
        );
    }
}
