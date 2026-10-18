<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\User;
use Carbon\Carbon;
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

    public function test_guest_cannot_fetch_admin_profile(): void
    {
        $this->getJson('/api/v1/admin/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_logout_and_session_is_invalidated(): void
    {
        $loginResponse = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $sessionCookieName = config('session.cookie');
        $sessionCookie = $loginResponse->getCookie($sessionCookieName);

        $this->assertNotNull($sessionCookie, 'Login response did not include a session cookie.');

        $this->withCookie($sessionCookieName, $sessionCookie->getValue())
            ->getJson('/api/v1/admin/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'admin@visemfood.test');

        $logoutResponse = $this->withCookie($sessionCookieName, $sessionCookie->getValue())
            ->postJson('/api/v1/admin/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->app['auth']->forgetGuards();

        $this->withCookie($sessionCookieName, $sessionCookie->getValue())
            ->getJson('/api/v1/admin/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_disabled_admin_cannot_login(): void
    {
        User::query()->where('email', 'admin@visemfood.test')->update([
            'status' => UserStatus::Disabled->value,
        ]);

        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertStatus(422)->assertJsonPath('message', 'Invalid login credentials.');
    }

    public function test_login_initializes_and_reports_the_inactivity_deadline(): void
    {
        $loginResponse = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $sessionCookie = $loginResponse->getCookie(config('session.cookie'));
        $this->assertNotNull($sessionCookie);

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->getJson('/api/v1/admin/session')
            ->assertOk()
            ->assertJsonPath('data.inactivity_expires_at', now()->timestamp + 900);
    }

    public function test_background_admin_reads_do_not_extend_inactivity(): void
    {
        $loginResponse = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $sessionCookie = $loginResponse->getCookie(config('session.cookie'));
        $deadline = now()->timestamp + 900;
        Carbon::setTestNow(now()->addSeconds(300));

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->getJson('/api/v1/admin/me')
            ->assertOk();

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->getJson('/api/v1/admin/session')
            ->assertOk()
            ->assertJsonPath('data.inactivity_expires_at', $deadline);

        Carbon::setTestNow();
    }

    public function test_expired_admin_sessions_cannot_access_or_renew(): void
    {
        $loginResponse = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $sessionCookie = $loginResponse->getCookie(config('session.cookie'));
        Carbon::setTestNow(now()->addSeconds(901));

        $this->withCookie(config('session.cookie'), $sessionCookie->getValue())
            ->getJson('/api/v1/admin/me')
            ->assertStatus(401)
            ->assertJsonPath('errors.code', 'ADMIN_SESSION_EXPIRED');

        Carbon::setTestNow();

        $renewLoginResponse = $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@visemfood.test',
            'password' => 'Password12345',
        ])->assertOk();

        $renewSessionCookie = $renewLoginResponse->getCookie(config('session.cookie'));
        Carbon::setTestNow(now()->addSeconds(901));

        $this->withCookie(config('session.cookie'), $renewSessionCookie->getValue())
            ->postJson('/api/v1/admin/session/activity')
            ->assertStatus(401)
            ->assertJsonPath('errors.code', 'ADMIN_SESSION_EXPIRED');

        Carbon::setTestNow();
    }
}
