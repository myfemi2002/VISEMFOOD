# VISEMFOOD Backend Foundation

Date: September 1, 2026
Workspace: `C:\xampp\htdocs\xampp\visemfood`

## Active Applications

- Frontend: TanStack Start app at `src/`
- Backend: Laravel 12 app at `backend/`
- API base URL from frontend: `VITE_API_BASE_URL`
- Public API base: `/api/v1`
- Admin API base: `/api/v1/admin`

## Sanctum Session Flow

The active admin authentication flow is SPA cookie based and uses the existing Laravel backend only:

1. `GET /sanctum/csrf-cookie`
2. `POST /api/v1/admin/login`
3. browser stores secure session + XSRF cookies
4. `GET /api/v1/admin/me`
5. protected admin API access through `auth:sanctum`
6. `POST /api/v1/admin/logout` invalidates the session

Frontend HTTP behavior is centralized in `src/lib/api.ts`:

- `credentials: "include"`
- CSRF bootstrap through `ensureCsrfCookie()`
- normalized JSON envelope parsing
- normalized auth, validation, throttling, server, and network errors

## Session Strategy

Local current database:

- SQLite

Current local session strategy:

- `SESSION_DRIVER=file` in `backend/.env`

Test suite session strategy:

- `SESSION_DRIVER=database` in `backend/phpunit.xml`

Current production strategy for cPanel:

- `SESSION_DRIVER=database`
- `SESSION_DOMAIN=.visemfood.com`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_HTTP_ONLY=true`
- `SESSION_SAME_SITE=lax`

The `sessions` table migration already exists in `backend/database/migrations/0001_01_01_000000_create_users_table.php`.

## CORS and Cookies

`backend/config/cors.php` is now environment driven.

Primary variables:

- `FRONTEND_URL`
- `ADMIN_FRONTEND_URL`
- `FRONTEND_URL_ALT`
- `CORS_ALLOWED_ORIGINS`
- `SANCTUM_STATEFUL_DOMAINS`

Production should use explicit trusted origins only, for example:

- `https://visemfood.com`
- `https://www.visemfood.com`
- `https://api.visemfood.com`

Wildcard origins must not be used with credentialed Sanctum authentication.

## Database Foundation

Current local database:

- SQLite

Production target:

- MySQL or MariaDB on cPanel

Money storage:

- database money columns remain `DECIMAL`
- frontend currency formatting is centralized in `src/lib/currency.ts`
- default Phase 1 currency foundation is now `USD`, locale `en-US`, symbol `$`

## Mock Fallback Policy

Phase 1 policy:

- production must not silently fall back to fake business data
- mock fallback remains possible only through explicit frontend env opt-in

Frontend flags:

- `VITE_ENABLE_MOCK_FALLBACK=false`
- `VITE_SHOW_DEMO_CREDENTIALS=false`

Result:

- public pages now surface loading, empty, or truthful API failure states
- admin pages no longer initialize with fake rows as the default runtime state

## Demo Credentials Policy

Demo credentials are now development-only.

- frontend only displays them when `VITE_SHOW_DEMO_CREDENTIALS=true`
- backend production seeding refuses predictable fallback admin credentials

## Filesystem and Storage

Laravel filesystem:

- default disk comes from `FILESYSTEM_DISK`
- public disk path: `storage/app/public`
- public URL target: `public/storage`

Standard local setup:

```bash
php artisan storage:link
```

Current local status:

- `backend/public/storage` is now linked to `backend/storage/app/public`

If cPanel blocks symlinks, fallback deployment should expose uploaded files by:

1. pointing the public path to a writable mapped directory approved by hosting, or
2. serving media through Laravel responses until object storage is introduced.

## Media Library and Image Processing

Phase 5 media implementation is now active through the existing Laravel backend:

- media records live in `media_assets`
- product galleries use the `product_media` pivot
- category artwork uses `categories.image_media_id`
- admin media endpoints live under `/api/v1/admin/media`
- media specifications are served by `/api/v1/admin/media/specs`

Current upload rules:

- accepted formats: `jpg`, `jpeg`, `png`, `webp`
- MIME validation is server-side
- product/category uploads are capped at `5 MB`
- minimum safe source sizes are enforced per spec
- images are resized and re-encoded into optimized WebP variants
- EXIF orientation is corrected for JPEG uploads where supported
- original uploads are not retained after successful processing

Current generated variants:

- product: `large`, `medium`, `thumbnail`
- category: `large`, `medium`, `thumbnail`

Current processing/runtime assumptions:

- PHP GD support is required
- `imagewebp()` must be available for WebP output
- uploads are stored on the Laravel `public` disk
- media URLs are generated through the filesystem layer, not by hardcoded `/storage/...` strings

Current deletion policy:

- in-use media cannot be deleted
- product/category relationships must be detached first
- unused media deletion removes the database row and generated files

Recommended cPanel/PHP settings for media:

- `upload_max_filesize >= 8M`
- `post_max_size >= 8M`
- writable `storage/` and `bootstrap/cache/`
- writable `storage/app/public/visemfood/`
- working `public/storage` symlink, or a documented host-approved fallback if symlinks are blocked

## Queue and cPanel Assumptions

Queue strategy remains cPanel-friendly:

- `QUEUE_CONNECTION=database`
- no Redis dependency
- no permanently running worker required for Phase 1

Preferred cPanel scheduler entry:

```bash
php /home/USERNAME/visemfood-api/artisan schedule:run
```

Lightweight jobs may run sync where appropriate until queued execution is needed.

## Health Endpoint

Health endpoint:

- `GET /api/v1/health`

Safe response shape:

```json
{
  "success": true,
  "message": "VISEMFOOD API is healthy.",
  "data": {
    "status": "ok",
    "version": "v1",
    "timestamp": "..."
  }
}
```

It must not expose secrets, stack traces, or credential details.
