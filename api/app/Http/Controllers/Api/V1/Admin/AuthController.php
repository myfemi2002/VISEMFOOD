<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\AdminSecurityEventType;
use App\Enums\RoleSlug;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\ChangePasswordRequest;
use App\Http\Requests\Api\Admin\ForgotPasswordRequest;
use App\Http\Requests\Api\Admin\LoginRequest;
use App\Http\Requests\Api\Admin\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\AdminSecurityLogger;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(LoginRequest $request, AdminSecurityLogger $securityLogger): JsonResponse
    {
        $email = Str::lower($request->string('email')->toString());

        /** @var User|null $user */
        $user = User::query()
            ->with('role.permissions')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($user !== null && $user->status !== UserStatus::Active) {
            $securityLogger->log(AdminSecurityEventType::AccountDisabled, $request, $user, $email);

            return $this->invalidCredentials();
        }

        if (
            $user === null
            || ! Hash::check($request->string('password')->toString(), $user->password)
            || ! $user->hasAnyRole([RoleSlug::SuperAdmin->value, RoleSlug::Admin->value])
        ) {
            $securityLogger->log(AdminSecurityEventType::LoginFailed, $request, $user, $email);

            return $this->invalidCredentials();
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $user->load('role.permissions');
        $securityLogger->log(AdminSecurityEventType::LoginSuccess, $request, $user, $email);

        return ApiResponse::success('Login successful.', [
            'user' => new UserResource($user),
            'requires_two_factor' => false,
            'session_lifetime_minutes' => (int) config('session.lifetime', 120),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->load('role.permissions');

        return ApiResponse::success('Authenticated user fetched successfully.', new UserResource($user));
    }

    public function logout(Request $request, AdminSecurityLogger $securityLogger): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user !== null) {
            $securityLogger->log(AdminSecurityEventType::Logout, $request, $user);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ApiResponse::success('Logout successful.');
    }

    public function changePassword(
        ChangePasswordRequest $request,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();

        Auth::logoutOtherDevices($validated['current_password']);

        $user->forceFill([
            'password' => $validated['password'],
            'force_password_reset' => false,
        ])->save();

        $securityLogger->log(AdminSecurityEventType::PasswordChanged, $request, $user);

        return ApiResponse::success('Password updated successfully.');
    }

    public function forgotPassword(
        ForgotPasswordRequest $request,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $email = Str::lower($request->string('email')->toString());

        Password::sendResetLink(['email' => $email]);
        $securityLogger->log(AdminSecurityEventType::PasswordResetRequested, $request, null, $email);

        return ApiResponse::success('If the credentials are valid, a password reset link has been sent.');
    }

    public function resetPassword(
        ResetPasswordRequest $request,
        AdminSecurityLogger $securityLogger,
    ): JsonResponse {
        $validated = $request->validated();

        $status = Password::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                    'force_password_reset' => false,
                ])->save();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return ApiResponse::error('Unable to reset password with the provided token.', 422, [
                'email' => [__($status)],
            ]);
        }

        $securityLogger->log(
            AdminSecurityEventType::PasswordResetCompleted,
            $request,
            null,
            Str::lower((string) $validated['email']),
        );

        return ApiResponse::success('Password reset successfully.');
    }

    private function invalidCredentials(): JsonResponse
    {
        return ApiResponse::error('Invalid login credentials.', 422, [
            'email' => ['Invalid login credentials.'],
        ]);
    }
}
