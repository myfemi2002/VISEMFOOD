<?php

namespace Database\Seeders;

use App\Enums\RoleSlug;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view' => 'View dashboard analytics and summaries.',
            'media.manage' => 'Upload and manage media assets.',
            'settings.manage' => 'Manage site-wide settings.',
            'categories.view' => 'View product categories.',
            'categories.create' => 'Create product categories.',
            'categories.update' => 'Update product categories.',
            'categories.delete' => 'Delete product categories.',
            'products.view' => 'View products.',
            'products.create' => 'Create products.',
            'products.update' => 'Update products.',
            'products.delete' => 'Delete products.',
            'orders.view' => 'View orders.',
            'orders.update' => 'Update orders.',
            'catering.view' => 'View catering inquiries.',
            'catering.update' => 'Update catering inquiries.',
            'contact.view' => 'View contact messages.',
            'contact.update' => 'Update contact messages.',
            'content.manage' => 'Manage editable content sections.',
            'users.manage' => 'Manage administrative users.',
        ];

        foreach ($permissions as $name => $description) {
            Permission::query()->updateOrCreate(
                ['name' => $name],
                ['description' => $description],
            );
        }

        $allPermissionIds = Permission::query()->pluck('id')->all();

        $adminPermissionIds = Permission::query()
            ->whereNotIn('name', ['users.manage'])
            ->pluck('id')
            ->all();

        $superAdminRole = Role::query()->where('slug', RoleSlug::SuperAdmin->value)->first();
        $adminRole = Role::query()->where('slug', RoleSlug::Admin->value)->first();

        $superAdminRole?->permissions()->sync($allPermissionIds);
        $adminRole?->permissions()->sync($adminPermissionIds);
    }
}
