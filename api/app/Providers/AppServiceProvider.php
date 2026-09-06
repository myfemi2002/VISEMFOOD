<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('admin-login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return [
                Limit::perMinutes(15, 5)->by(sprintf('%s|%s', $email, $request->ip())),
                Limit::perMinutes(15, 25)->by($request->ip()),
            ];
        });

        RateLimiter::for('public-forms', fn (Request $request) => [
            Limit::perMinute(12)->by($request->ip()),
        ]);

        RateLimiter::for('checkout', fn (Request $request) => [
            Limit::perMinute(10)->by($request->ip()),
        ]);

        ResetPassword::createUrlUsing(function (object $user, string $token): string {
            $baseUrl = rtrim(
                config('visemfood.admin_frontend_url', config('visemfood.frontend_url', config('app.url'))),
                '/',
            );

            return $baseUrl.'/login/reset-password?token='.$token.'&email='.urlencode($user->email);
        });

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
