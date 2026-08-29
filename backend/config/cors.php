<?php

$frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
$adminUrl = env('ADMIN_FRONTEND_URL', $frontendUrl);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter([
        $frontendUrl,
        $adminUrl,
        env('FRONTEND_URL_ALT'),
    ])),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
