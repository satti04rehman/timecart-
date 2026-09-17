# TimeCart — Overview

**Where Time Meets Style** — premium watch e-commerce, Next.js 16 (App Router),
Supabase (Postgres / Auth / Storage), Prisma 7, Tailwind CSS 4, Recharts.

## Features (from source)
- Browse, search, and filter watches by brand and category
- Wishlist, cart, checkout with order status lifecycle
- Product reviews with images
- Order tracking, coupons, newsletters
- Admin area: products, coupons, orders, customers, brands, categories, reviews

## Database (prisma/schema.prisma)
23 models incl. `User`, `Profile`, `Product`, `ProductVariant`, `Order`,
`OrderItem`, `Payment`, `Review`, `Coupon`, `CouponUsage`; 10 enums incl.
`UserRole`, `OrderStatus`, `PaymentMethod`.

## Public API (src/app/api)
`/api/products`, `/api/search`, `/api/reviews`, `/api/coupons/validate`,
`/api/orders`, `/api/track-order`, `/api/newsletter`, `/api/contact`,
`/api/config`, `/api/upload`, `/api/profile`, plus `/api/admin/*`.

See `docs/diagrams/` for rendered diagrams.
## Secret test



