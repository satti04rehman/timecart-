-- ============================================================
-- TimeCart · Supabase setup
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Auto-create a `users` + `profiles` row for every new auth signup
--    (works for email signup AND Google OAuth). The Supabase user id is
--    used as the primary key on `public.users`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (id) do update
    set email = excluded.email;

  insert into public.profiles (id, "userId", role, email, "firstName", "lastName", "updatedAt")
values (
  gen_random_uuid(),
  new.id,
  case when coalesce(new.email,'') = 'satti04rehman@gmail.com' then 'ADMIN'::public."UserRole" else 'CUSTOMER'::public."UserRole" end,
  new.email,
  coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email,''), '@', 1)),
  null,
  now()
)
on conflict ("userId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Storage bucket for product / review images (public read)
insert into storage.buckets (id, name, public)
values ('timecart', 'timecart', true)
on conflict (id) do nothing;

-- 3) Make the bucket public-read via a policy
drop policy if exists "timecart-public-read" on storage.objects;
create policy "timecart-public-read"
  on storage.objects for select
  using (bucket_id = 'timecart');

-- 4) Seed an admin profile (matches the admin cookie login).
--    Optionally link it to YOUR Google account by replacing the email.
insert into public.profiles
  (id, "userId", role, email, "firstName", "isActive")
select gen_random_uuid(), u.id, 'ADMIN', u.email, 'Admin', true
from public.users u
where u.email = 'satti04rehman@gmail.com'   -- admin Google email
on conflict ("userId") do nothing;