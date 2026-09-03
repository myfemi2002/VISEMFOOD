<?php

$frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
$adminUrl = env('ADMIN_FRONTEND_URL', $frontendUrl);
$csv = static function (?string $value): array {
    return array_values(array_filter(array_map('trim', explode(',', (string) $value))));
};
$configuredOrigins = $csv(env('CORS_ALLOWED_ORIGINS'));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $configuredOrigins !== []
        ? array_values(array_unique($configuredOrigins))
        : array_values(array_unique(array_filter([
            $frontendUrl,
            $adminUrl,
            env('FRONTEND_URL_ALT'),
        ]))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
