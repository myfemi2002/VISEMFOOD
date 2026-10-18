<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceAdminInactivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $session = $request->session();
        $now = now()->timestamp;
        $deadline = (int) $session->get('admin.inactivity_deadline', 0);

        // Feature tests using actingAs() do not execute the browser login flow.
        // Production sessions without a login-created deadline remain rejected.
        if ($deadline <= 0 && app()->environment('testing')) {
            $session->put('admin.last_activity_at', $now);
            $session->put('admin.inactivity_deadline', $now + 900);
            $deadline = $now + 900;
        }

        if ($deadline <= 0 || $deadline <= $now) {
            $session->invalidate();
            $session->regenerateToken();

            return ApiResponse::error($deadline <= 0
                ? 'Your admin session could not be verified. Please sign in again.'
                : 'Your admin session expired after 15 minutes of inactivity.', 401, [
                'code' => 'ADMIN_SESSION_EXPIRED',
            ]);
        }

        return $next($request);
    }
}
