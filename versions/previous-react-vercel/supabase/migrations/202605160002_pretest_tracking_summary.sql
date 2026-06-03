create index if not exists landing_events_utm_content_created_at_idx
  on public.landing_events ((utm->>'utm_content'), created_at desc);

create index if not exists landing_events_creative_hook_created_at_idx
  on public.landing_events ((payload->>'creative_hook'), created_at desc);

create table if not exists public.purchase_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  provider text not null default 'paypal',
  amount_cents integer not null,
  currency text not null default 'USD',
  source text,
  variant text not null default 'one-dollar',
  page_path text,
  visitor_id text,
  utm jsonb not null default '{}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists purchase_events_variant_created_at_idx
  on public.purchase_events (variant, created_at desc);

alter table public.purchase_events enable row level security;

drop policy if exists p_purchase_events_insert on public.purchase_events;
drop policy if exists "Allow anonymous purchase event inserts" on public.purchase_events;
drop policy if exists "Allow authenticated purchase event reads" on public.purchase_events;

create policy p_purchase_events_insert
  on public.purchase_events
  for insert
  to public
  with check (true);

create policy "Allow anonymous purchase event inserts"
  on public.purchase_events
  for insert
  to public
  with check (true);

create policy "Allow authenticated purchase event reads"
  on public.purchase_events
  for select
  to authenticated
  using (true);

grant insert on public.purchase_events to anon, authenticated;
grant select on public.purchase_events to authenticated;

drop view if exists public.pretest_creative_summary;
drop view if exists public.landing_metric_summary;

create or replace view public.landing_metric_summary as
with event_counts as (
  select
    variant,
    count(*) filter (where event_name = 'page_view') as page_views,
    count(*) filter (where event_name = 'outbound_click') as outbound_clicks,
    count(*) filter (where event_name = 'lead_intent') as lead_intents,
    count(*) filter (where event_name = 'email_input_started') as email_input_starts,
    count(*) filter (where event_name = 'lead') as leads,
    count(*) filter (where event_name = 'lead_submit_failed') as lead_submit_failures,
    count(*) filter (where event_name = 'initiate_checkout') as checkout_starts,
    count(*) filter (where event_name = 'purchase') as thank_you_purchase_events,
    count(*) filter (where event_name = 'payment_failed') as payment_failures,
    count(*) filter (where event_name = 'faq_opened') as faq_opens,
    round(
      avg((payload->>'duration_seconds')::numeric)
        filter (where event_name = 'page_engagement' and payload ? 'duration_seconds'),
      2
    ) as avg_time_on_page_seconds,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at
  from public.landing_events
  group by variant
),
verified_purchase_counts as (
  select
    variant,
    count(*) as verified_purchases
  from public.purchase_events
  where amount_cents = 100
    and upper(currency) = 'USD'
  group by variant
)
select
  event_counts.variant,
  page_views,
  avg_time_on_page_seconds,
  lead_intents,
  round(lead_intents::numeric / nullif(page_views, 0), 4) as lead_intent_rate,
  email_input_starts,
  leads,
  round(leads::numeric / nullif(page_views, 0), 4) as email_lead_conversion_rate,
  lead_submit_failures,
  checkout_starts,
  round(checkout_starts::numeric / nullif(page_views, 0), 4) as checkout_start_rate,
  coalesce(verified_purchases, 0) as verified_purchases,
  round(coalesce(verified_purchases, 0)::numeric / nullif(page_views, 0), 4) as one_dollar_purchase_rate,
  thank_you_purchase_events,
  payment_failures,
  outbound_clicks,
  faq_opens,
  round(faq_opens::numeric / nullif(page_views, 0), 4) as faq_open_rate,
  first_seen_at,
  last_seen_at
from event_counts
left join verified_purchase_counts
  on verified_purchase_counts.variant = event_counts.variant;

create or replace view public.pretest_creative_summary as
select
  coalesce(payload->>'creative_hook', utm->>'creative_hook', 'unknown') as creative_hook,
  coalesce(payload->>'creative_id', utm->>'creative_id', utm->>'utm_content', 'unknown') as creative_id,
  coalesce(payload->>'creative_format', utm->>'creative_format', 'unknown') as creative_format,
  coalesce(payload->>'creative_version', utm->>'creative_version', 'unknown') as creative_version,
  coalesce(payload->>'utm_campaign', utm->>'utm_campaign', 'unknown') as campaign,
  coalesce(payload->>'utm_term', utm->>'utm_term', payload->>'audience_name', utm->>'audience_name', 'unknown') as audience,
  count(*) filter (where event_name = 'page_view') as page_views,
  count(*) filter (where event_name = 'view_content') as content_views,
  count(*) filter (where event_name = 'lead_intent') as lead_intents,
  count(*) filter (where event_name = 'lead') as leads,
  count(*) filter (where event_name = 'initiate_checkout') as checkout_starts,
  count(*) filter (where event_name = 'purchase') as purchases,
  count(*) filter (where event_name = 'faq_opened') as faq_opens,
  round((count(*) filter (where event_name = 'lead'))::numeric / nullif(count(*) filter (where event_name = 'page_view'), 0), 4) as lead_conversion_rate,
  round((count(*) filter (where event_name = 'purchase'))::numeric / nullif(count(*) filter (where event_name = 'page_view'), 0), 4) as purchase_conversion_rate,
  min(created_at) as first_seen_at,
  max(created_at) as last_seen_at
from public.landing_events
group by 1, 2, 3, 4, 5, 6;

revoke all on public.landing_metric_summary from anon;
revoke all on public.pretest_creative_summary from anon;
grant select on public.landing_metric_summary to authenticated;
grant select on public.pretest_creative_summary to authenticated;
