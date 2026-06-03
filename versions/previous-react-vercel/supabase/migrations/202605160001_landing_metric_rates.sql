create or replace view public.landing_metric_summary as
with by_variant as (
  select
    variant,
    count(*) filter (where event_name = 'page_view') as page_views,
    count(*) filter (where event_name = 'link_click') as link_clicks,
    count(*) filter (where event_name = 'cta_click') as cta_clicks,
    count(*) filter (where event_name = 'waitlist_click') as waitlist_clicks,
    count(*) filter (where event_name = 'email_signup_submit') as email_submits,
    count(*) filter (where event_name = 'paypal_reserve_click') as paypal_clicks,
    count(*) filter (where event_name = 'faq_expand') as faq_expands,
    round(
      avg((payload->>'duration_seconds')::numeric)
        filter (where event_name = 'page_engagement' and payload ? 'duration_seconds'),
      2
    ) as avg_time_on_page_seconds,
    min(created_at) as first_seen_at,
    max(created_at) as last_seen_at
  from public.landing_events
  group by variant
)
select
  variant,
  page_views,
  link_clicks,
  round(link_clicks::numeric / nullif(page_views, 0), 4) as landing_page_view_to_link_click_rate,
  avg_time_on_page_seconds,
  cta_clicks,
  round(cta_clicks::numeric / nullif(page_views, 0), 4) as cta_click_rate,
  waitlist_clicks,
  email_submits,
  round(email_submits::numeric / nullif(page_views, 0), 4) as email_lead_conversion_rate,
  paypal_clicks,
  round(paypal_clicks::numeric / nullif(page_views, 0), 4) as one_dollar_reservation_conversion_rate,
  faq_expands,
  round(faq_expands::numeric / nullif(page_views, 0), 4) as faq_expand_rate,
  first_seen_at,
  last_seen_at
from by_variant;

revoke all on public.landing_metric_summary from anon;
grant select on public.landing_metric_summary to authenticated;
