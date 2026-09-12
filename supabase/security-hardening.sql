-- ============================================================
-- TimeCart · Security hardening
-- Run once in: Supabase Dashboard → SQL Editor → New query
--
-- Why: every public table had RLS disabled, which means the
-- public "anon" API key (embedded in the browser bundle) could
-- read AND write ALL data through PostgREST. This enables RLS
-- everywhere and only allows the specific, safe access the app
-- needs.
--
-- The storefront reads products/brands/categories via Prisma on
-- the server (superuser Postgres), NOT via the anon key, so the
-- app itself is unaffected by locking the public API down.
-- ============================================================

-- 1) Kill any over-broad privileges the anon / authenticated roles
--    have on PUBLIC schema objects (they can still use auth.*, and
--    storage.* keeps its own revoke below).
revoke all privileges on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;

-- 2) Enable RLS on every public table WITHOUT granting any new
--    policies. With no policies, PostgREST + anon/authenticated
--    get zero rows — full deny-by-default.
alter table public.users            enable row level security;
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.brands           enable row level security;
alter table public.categories       enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images   enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.payments         enable row level security;
alter table public.addresses        enable row level security;
alter table public.wishlists        enable row level security;
alter table public.reviews          enable row level security;
alter table public.review_images    enable row level security;
alter table public.coupons          enable row level security;
alter table public.coupon_usages    enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.notifications    enable row level security;
alter table public.pages            enable row level security;
alter table public.admin_logs       enable row level security;
alter table public.inventory_logs   enable row level security;

-- 3) Storage: keep the bucket readable but remove write access
--    from anon (uploads happen via service role / signed uploads).
drop policy if exists "timecart-public-read" on storage.objects;
create policy "timecart-public-read"
  on storage.objects for select
  using (bucket_id = 'timecart');

drop policy if exists "timecart-public-insert" on storage.objects;
drop policy if exists "timecart-public-update" on storage.objects;
drop policy if exists "timecart-public-delete" on storage.objects;

-- 4) (Optional) create a read-only policy set for products/catalog
--    IF you ever switch the storefront to direct PostgREST reads.
--    Currently the app uses Prisma, so leave disabled by default.

-- 5) Reject execution of the public schema's default functions only
--    if needed; keep default for now.

-- Confirm: run in a new query:
--   select relname, relrowsecurity
--   from pg_class c join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r' order by relname;