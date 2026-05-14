-- Veredito Tech / Motor Afiliado Tech IA
-- Execute no Supabase SQL editor quando criar o projeto.
-- Revise RLS antes de producao.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  model text,
  category text not null,
  image_url text,
  image_authorized boolean default false,
  specs jsonb default '{}'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  marketplace text not null,
  original_url text,
  affiliate_url text not null,
  seller text,
  estimated_commission text,
  notes text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  marketplace text not null,
  current_price numeric(12, 2),
  regular_price numeric(12, 2),
  coupon text,
  price_status text check (price_status in ('real', 'simulated', 'estimate', 'expired')) default 'estimate',
  shipping_note text,
  checked_at timestamptz default now(),
  source_url text,
  notes text
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type text not null,
  status text check (status in ('draft', 'preview', 'approved', 'published')) default 'draft',
  category text,
  meta_description text,
  excerpt text,
  hero_image_url text,
  hero_image_alt text,
  author text,
  content_json jsonb not null default '{}'::jsonb,
  html_path text,
  canonical_url text,
  published_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.article_products (
  article_id uuid references public.articles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  relation text default 'mentioned',
  primary key (article_id, product_id)
);

create table if not exists public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  name text not null,
  url text not null,
  note text,
  checked_at timestamptz default now()
);

create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text unique not null,
  provider text default 'google-adsense',
  label text default 'Publicidade',
  ad_client text,
  ad_slot text,
  format text default 'auto',
  placement text,
  enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete set null,
  event_name text not null,
  event_payload jsonb default '{}'::jsonb,
  page_url text,
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete set null,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  marketplace text,
  target_url text,
  page_url text,
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.articles enable row level security;
alter table public.article_products enable row level security;
alter table public.article_sources enable row level security;
alter table public.ad_slots enable row level security;
alter table public.page_events enable row level security;
alter table public.affiliate_clicks enable row level security;

-- Politicas publicas seguras para leitura de artigos publicados e dados nao sensiveis.
create policy if not exists "Public can read published articles"
on public.articles for select
using (status = 'published');

create policy if not exists "Public can read products"
on public.products for select
using (true);

create policy if not exists "Public can read active affiliate links"
on public.affiliate_links for select
using (active = true);

create policy if not exists "Public can read sources"
on public.article_sources for select
using (true);

-- Eventos publicos podem ser inseridos pela anon key se voce quiser tracking direto.
-- Em producao, prefira uma API server-side para filtrar spam.
create policy if not exists "Public can insert page events"
on public.page_events for insert
with check (true);

create policy if not exists "Public can insert affiliate clicks"
on public.affiliate_clicks for insert
with check (true);
