# VISEMFOOD

Premium African catering platform built with TanStack Start and the Heritage Hearth design system.

## Stack
- TanStack Start
- React 19
- TypeScript
- Tailwind CSS v4
- Zod
- react-hook-form
- sonner

## Local Development
```bash
npm install
npm run generate-routes
npm run dev
```

## Current Scope
- Customer-facing marketing, menu, trays and coolers, delivery, story, and contact routes
- Admin dashboard, catering requests, bulk orders, catalog, and analytics routes
- Typed mock data in `src/data/mock.ts`
- Client-side cart and bulk-order quantity persistence with `localStorage`
- Form validation with Zod and `react-hook-form`

## cPanel Node.js Deployment
- Recommended Node version: `20.x` or newer supported by your cPanel Node.js app manager
- App root: the repository root
- Install dependencies: `npm install`
- Generate TanStack routes: `npm run generate-routes`
- Build the app: `npm run build`
- Start command: `npm run start`

## Environment Variables
No required environment variables for this mock-data-first release.

## Notes
- This first pass does not use a database, Prisma, authentication, or payments.
- Legacy Next.js and Prisma files may still exist in the repository, but the active app lives under `src/` and builds with TanStack Start.
