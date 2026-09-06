<?php

namespace App\Enums;

enum AdminSecurityEventType: string
{
    case LoginSuccess = 'login_success';
    case LoginFailed = 'login_failed';
    case Logout = 'logout';
    case PasswordChanged = 'password_changed';
    case PasswordResetRequested = 'password_reset_requested';
    case PasswordResetCompleted = 'password_reset_completed';
    case AccountDisabled = 'account_disabled';
    case SettingsUpdated = 'settings_updated';
    case CategoryCreated = 'category_created';
    case CategoryUpdated = 'category_updated';
    case CategoryStatusChanged = 'category_status_changed';
    case CategoryDeleted = 'category_deleted';
    case ProductCreated = 'product_created';
    case ProductUpdated = 'product_updated';
    case ProductStatusChanged = 'product_status_changed';
    case ProductDeleted = 'product_deleted';
    case VariantCreated = 'variant_created';
    case VariantUpdated = 'variant_updated';
    case VariantDeleted = 'variant_deleted';
    case VariantStatusChanged = 'variant_status_changed';
    case MediaUploaded = 'media_uploaded';
    case MediaDeleted = 'media_deleted';
    case ProductMediaAttached = 'product_media_attached';
    case ProductMediaDetached = 'product_media_detached';
    case ProductPrimaryImageChanged = 'product_primary_image_changed';
    case CategoryImageChanged = 'category_image_changed';
    case CateringPackageCreated = 'catering_package_created';
    case CateringPackageUpdated = 'catering_package_updated';
    case CateringPackageStatusChanged = 'catering_package_status_changed';
    case CateringPackageDeleted = 'catering_package_deleted';
    case CateringInquiryStatusChanged = 'catering_inquiry_status_changed';
    case CateringInquiryNotesUpdated = 'catering_inquiry_notes_updated';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}