<?php

return [
    'disks' => [
        'default' => env('VISEMFOOD_MEDIA_DISK', env('FILESYSTEM_DISK', 'public')),
    ],
    'encoding' => [
        'webp_quality' => (int) env('VISEMFOOD_MEDIA_WEBP_QUALITY', 84),
    ],
    'specs' => [
        'product' => [
            'label' => 'Product Image',
            'width' => 1200,
            'height' => 1200,
            'ratio' => '1:1',
            'max_size_kb' => 5120,
            'min_width' => 600,
            'min_height' => 600,
            'formats' => ['jpg', 'jpeg', 'png', 'webp'],
            'variants' => [
                'large' => ['width' => 1200, 'height' => 1200],
                'medium' => ['width' => 600, 'height' => 600],
                'thumbnail' => ['width' => 300, 'height' => 300],
            ],
        ],
        'category' => [
            'label' => 'Category Image',
            'width' => 1200,
            'height' => 800,
            'ratio' => '3:2',
            'max_size_kb' => 5120,
            'min_width' => 600,
            'min_height' => 400,
            'formats' => ['jpg', 'jpeg', 'png', 'webp'],
            'variants' => [
                'large' => ['width' => 1200, 'height' => 800],
                'medium' => ['width' => 900, 'height' => 600],
                'thumbnail' => ['width' => 450, 'height' => 300],
            ],
        ],
        'hero' => [
            'label' => 'Homepage Hero',
            'width' => 1920,
            'height' => 1080,
            'ratio' => '16:9',
            'max_size_kb' => 8192,
            'min_width' => 1200,
            'min_height' => 675,
            'formats' => ['jpg', 'jpeg', 'png', 'webp'],
            'variants' => [
                'desktop' => ['width' => 1920, 'height' => 1080],
                'tablet' => ['width' => 1280, 'height' => 720],
                'mobile' => ['width' => 768, 'height' => 1024],
            ],
        ],
        'catering' => [
            'label' => 'Catering Feature Image',
            'width' => 1600,
            'height' => 900,
            'ratio' => '16:9',
            'max_size_kb' => 6144,
            'min_width' => 960,
            'min_height' => 540,
            'formats' => ['jpg', 'jpeg', 'png', 'webp'],
            'variants' => [
                'large' => ['width' => 1600, 'height' => 900],
                'medium' => ['width' => 1200, 'height' => 675],
                'thumbnail' => ['width' => 480, 'height' => 270],
            ],
        ],
    ],
];
