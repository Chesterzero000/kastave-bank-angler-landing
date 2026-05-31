create extension if not exists pgcrypto;

create table if not exists public.landing_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  source text,
  variant text not null default 'one-dollar',
  path text,
  visitor_id text,
  payload jsonb not null default '{}'::jsonb,
  utm jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists landing_events_event_name_created_at_idx
  on public.landing_events (event_name, created_at desc);

create index if not exists landing_events_variant_created_at_idx
  on public.landing_events (variant, created_at desc);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  variant text not null default 'one-dollar',
  page_path text,
  visitor_id text,
  utm jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_signups_variant_created_at_idx
  on public.waitlist_signups (variant, created_at desc);

create table if not exists public.reservation_intents (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paypal',
  amount_cents integer not null,
  refundable boolean not null default false,
  source text,
  variant text not null default 'one-dollar',
  payment_link text,
  page_path text,
  visitor_id text,
  utm jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists reservation_intents_variant_created_at_idx
  on public.reservation_intents (variant, created_at desc);

alter table public.landing_events enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.reservation_intents enable row level security;

drop policy if exists "Allow anonymous event inserts" on public.landing_events;
drop policy if exists "Allow anonymous waitlist inserts" on public.waitlist_signups;
drop policy if exists "Allow anonymous reservation intent inserts" on public.reservation_intents;
drop policy if exists "Allow authenticated event reads" on public.landing_events;
drop policy if exists "Allow authenticated waitlist reads" on public.waitlist_signups;
drop policy if exists "Allow authenticated reservation intent reads" on public.reservation_intents;
drop policy if exists "允许匿名事件插入" on public.landing_events;
drop policy if exists "允许匿名等待名单插入" on public.waitlist_signups;
drop policy if exists "允许匿名预定意向插入" on public.reservation_intents;
drop policy if exists "允许认证事件读取" on public.landing_events;
drop policy if exists "允许认证等待名单读取" on public.waitlist_signups;
drop policy if exists "允许认证预定意向读取" on public.reservation_intents;
drop policy if exists p_landing_events_insert on public.landing_events;
drop policy if exists p_waitlist_signups_insert on public.waitlist_signups;
drop policy if exists p_reservation_intents_insert on public.reservation_intents;

create policy p_landing_events_insert
  on public.landing_events
  for insert
  to public
  with check (true);

create policy p_waitlist_signups_insert
  on public.waitlist_signups
  for insert
  to public
  with check (true);

create policy p_reservation_intents_insert
  on public.reservation_intents
  for insert
  to public
  with check (true);

create policy "Allow anonymous event inserts"
  on public.landing_events
  for insert
  to public
  with check (true);

create policy "Allow anonymous waitlist inserts"
  on public.waitlist_signups
  for insert
  to public
  with check (true);

create policy "Allow anonymous reservation intent inserts"
  on public.reservation_intents
  for insert
  to public
  with check (true);

create policy "Allow authenticated event reads"
  on public.landing_events
  for select
  to authenticated
  using (true);

create policy "Allow authenticated waitlist reads"
  on public.waitlist_signups
  for select
  to authenticated
  using (true);

create policy "Allow authenticated reservation intent reads"
  on public.reservation_intents
  for select
  to authenticated
  using (true);

create or replace view public.landing_metric_summary as
select
  variant,
  count(*) filter (where event_name = 'page_view') as page_views,
  count(*) filter (where event_name = 'waitlist_click') as waitlist_clicks,
  count(*) filter (where event_name = 'email_signup_submit') as email_submits,
  count(*) filter (where event_name = 'paypal_reserve_click') as paypal_clicks,
  min(created_at) as first_seen_at,
  max(created_at) as last_seen_at
from public.landing_events
group by variant;

revoke all on public.landing_metric_summary from anon;
grant select on public.landing_metric_summary to authenticated;

grant usage on schema public to anon, authenticated;
grant insert on public.landing_events to anon, authenticated;
grant insert on public.waitlist_signups to anon, authenticated;
grant insert on public.reservation_intents to anon, authenticated;
grant select on public.landing_events to authenticated;
grant select on public.waitlist_signups to authenticated;
grant select on public.reservation_intents to authenticated;
