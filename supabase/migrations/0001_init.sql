-- 10am Supabase schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Tables: users, wishlists, clicks, newsletter_signups. RLS per 10am_build_context.md.

-- ============================================================ users
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  name text,
  created_at timestamptz not null default now(),
  newsletter_subscribed boolean not null default false,
  member_tier text not null default 'free' check (member_tier in ('free', 'club'))
);

alter table public.users enable row level security;

create policy "users read own row"
  on public.users for select using (auth.uid() = id);
create policy "users update own row"
  on public.users for update using (auth.uid() = id);
create policy "users insert own row"
  on public.users for insert with check (auth.uid() = id);

-- ============================================================ wishlists
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id text not null,             -- Sanity product slug/id
  product_snapshot jsonb not null,      -- brand, name, image, price at save time
  saved_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "wishlist owner all"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================ clicks (affiliate log)
create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid references public.users (id) on delete set null,
  session_id text,
  referrer_page text,
  network text,
  affiliate_url text,
  user_agent text,
  ip_country text,
  clicked_at timestamptz not null default now()
);

alter table public.clicks enable row level security;

-- Anonymous clicks are allowed; nobody can read the raw log from the client.
create policy "anyone can log a click"
  on public.clicks for insert with check (true);

create index if not exists clicks_product_idx on public.clicks (product_id, clicked_at desc);

-- ============================================================ newsletter_signups
create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  source text,                          -- homepage popup, gated content, footer
  signed_up_at timestamptz not null default now(),
  confirmed boolean not null default false,
  confirmed_at timestamptz
);

alter table public.newsletter_signups enable row level security;

create policy "anyone can sign up"
  on public.newsletter_signups for insert with check (true);
