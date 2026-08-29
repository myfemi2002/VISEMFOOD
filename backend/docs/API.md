# VISEMFOOD API

## Auth

### `POST /api/v1/admin/login`
- Auth: none
- Rate limit: `admin-login`
- Body: `email`, `password`
- Response: authenticated admin user and session metadata

### `GET /api/v1/admin/me`
- Auth: Sanctum
- Response: current admin user with role and permissions

### `POST /api/v1/admin/logout`
- Auth: Sanctum

### `POST /api/v1/admin/change-password`
- Auth: Sanctum
- Body: `current_password`, `password`, `password_confirmation`

### `POST /api/v1/admin/forgot-password`
- Auth: none
- Body: `email`

### `POST /api/v1/admin/reset-password`
- Auth: none
- Body: `token`, `email`, `password`, `password_confirmation`

## Public catalog

### `GET /api/v1/site-settings`
- Returns business contact details, WhatsApp numbers, and checkout notice

### `GET /api/v1/media-specs`
- Returns centralized image requirements

### `GET /api/v1/categories`
- Returns active categories

### `GET /api/v1/categories/{slug}/products`
- Query: `search`, `featured`, `product_type`, `per_page`

### `GET /api/v1/products`
- Query: `category`, `search`, `featured`, `product_type`, `available_only`, `per_page`

### `GET /api/v1/products/{slug}`
- Returns a single published product with variants and media

## Public forms

### `POST /api/v1/contact`
- Rate limit: `public-forms`
- Body: `name`, `email`, `phone?`, `subject`, `event_date?`, `guest_count?`, `message`

### `POST /api/v1/catering`
- Rate limit: `public-forms`
- Body: `customer_name`, `email`, `phone`, `event_type`, `event_date?`, `number_of_guests?`, `preferred_service?`, `location?`, `budget?`, `requirements?`, `notes?`

## WhatsApp checkout

### `POST /api/v1/checkout/preview`
- Rate limit: `checkout`
- Validates cart server-side
- Creates or refreshes a draft order
- Body:
  - `customer_name`
  - `customer_email?`
  - `customer_phone`
  - `delivery_type`
  - `delivery_address?`
  - `preferred_fulfillment_at?`
  - `customer_notes?`
  - `items[]` with `slug`, `variant_id?`, `quantity`

### `POST /api/v1/checkout/{orderNumber}/whatsapp`
- Rate limit: `checkout`
- Marks WhatsApp checkout as started
- Returns prefilled WhatsApp URL and validated order summary

## Admin dashboard

### `GET /api/v1/admin/dashboard`
- Auth: Sanctum
- Permission: `dashboard.view`

## Admin media

### `GET /api/v1/admin/media/specs`
- Auth: Sanctum
- Permission: `media.manage`

### `POST /api/v1/admin/media`
- Auth: Sanctum
- Permission: `media.manage`
- Multipart fields: `file`, `spec`, `alt_text?`

## Admin categories

### `GET /api/v1/admin/categories`
- Permission: `categories.view`
- Query: `status`, `search`, `per_page`

### `POST /api/v1/admin/categories`
- Permission: `categories.create`

### `GET /api/v1/admin/categories/{id}`
- Permission: `categories.view`

### `PUT /api/v1/admin/categories/{id}`
- Permission: `categories.update`

### `DELETE /api/v1/admin/categories/{id}`
- Permission: `categories.delete`

## Admin products

### `GET /api/v1/admin/products`
- Permission: `products.view`
- Query: `category_id`, `status`, `availability_status`, `featured`, `product_type`, `search`, `per_page`

### `POST /api/v1/admin/products`
- Permission: `products.create`

### `GET /api/v1/admin/products/{id}`
- Permission: `products.view`

### `PUT /api/v1/admin/products/{id}`
- Permission: `products.update`

### `PATCH /api/v1/admin/products/{id}/availability`
- Permission: `products.update`

### `DELETE /api/v1/admin/products/{id}`
- Permission: `products.delete`

## Admin orders

### `GET /api/v1/admin/orders`
- Permission: `orders.view`
- Query: `status`, `delivery_type`, `search`, `from`, `to`, `per_page`

### `GET /api/v1/admin/orders/{id}`
- Permission: `orders.view`

### `PATCH /api/v1/admin/orders/{id}/status`
- Permission: `orders.update`

### `PATCH /api/v1/admin/orders/{id}/pricing`
- Permission: `orders.update`

## Admin inquiries

### `GET /api/v1/admin/catering-inquiries`
- Permission: `catering.view`

### `GET /api/v1/admin/catering-inquiries/{id}`
- Permission: `catering.view`

### `PATCH /api/v1/admin/catering-inquiries/{id}`
- Permission: `catering.update`

### `GET /api/v1/admin/contact-messages`
- Permission: `contact.view`

### `GET /api/v1/admin/contact-messages/{id}`
- Permission: `contact.view`

### `PATCH /api/v1/admin/contact-messages/{id}`
- Permission: `contact.update`

## Admin settings

### `GET /api/v1/admin/settings`
- Permission: `settings.manage`

### `PUT /api/v1/admin/settings`
- Permission: `settings.manage`

## Response format

Success:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field": [
      "The field is required."
    ]
  }
}
```
