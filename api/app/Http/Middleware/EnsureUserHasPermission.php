<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 401, 'Authentication is required.');
        abort_unless($user->hasPermission($permission), 403, 'You do not have permission to access this resource.');

        return $next($request);
    }
}
