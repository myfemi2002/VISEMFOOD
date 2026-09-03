# VISEMFOOD Backend Implementation Baseline

Date: August 30, 2026
Workspace: `C:\xampp\htdocs\xampp\visemfood`

## 1. Purpose

This document records the actual repository baseline before any new backend implementation work begins.

The repository is **not** at the original "frontend only + no backend" state anymore. It already contains:

- an active TanStack Start frontend under `src/`
- a separate Laravel backend under `backend/`
- older legacy Next.js/Prisma artifacts at repository root that should not be reused accidentally

The next implementation phases must start from this real state, not from the earlier planning assumptions.

## Phase 1 Update Note

As of August 30, 2026, the following baseline statements are no longer current:

- frontend currency defaults are no longer NGN-first in the active runtime foundation
- public and admin screens no longer initialize from silent fake-data fallback by default
- menu and trays route metadata no longer depend on fallback product images
- demo admin credentials are now gated behind explicit frontend development flags
- backend production example configuration is now MySQL/session/cookie/CORS oriented for cPanel deployment
- older NGN and `subtle-pattern-url` references later in this document remain as preserved Phase 0 evidence, not current runtime behavior

## 2. Active Runtime Confirmation

### Active frontend

The active frontend is the TanStack Start application in `src/`.

Evidence:

- `package.json` root scripts use `vite`
- `vite.config.ts` loads `@tanstack/react-start`, `nitro`, `@vitejs/plugin-react`, and Tailwind v4
- `tsconfig.json` includes only `src/**/*.ts`, `src/**/*.tsx`, and `vite.config.ts`
- `src/routes/__root.tsx` is the active root route
- `src/components/AppFrame.tsx` wraps the active site shell, toasts, auth, cart, and site data providers

### Active backend

There is already a separate Laravel backend in `backend/`.

Evidence:

- `backend/composer.json` is a Laravel 12 project
- `backend/routes/api.php` defines `/api/v1/...` endpoints
- `src/lib/api.ts` reads `VITE_API_BASE_URL` and makes credentialed requests to Laravel
- `src/lib/visemfood-api.ts` calls the Laravel API for public catalog, forms, admin auth, and admin data

### No active business backend inside `src/`

The TanStack app is **not** directly serving the business API from `src/`.

Current pattern:

- frontend: TanStack Start + React in `src/`
- API: Laravel in `backend/`
- communication: `fetch(..., { credentials: "include" })` through `src/lib/api.ts`

## 3. Legacy / Non-Active Artifacts

These root-level areas are legacy leftovers and should be treated as non-active unless deliberately migrated:

- `app/`
- `components/`
- `lib/`
- `prisma/`
- `.next/`
- `middleware.ts`
- `legacy.middleware.next.ts`
- `legacy.next-env.d.ts`
- `legacy.next.config.mjs`

Important notes:

- `tsconfig.json` explicitly excludes `app`, `components`, `lib`, `middleware.ts`, and `prisma`
- root `package.json` builds the TanStack app, not Next.js
- these legacy files still create confusion during audits and deployment discussions, but they are not part of the active TypeScript build path

## 4. Root Scripts and Tooling

From root `package.json`:

- `dev`: `vite dev --port 3000`
- `generate-routes`: `tsr generate`
- `build`: `vite build`
- `preview`: `vite preview`
- `start`: `vite preview --host 0.0.0.0 --port 3000`

Observations:

- there is **no** dedicated root `typecheck` script
- there is **no** dedicated root `lint` script
- type checking currently requires direct `tsc --noEmit`

## 5. Environment Files

### Root `.env`

Root `.env` is a **frontend Vite env file**, not a Laravel env file.

Current contents:

- `VITE_APP_NAME="VISEMFOOD"`
- `VITE_API_BASE_URL="http://localhost:8000"`

This explains the earlier confusion that "the `.env` file doesn't look like Laravel env".

### Backend `.env`

Laravel's real env file is `backend/.env`.

Current key baseline values:

- `APP_URL=http://localhost:8000`
- `FRONTEND_URL=http://localhost:3000`
- `ADMIN_FRONTEND_URL=http://localhost:3000`
- `SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:8000,127.0.0.1:8000`
- `DB_CONNECTION=sqlite`
- `SESSION_DRIVER=file`
- `QUEUE_CONNECTION=database`
- `VISEMFOOD_DEFAULT_CURRENCY_CODE=NGN`
- `VISEMFOOD_DEFAULT_CURRENCY_SYMBOL=NGN`
- seeded admin credentials are present in backend env

Baseline implication:

- frontend env and backend env are already split correctly
- currency is still configured as NGN in the backend baseline
- local backend is using SQLite, not MySQL/MariaDB yet

## 6. Backend State Already Present

### Laravel runtime

`php artisan about` in `backend/` reported:

- Laravel `12.68.0`
- PHP `8.2.12`
- environment `local`
- URL `localhost:8000`
- database driver `sqlite`
- queue `database`
- session `file`
- `public/storage` is **not linked**

### Migrations already applied

`php artisan migrate:status` shows all current backend migrations as ran, including:

- users
- cache
- jobs
- roles and permissions
- user role/security fields
- media assets
- categories
- products and variants
- site settings and content sections
- orders and order status history
- catering and contact tables
- reference counters
- admin security events
- personal access tokens

### Existing API surface

`backend/routes/api.php` already exposes:

- `GET /api/v1/health`
- `GET /api/v1/site-settings`
- `GET /api/v1/media-specs`
- `GET /api/v1/categories`
- `GET /api/v1/categories/{slug}/products`
- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`
- `POST /api/v1/contact`
- `POST /api/v1/catering`
- `POST /api/v1/checkout/preview`
- `POST /api/v1/checkout/{orderNumber}/whatsapp`

Admin API already exists for:

- login / logout / me
- forgot password / reset password / change password
- dashboard
- media
- settings
- categories
- products
- orders
- catering inquiries
- contact messages

Conclusion:

- the repository is already beyond Phase 1 on the backend side
- the real missing work is not initial scaffolding, but **verification, cleanup, and end-to-end frontend integration**

## 7. Current Frontend Architecture

### App shell

`src/components/AppFrame.tsx` composes the active frontend runtime:

- `AdminAuthProvider`
- `AdminSummaryProvider`
- `SiteDataProvider`
- `CartProvider`
- global `Toaster` from `sonner`
- public `SiteHeader` / `SiteFooter`

### Styling

Styling is driven by:

- `src/styles.css`
- Tailwind CSS 4 via `@tailwindcss/vite`
- semantic `--vf-*` CSS custom properties

`tailwind.config.ts` exists but is minimal and not carrying a large theme definition.

### Metadata

Route metadata is centralized through:

- `src/lib/meta.ts`

## 8. Current Frontend API Integration

### Central API wrapper

`src/lib/api.ts` is already the shared frontend API client.

Current behavior:

- reads `VITE_API_BASE_URL`
- builds absolute API URLs
- sends `credentials: "include"`
- fetches Sanctum CSRF cookie when `requiresCsrf` is set
- normalizes API responses into an `ApiError` shape

### Higher-level domain client

`src/lib/visemfood-api.ts` maps backend data into frontend types and provides calls for:

- public site settings
- categories
- products
- product detail
- contact submission
- catering submission
- admin login/logout/me
- admin dashboard
- admin categories
- admin products
- admin orders
- admin catering inquiries
- admin contact messages

## 9. Current Mock / Fallback Data Dependencies

### Core source of mock data

Primary mock source:

- `src/data/mock.ts`

Fallback mapping layer:

- `src/lib/visemfood-api.ts`

This file imports mock data and converts it into:

- `fallbackProducts`
- `fallbackCategories`
- `fallbackTrayPackages`
- `fallbackSiteMeta`
- `fallbackAdminOrders`
- `fallbackAdminCateringInquiries`

### Mock consumers still active in `src/`

These active frontend files still rely on fallback/mock data directly or indirectly:

- `src/contexts/site-data-context.tsx`
- `src/routes/menu.tsx`
- `src/routes/trays-coolers.tsx`
- `src/routes/admin.index.tsx`
- `src/routes/admin.catalog.tsx`
- `src/routes/admin.bulk-orders.tsx`
- `src/routes/admin.analytics.tsx`
- `src/routes/admin.catering-requests.tsx`
- `src/lib/visemfood-api.ts`

### Public-site fallback behavior

`src/contexts/site-data-context.tsx` currently:

- initializes site meta, categories, products, and tray packages from fallback data
- attempts `fetchPublicCatalog()`
- switches to live API data only after a successful refresh

Implication:

- public pages can still render mock data if the API fails or is unreachable
- this masks integration problems instead of failing loudly

### Admin fallback behavior

Several admin routes initialize state from fallback arrays and then replace them with live data:

- `src/routes/admin.index.tsx`
- `src/routes/admin.catalog.tsx`
- `src/routes/admin.bulk-orders.tsx`
- `src/routes/admin.analytics.tsx`
- `src/routes/admin.catering-requests.tsx`

Implication:

- admin screens look populated even when the live backend is unavailable
- this is useful for UI demos but unsafe for production truthfulness

## 10. Mock Data Consumers by Feature

### Header / footer / contact meta

- `SiteHeader` itself is static nav
- `SiteFooter`, `Contact`, `Catering`, and homepage details consume `siteMeta` from `useSiteData()`
- `siteMeta` is API-backed but starts from fallback mock values

### Menu

`/menu`:

- reads live/fallback `categories` and `products` from `SiteDataProvider`
- still uses `fallbackProducts[0]?.image` for route metadata image

### Product detail

`/menu/$slug`:

- does **not** call a dedicated detail endpoint directly
- looks up the product inside `useSiteData().products`
- therefore depends on the catalog payload already loaded into context

### Trays & coolers

`/trays-coolers`:

- builds offerings from `products` + `trayPackages` in `useSiteData()`
- still uses `fallbackTrayPackages[0]?.image` in page metadata
- still contains mock-era assumptions about trays/coolers

### Admin

Current admin pages are mostly **read-only operational views** over live API data, with fallback seeding for resilience. They are not yet full create/edit/delete flows in the active `src/` frontend.

## 11. Current Admin Authentication State

### Active `src/` auth state

The active TanStack frontend **does not use localStorage for admin auth** anymore.

Current implementation:

- `src/contexts/admin-auth-context.tsx`
- calls `fetchCurrentAdminUser()`
- calls `loginAdmin()`
- calls `logoutAdmin()`
- stores authenticated user in React state only
- relies on Laravel cookie auth through Sanctum

### Demo behavior still present

Demo credentials are still hardcoded for convenience:

- email: `admin@visemfood.test`
- password: `Password12345`

They are used for:

- prefilled form defaults in `src/routes/login.tsx`
- display inside the login page UI

Implication:

- auth transport is already live/cookie-based
- login UX still contains demo onboarding content that should be reviewed before production

## 12. Current Client-Side Persistence

### Cart

`src/contexts/cart-context.tsx` uses localStorage key:

- `visemfood-cart`

It stores:

- cart items
- bulk quantities

Important limitation:

- cart items currently store `slug`, `name`, `price`, `quantity`, and `image`
- they do **not** store backend `product_id`
- they do **not** store `variant_id`
- browser-held `price` remains part of cart state, which is not acceptable as the final authority for checkout

### Bulk quantities

Bulk/trays quantities are also stored locally in the same cart payload.

## 13. Current Forms, Validation, and Toast Usage

### Toast system

The active app already uses `sonner`.

Global toaster:

- `src/components/AppFrame.tsx`

Toast usage already exists in:

- `src/routes/contact.tsx`
- `src/routes/catering.tsx`
- `src/routes/catering.inquiry.tsx`
- `src/routes/login.tsx`
- `src/routes/admin.tsx`

### Form validation

The active public/auth forms already use:

- `react-hook-form`
- `zod`
- `@hookform/resolvers/zod`

Current route-level schemas:

- `src/routes/contact.tsx`
- `src/routes/catering.tsx`
- `src/routes/catering.inquiry.tsx`
- `src/routes/login.tsx`

### Public form persistence

Public forms are already wired to live backend endpoints:

- contact form -> `POST /api/v1/contact`
- catering forms -> `POST /api/v1/catering`

This part is already ahead of the original plan.

## 14. Current Currency Audit

The active application is **not yet migrated to USD**.

### Hardcoded NGN usage in active `src/`

Found in active frontend:

- `src/routes/index.tsx`
- `src/routes/trays-coolers.tsx`
- `src/routes/menu.$slug.tsx`
- `src/components/ProductCard.tsx`
- `src/routes/admin.index.tsx`
- `src/routes/admin.catalog.tsx`
- `src/routes/admin.bulk-orders.tsx`
- `src/routes/admin.analytics.tsx`
- `src/lib/visemfood-api.ts`
- `src/data/mock.ts`

### Direct formatting issues

Examples:

- `new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })`
- string literals like `NGN ${value.toLocaleString()}`

### Missing currency abstraction

There is currently **no centralized currency utility** in active `src/`.

Baseline implication:

- USD migration must be handled centrally
- the current app still mixes display formatting and raw numbers inline

## 15. Current Product / Variant / Checkout Gaps in `src/`

### Product detail

`/menu/$slug` currently:

- reads from the site-wide products array
- shows a single price
- does not render selectable variants
- adds cart items by `slug`

### Variants

`src/lib/visemfood-api.ts` already models variants in frontend types, but active public UI does not yet expose a real variant-selection flow.

### Checkout

The backend already has checkout endpoints, but the active TanStack frontend is **not yet consuming them**.

Search results show no active `src/` usage of:

- `POST /api/v1/checkout/preview`
- `POST /api/v1/checkout/{reference}/whatsapp`

Implication:

- order persistence / WhatsApp handoff is incomplete in the active frontend
- cart UX exists, but end-to-end authoritative checkout is not yet connected

## 16. Current Header / Footer Settings State

`SiteFooter` already consumes `siteMeta` from `useSiteData()`, including:

- phone
- email
- address
- hours
- WhatsApp links
- social links

This means site settings are **partially centralized already**.

However:

- values still begin from fallback mock data
- footer service copy is still static
- privacy/terms currently point to `/contact`

`SiteHeader` currently uses:

- fixed nav items
- no settings-driven business contact content

## 17. Current Build / Type / Test Baseline

### Frontend build

Command:

- `npm.cmd run build`

Result:

- **PASS**

Current warnings / notes:

- `subtle-pattern-url referenced in subtle-pattern-url didn't resolve at build time, it will remain unchanged to be resolved at runtime`
- Rolldown plugin timing diagnostics were printed, but they are performance notes, not build failures

### Frontend type check

Command:

- `npx.cmd tsc --noEmit`

Result:

- **FAIL**

Current TypeScript errors:

- `src/lib/visemfood-api.ts(8,21): error TS6133: 'MockBulkOrder' is declared but its value is never read.`
- `src/routes/trays-coolers.tsx(214,9): error TS6133: 'counts' is declared but its value is never read.`

### Backend tests

Command:

- `php artisan test`

Result:

- **PASS**

Current passing feature coverage includes:

- admin auth
- admin catalog
- admin order updates
- checkout preview
- continue-on-WhatsApp
- public catalog
- public contact submission
- public catering submission

### Runtime dev command

`npm.cmd run dev` is a long-running process, so it does not return cleanly in the shell audit flow. The production build passes, and the active TanStack app structure is valid, but long-running interactive runtime verification was not used as the primary pass/fail signal in this baseline.

## 18. Git Working Tree Baseline

Current working tree was already dirty before this Phase 0 document was added.

Observed non-doc changes include:

- modified header/footer/admin/login/root route files
- new public logo assets
- new `BrandLogo` and `brand-assets` files

Also present:

- untracked `docs/docs.zip`

Baseline implication:

- future work must avoid overwriting or reverting unrelated in-progress frontend changes unless explicitly requested

## 19. Key Baseline Risks

1. The repository is ahead of the original phase plan.
   - A Laravel backend already exists.
   - Re-scaffolding would create duplicate systems.

2. Active frontend truthfulness is still mixed.
   - Several screens silently fall back to mock data.
   - Production users/admins could see demo data during backend/API failure.

3. Currency is still wrong for the approved direction.
   - NGN is still hardcoded across active frontend and fallback layers.
   - Backend env defaults are also still NGN.

4. Checkout is only partially integrated.
   - Backend preview/WhatsApp APIs exist.
   - Active `src/` frontend does not yet use them.

5. Cart identity is insufficient for authoritative ordering.
   - No `product_id`
   - No `variant_id`
   - local cart price still present

6. Product variants exist in types but not in active public UX.

7. Legacy root artifacts remain a deployment and maintenance hazard.
   - especially `app/`, `lib/`, `components/`, `prisma/`, `.next/`, and `middleware.ts`

8. Laravel local environment is still SQLite + file sessions.
   - acceptable for local baseline
   - not yet aligned with final cPanel MySQL/MariaDB target

9. Frontend typecheck is not green yet.
   - build passes
   - typecheck does not

10. `public/storage` is not linked in backend local setup.
    - media work will need that addressed before end-to-end upload verification

## 20. Phase 0 Conclusions

### What is already true

- active frontend = TanStack Start in `src/`
- separate Laravel backend already exists in `backend/`
- backend migrations are already applied locally
- backend feature tests already pass
- public forms already persist to backend
- admin auth already uses live cookie-based backend auth
- header/footer already consume shared site meta from a context

### What is not yet complete

- frontend still depends on fallback/mock data for resilience and bootstrapping
- USD migration is not done
- authoritative checkout is not wired in active `src/`
- variants are not surfaced end-to-end in public ordering UX
- admin pages in active `src/` are mostly read/list/filter views, not complete CRUD flows
- frontend typecheck still fails

### Recommended Phase 1 interpretation

Do **not** create a new Laravel backend from scratch.

Instead, Phase 1 should be treated as:

- verify and harden the existing Laravel backend foundation
- align the frontend with the existing backend contracts
- remove or isolate fallback behavior where it obscures production truth
- fix the current typecheck issues
- prepare the system for the approved USD + admin-controlled dynamic flows
