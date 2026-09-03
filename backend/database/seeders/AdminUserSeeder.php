<?php

namespace Database\Seeders;

use App\Enums\RoleSlug;
use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::query()->where('slug', RoleSlug::SuperAdmin->value)->firstOrFail();
        $adminRole = Role::query()->where('slug', RoleSlug::Admin->value)->firstOrFail();
        [$superAdminEmail, $superAdminPassword] = $this->resolveCredentials(
            'VISEMFOOD_SUPER_ADMIN_EMAIL',
            'VISEMFOOD_SUPER_ADMIN_PASSWORD',
            'superadmin@visemfood.test',
            'Password12345',
        );
        [$adminEmail, $adminPassword] = $this->resolveCredentials(
            'VISEMFOOD_ADMIN_EMAIL',
            'VISEMFOOD_ADMIN_PASSWORD',
            'admin@visemfood.test',
            'Password12345',
        );

        User::query()->updateOrCreate(
            ['email' => $superAdminEmail],
            [
                'role_id' => $superAdminRole->id,
                'name' => env('VISEMFOOD_SUPER_ADMIN_NAME', 'VISEMFOOD Super Admin'),
                'phone' => env('VISEMFOOD_SUPER_ADMIN_PHONE', '+2348000000001'),
                'status' => UserStatus::Active,
                'password' => $superAdminPassword,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'role_id' => $adminRole->id,
                'name' => env('VISEMFOOD_ADMIN_NAME', 'VISEMFOOD Admin Manager'),
                'phone' => env('VISEMFOOD_ADMIN_PHONE', '+2348000000002'),
                'status' => UserStatus::Active,
                'password' => $adminPassword,
            ],
        );
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveCredentials(
        string $emailKey,
        string $passwordKey,
        string $fallbackEmail,
        string $fallbackPassword,
    ): array {
        $email = trim((string) env($emailKey, $fallbackEmail));
        $password = (string) env($passwordKey, $fallbackPassword);

        if (
            app()->environment('production')
            && ($email === $fallbackEmail || $password === $fallbackPassword || $email === '' || $password === '')
        ) {
            throw new RuntimeException(
                sprintf(
                    'Refusing to seed predictable admin credentials in production. Set %s and %s explicitly first.',
                    $emailKey,
                    $passwordKey,
                ),
            );
        }

        return [$email, $password];
    }
}
