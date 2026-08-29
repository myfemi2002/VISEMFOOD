<?php

use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CateringInquiryController as AdminCateringInquiryController;
use App\Http\Controllers\Api\V1\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CateringInquiryController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SiteSettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('health', HealthController::class);

    Route::get('site-settings', [SiteSettingController::class, 'show']);
    Route::get('media-specs', [SiteSettingController::class, 'mediaSpecs']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{slug}/products', [CategoryController::class, 'products']);

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    Route::middleware('throttle:public-forms')->group(function (): void {
        Route::post('contact', [ContactMessageController::class, 'store']);
        Route::post('catering', [CateringInquiryController::class, 'store']);
    });

    Route::prefix('checkout')->middleware('throttle:checkout')->group(function (): void {
        Route::post('preview', [CheckoutController::class, 'preview']);
        Route::post('{orderNumber}/whatsapp', [CheckoutController::class, 'continueOnWhatsApp']);
    });

    Route::prefix('admin')->middleware('web')->group(function (): void {
        Route::post('login', [AdminAuthController::class, 'login'])->middleware('throttle:admin-login');
        Route::post('forgot-password', [AdminAuthController::class, 'forgotPassword'])->middleware('throttle:admin-login');
        Route::post('reset-password', [AdminAuthController::class, 'resetPassword'])->middleware('throttle:admin-login');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('me', [AdminAuthController::class, 'me']);
            Route::post('logout', [AdminAuthController::class, 'logout']);
            Route::post('change-password', [AdminAuthController::class, 'changePassword']);

            Route::get('dashboard', DashboardController::class)->middleware('permission:dashboard.view');

            Route::get('media/specs', [MediaController::class, 'specs'])->middleware('permission:media.manage');
            Route::post('media', [MediaController::class, 'store'])->middleware('permission:media.manage');

            Route::get('settings', [AdminSiteSettingController::class, 'show'])->middleware('permission:settings.manage');
            Route::put('settings', [AdminSiteSettingController::class, 'update'])->middleware('permission:settings.manage');

            Route::get('categories', [AdminCategoryController::class, 'index'])->middleware('permission:categories.view');
            Route::post('categories', [AdminCategoryController::class, 'store'])->middleware('permission:categories.create');
            Route::get('categories/{category}', [AdminCategoryController::class, 'show'])->middleware('permission:categories.view');
            Route::put('categories/{category}', [AdminCategoryController::class, 'update'])->middleware('permission:categories.update');
            Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy'])->middleware('permission:categories.delete');

            Route::get('products', [AdminProductController::class, 'index'])->middleware('permission:products.view');
            Route::post('products', [AdminProductController::class, 'store'])->middleware('permission:products.create');
            Route::get('products/{product}', [AdminProductController::class, 'show'])->middleware('permission:products.view');
            Route::put('products/{product}', [AdminProductController::class, 'update'])->middleware('permission:products.update');
            Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->middleware('permission:products.delete');
            Route::patch('products/{product}/availability', [AdminProductController::class, 'updateAvailability'])->middleware('permission:products.update');

            Route::get('orders', [AdminOrderController::class, 'index'])->middleware('permission:orders.view');
            Route::get('orders/{order}', [AdminOrderController::class, 'show'])->middleware('permission:orders.view');
            Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->middleware('permission:orders.update');
            Route::patch('orders/{order}/pricing', [AdminOrderController::class, 'updatePricing'])->middleware('permission:orders.update');

            Route::get('catering-inquiries', [AdminCateringInquiryController::class, 'index'])->middleware('permission:catering.view');
            Route::get('catering-inquiries/{cateringInquiry}', [AdminCateringInquiryController::class, 'show'])->middleware('permission:catering.view');
            Route::patch('catering-inquiries/{cateringInquiry}', [AdminCateringInquiryController::class, 'update'])->middleware('permission:catering.update');

            Route::get('contact-messages', [AdminContactMessageController::class, 'index'])->middleware('permission:contact.view');
            Route::get('contact-messages/{contactMessage}', [AdminContactMessageController::class, 'show'])->middleware('permission:contact.view');
            Route::patch('contact-messages/{contactMessage}', [AdminContactMessageController::class, 'update'])->middleware('permission:contact.update');
        });
    });
});
