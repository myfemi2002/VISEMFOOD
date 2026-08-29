<?php

namespace Tests\Feature;

use Database\Seeders\AdminUserSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            PermissionSeeder::class,
            AdminUserSeeder::class,
        ]);
    }

    public function test_admin_can_login_and_fetch_profile(): void
    {
        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk()->assertJsonPath('data.user.email', 'admin@visemfood.test');

        $this->getJson('/api/v1/admin/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'admin@visemfood.test');
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'wrong-password',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }
}
