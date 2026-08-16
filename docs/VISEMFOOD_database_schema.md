# VISEMFOOD Database Schema

## Purpose
This document defines the recommended database structure for the VISEMFOOD platform. It is designed to support:

- a fully dynamic website
- e-commerce-style `Order Now` catalog display
- WhatsApp-based order confirmation
- trays and coolers bulk ordering
- catering inquiry workflows
- dynamic content management
- admin settings and media management

The schema is written at the planning level so it can guide implementation with `Prisma + MariaDB/MySQL`.

## Core Design Principles
- Keep product and content data dynamic
- Separate customer inquiries from actual managed order records
- Support reusable media assets
- Support future growth into payments, user accounts, and analytics
- Keep settings flexible for WhatsApp, Cloudinary, and branding

## Main Modules
The database should support the following modules:

- Admin users and roles
- Products
- Product categories
- Product media
- Trays and coolers
- Catering inquiries
- Bulk order inquiries
- Contact inquiries
- Website page content
- Homepage sections
- Global settings
- Media settings
- Media assets

## 1. Users
This table manages admin users who log into the backend.

### Table: `users`
- `id`
- `name`
- `email`
- `password_hash`
- `phone`
- `role_id`
- `is_active`
- `last_login_at`
- `created_at`
- `updated_at`

## 2. Roles
This table defines access levels for admin users.

### Table: `roles`
- `id`
- `name`
- `slug`
- `description`
- `created_at`
- `updated_at`

### Example Roles
- Super Admin
- Content Manager
- Operations Staff
- Customer Support

## 3. Product Categories
This table groups products for the `Order Now` page.

### Table: `product_categories`
- `id`
- `name`
- `slug`
- `description`
- `image_id`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

### Example Categories
- Rice Dishes
- Soups
- Small Chops
- Proteins
- Drinks

## 4. Products
This is the main table for meals shown on the `Order Now` page.

### Table: `products`
- `id`
- `category_id`
- `name`
- `slug`
- `short_description`
- `description`
- `price`
- `currency`
- `serving_size`
- `sku`
- `availability_status`
- `is_featured`
- `is_active`
- `whatsapp_message_template`
- `sort_order`
- `created_at`
- `updated_at`

### Notes
- `availability_status` can be values like `in_stock`, `limited`, `unavailable`
- `whatsapp_message_template` allows product-specific order wording

## 5. Product Images
Products may have one or more images.

### Table: `product_images`
- `id`
- `product_id`
- `media_asset_id`
- `is_primary`
- `sort_order`
- `created_at`

## 6. Trays and Coolers Packages
This table manages bulk packages.

### Table: `tray_packages`
- `id`
- `name`
- `slug`
- `short_description`
- `description`
- `price`
- `currency`
- `serving_range`
- `package_type`
- `whatsapp_message_template`
- `is_featured`
- `is_active`
- `sort_order`
- `created_at`
- `updated_at`

### Example Package Types
- Tray
- Cooler
- Party Pack
- Family Pack

## 7. Tray Package Images
Each tray or cooler package can have media.

### Table: `tray_package_images`
- `id`
- `tray_package_id`
- `media_asset_id`
- `is_primary`
- `sort_order`
- `created_at`

## 8. Catering Inquiries
This table stores formal catering requests submitted through the website.

### Table: `catering_inquiries`
- `id`
- `full_name`
- `phone`
- `email`
- `event_type`
- `event_date`
- `guest_count`
- `preferred_menu`
- `service_type`
- `budget_range`
- `additional_notes`
- `status`
- `internal_notes`
- `assigned_to_user_id`
- `created_at`
- `updated_at`

### Example Status Values
- new
- contacted
- in_review
- confirmed
- closed

## 9. Bulk Order Inquiries
This table stores tray/cooler bulk order requests if they are captured through forms or backend tracking.

### Table: `bulk_order_inquiries`
- `id`
- `full_name`
- `phone`
- `email`
- `tray_package_id`
- `quantity`
- `event_date`
- `pickup_or_delivery`
- `notes`
- `status`
- `internal_notes`
- `assigned_to_user_id`
- `created_at`
- `updated_at`

### Example Status Values
- new
- pending_confirmation
- confirmed
- in_preparation
- delivered
- completed

## 10. Contact Inquiries
This table stores general contact form submissions.

### Table: `contact_inquiries`
- `id`
- `full_name`
- `phone`
- `email`
- `subject`
- `message`
- `status`
- `internal_notes`
- `assigned_to_user_id`
- `created_at`
- `updated_at`

## 11. Managed Orders
Even if ordering starts on WhatsApp, it is still useful to track confirmed orders in the backend.

### Table: `orders`
- `id`
- `order_reference`
- `customer_name`
- `customer_phone`
- `customer_email`
- `order_type`
- `source`
- `status`
- `total_amount`
- `currency`
- `pickup_or_delivery`
- `delivery_address`
- `order_notes`
- `handled_by_user_id`
- `created_at`
- `updated_at`

### Example Order Types
- product
- tray_package
- catering

### Example Sources
- whatsapp
- admin_manual
- contact_followup

### Example Status Values
- pending
- confirmed
- processing
- ready
- delivered
- completed
- cancelled

## 12. Order Items
This table stores the individual items attached to a managed order.

### Table: `order_items`
- `id`
- `order_id`
- `product_id`
- `tray_package_id`
- `item_name`
- `item_type`
- `unit_price`
- `quantity`
- `line_total`
- `created_at`

### Notes
- `item_name` is stored to preserve historical order data
- either `product_id` or `tray_package_id` may be null depending on item type

## 13. Homepage Sections
This table supports dynamic homepage management.

### Table: `homepage_sections`
- `id`
- `section_key`
- `title`
- `subtitle`
- `body`
- `button_text`
- `button_link`
- `media_asset_id`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

### Example Section Keys
- hero
- featured_meals
- trays_highlight
- catering_highlight
- story_preview
- contact_prompt

## 14. Website Pages
This table supports editable content pages.

### Table: `website_pages`
- `id`
- `title`
- `slug`
- `page_type`
- `hero_title`
- `hero_subtitle`
- `body_content`
- `meta_title`
- `meta_description`
- `is_published`
- `created_at`
- `updated_at`

### Example Page Types
- home
- order_now
- trays_and_coolers
- catering
- contact
- our_story

## 15. Page Content Blocks
This allows flexible sections inside each page.

### Table: `page_blocks`
- `id`
- `page_id`
- `block_key`
- `title`
- `subtitle`
- `content`
- `media_asset_id`
- `button_text`
- `button_link`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

## 16. Media Assets
This table stores uploaded media metadata.

### Table: `media_assets`
- `id`
- `provider`
- `public_id`
- `secure_url`
- `resource_type`
- `format`
- `width`
- `height`
- `bytes`
- `folder`
- `alt_text`
- `created_at`
- `updated_at`

### Provider Examples
- cloudinary

## 17. Media Settings
This table stores Cloudinary settings or other future media provider settings.

### Table: `media_settings`
- `id`
- `provider`
- `cloud_name`
- `api_key`
- `api_secret_encrypted`
- `upload_preset`
- `default_folder`
- `secure_urls`
- `is_enabled`
- `created_at`
- `updated_at`

## 18. WhatsApp Settings
This table stores global WhatsApp ordering settings.

### Table: `whatsapp_settings`
- `id`
- `admin_phone_number`
- `default_order_message`
- `default_tray_message`
- `default_catering_message`
- `is_enabled`
- `created_at`
- `updated_at`

## 19. Global Site Settings
This stores general business information used across the site.

### Table: `site_settings`
- `id`
- `site_name`
- `support_email`
- `support_phone`
- `whatsapp_number`
- `business_address`
- `business_hours`
- `facebook_url`
- `instagram_url`
- `tiktok_url`
- `logo_media_asset_id`
- `favicon_media_asset_id`
- `created_at`
- `updated_at`

## 20. SEO Settings
If you want more flexible metadata control, keep a dedicated SEO table.

### Table: `seo_settings`
- `id`
- `page_id`
- `meta_title`
- `meta_description`
- `og_image_media_asset_id`
- `canonical_url`
- `created_at`
- `updated_at`

## Relationship Summary

### Key Relationships
- `users.role_id -> roles.id`
- `products.category_id -> product_categories.id`
- `product_images.product_id -> products.id`
- `product_images.media_asset_id -> media_assets.id`
- `tray_package_images.tray_package_id -> tray_packages.id`
- `tray_package_images.media_asset_id -> media_assets.id`
- `bulk_order_inquiries.tray_package_id -> tray_packages.id`
- `orders.handled_by_user_id -> users.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `order_items.tray_package_id -> tray_packages.id`
- `homepage_sections.media_asset_id -> media_assets.id`
- `page_blocks.page_id -> website_pages.id`
- `page_blocks.media_asset_id -> media_assets.id`
- `site_settings.logo_media_asset_id -> media_assets.id`
- `site_settings.favicon_media_asset_id -> media_assets.id`
- `seo_settings.page_id -> website_pages.id`
- `seo_settings.og_image_media_asset_id -> media_assets.id`

## Recommended Phase One Tables
If you want to start lean, phase one can focus on:

- `users`
- `roles`
- `product_categories`
- `products`
- `product_images`
- `tray_packages`
- `tray_package_images`
- `catering_inquiries`
- `bulk_order_inquiries`
- `contact_inquiries`
- `homepage_sections`
- `website_pages`
- `page_blocks`
- `media_assets`
- `media_settings`
- `whatsapp_settings`
- `site_settings`

## Recommended Phase Two Tables
These can be strengthened later:

- `orders`
- `order_items`
- `seo_settings`
- advanced analytics tables
- notifications tables
- customer accounts tables
- payment transaction tables

## Example Prisma Direction
When implementing this schema in Prisma:

- use `String @id @default(cuid())` for ids
- use enums for status fields where appropriate
- add indexes on:
  - `slug`
  - `status`
  - `sort_order`
  - `created_at`
  - `category_id`
  - `page_type`

## Practical Recommendation for VISEMFOOD
For this project, the most important data model areas are:

- products and categories for the `Order Now` page
- tray packages for bulk ordering
- inquiries for catering and contact
- homepage and page blocks for dynamic content
- media assets and media settings for Cloudinary
- WhatsApp settings for order flow

That set will give you a strong foundation without overcomplicating the first release.

## Conclusion
This database structure gives VISEMFOOD a solid backend foundation for a dynamic hospitality platform. It supports the agreed website flow, admin-driven content management, Cloudinary media handling, and WhatsApp-based order confirmation while leaving enough room for future scaling.
