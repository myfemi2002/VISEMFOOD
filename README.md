# VISEMFOOD Platform

Premium culinary, catering, and dynamic admin platform for VISEMFOOD.

## Stack
- Next.js 15
- React 19
- Prisma
- MariaDB / MySQL
- Tailwind CSS
- Cloudinary

## Environment
Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `AUTH_SESSION_SECRET`
- `APP_ENCRYPTION_KEY`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## Setup
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Admin
Phase-one admin is mounted at `/admin`.

Seeded super admin credentials come from:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## cPanel Deployment Notes
- Use Node.js 22 in Namecheap cPanel if available
- Set environment variables in the Node.js app manager
- Run `npm install`
- Run `npx prisma generate`
- Run database migrations before first start
- Build with `npm run build`
- Start with `npm run start`
