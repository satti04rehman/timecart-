# TimeCart

**Where Time Meets Style** — a premium watch e-commerce storefront built with Next.js 16 (App Router), Supabase (Postgres / Auth / Storage), Prisma 7, Tailwind CSS 4, and Recharts.

## Features

- **Home** with scroll-scrubbed hero video (`/videos/animatio-30fps.mp4`, mobile variant + poster)
- **Catalog** — `/watches` with URL-driven filters (category, brand, gender, price, rating, movement, style, availability), sorting, and pagination
- **Product detail** — `/watches/[slug]` with gallery, add-to-cart / buy-now, tabs (description / specs / reviews), and related products
- **Cart, Wishlist, Checkout** — client-persisted (localStorage) flows; COD up to Rs. 60,000, Bank Transfer (50% advance) above it; coupon validation API
- **Order tracking** — `/track-order` reads orders stored client-side with a live status timeline
- **Account dashboard** — `/account/*` with overview, orders, addresses, settings
- **Auth** — `/login` + `/register` backed by Supabase when configured, otherwise a local demo session
- **Watch Finder** — `/find-watch` rule-based quiz that recommends watches from the catalog
- **Admin panel** — `/admin` with dashboard, products, orders, coupons, categories, brands, reviews, inventory, pages, contact inquiries, and settings (demo-mode CRUD until a database is wired up)
- **Static pages** — about, FAQ, contact, shipping & delivery, returns, warranty, privacy, terms

## Demo mode vs. live mode

The app runs fully in **demo mode** when Supabase environment variables are placeholders:

- Catalog, search, and home content come from `src/lib/demo-data.ts` (Picsum images)
- Order / address / profile data persist in the browser via `localStorage` (`tc-orders`, `tc-order-<num>`, `tc-addresses`, `tc-profile`, `tc-session`)
- Admin mutations (`/api/admin/*`) return `{ ok: true, demo: true }` and warn that changes won't persist

With real credentials, the app switches to Supabase Auth + Postgres (Prisma). No code changes needed.

## Getting started

```bash
npm install
cp .env.example .env        # fill in real values to enable live mode
npm run dev
```

## Database (Prisma 7)

Prisma 7 uses a driver adapter (`@prisma/adapter-pg`) — the URL lives in `prisma.config.ts`, not the schema.

```bash
npm run db:generate   # regenerate the client into src/generated/prisma
npm run db:push       # create tables
npm run db:seed       # node prisma/seed.ts — admin + brands + categories + products + coupons
```

The seed creates an admin profile (email from `SEED_ADMIN_EMAIL`, default `admin@timecart.pk`) on the `users`/`profiles` tables.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to the database |
| `npm run db:seed` | Seed the database |

## Tech notes

- **Next.js 16** — `useSearchParams()` needs a `<Suspense>` boundary on prerendered pages; the `middleware` file convention is deprecated in favor of `proxy` (build warning only).
- **Prisma 7** — `generator client` outputs to `src/generated/prisma` (gitignored).
- **Client components must not import `@/lib/data`** or anything that pulls `pg`/Prisma into the browser bundle.
- Package manager: npm only (pnpm is not usable in this environment).