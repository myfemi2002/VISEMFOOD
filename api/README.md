# VISEMFOOD API

Laravel 12 REST API for the VISEMFOOD TanStack frontend.

## Stack

- PHP 8.2+
- Laravel 12
- MariaDB / MySQL in production
- SQLite for lightweight local development if preferred
- Laravel Sanctum for admin authentication

## Local setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

Default seeded admin accounts:

- Development only: these come from local seeder defaults unless you explicitly override them in `api/.env`.
- Production must set strong `VISEMFOOD_SUPER_ADMIN_*` and `VISEMFOOD_ADMIN_*` credentials before seeding.
- `superadmin@visemfood.test` / `Password12345`
- `admin@visemfood.test` / `Password12345`

## Frontend integration notes

- Public API base: `/api/v1`
- Admin API base: `/api/v1/admin`
- For cookie-based Sanctum auth, call `/sanctum/csrf-cookie` before admin login from the frontend.

## cPanel deployment

Recommended structure:

- App root: `/home/USERNAME/visemfood-api`
- Public web root: `/home/USERNAME/public_html/api` pointed to Laravel `public/`

Typical deployment steps:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=Database\\Seeders\\DatabaseSeeder --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Cron entry for the scheduler:

```bash
php /home/USERNAME/visemfood-api/artisan schedule:run
```

## Media

- Admin uploads are resized with GD and stored through Laravel's filesystem abstraction.
- Product images generate multiple WebP variants for frontend performance.

## Docs

See [docs/API.md](docs/API.md) for endpoint documentation.

