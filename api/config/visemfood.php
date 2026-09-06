<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'admin_frontend_url' => env('ADMIN_FRONTEND_URL', env('FRONTEND_URL', 'http://localhost:3000')),
    'password_min_length' => (int) env('VISEMFOOD_PASSWORD_MIN_LENGTH', 10),
    'order_reference_prefix' => env('VISEMFOOD_ORDER_REFERENCE_PREFIX', 'VF'),
    'catering_reference_prefix' => env('VISEMFOOD_CATERING_REFERENCE_PREFIX', 'CAT'),
    'contact_reference_prefix' => env('VISEMFOOD_CONTACT_REFERENCE_PREFIX', 'MSG'),
    'default_currency_code' => env('VISEMFOOD_DEFAULT_CURRENCY_CODE', 'USD'),
    'default_currency_symbol' => env('VISEMFOOD_DEFAULT_CURRENCY_SYMBOL', '$'),
    'default_currency_locale' => env('VISEMFOOD_DEFAULT_CURRENCY_LOCALE', 'en-US'),
    'max_upload_megapixels' => (int) env('VISEMFOOD_MAX_UPLOAD_MEGAPIXELS', 24),
    'max_upload_size_kb' => (int) env('VISEMFOOD_MAX_UPLOAD_SIZE_KB', 8192),
];
