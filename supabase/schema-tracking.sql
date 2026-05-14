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

alter table public.page_events enable row level security;
alter table public.affiliate_clicks enable row level security;

drop policy if exists "Public can insert page events" on public.page_events;
create policy "Public can insert page events"
on public.page_events for insert
with check (true);

drop policy if exists "Public can insert affiliate clicks" on public.affiliate_clicks;
create policy "Public can insert affiliate clicks"
on public.affiliate_clicks for insert
with check (true);
