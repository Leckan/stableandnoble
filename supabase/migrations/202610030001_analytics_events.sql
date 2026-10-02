create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'page_view', 'property_view', 'seller_form_started', 'seller_form_completed',
    'investor_form_started', 'investor_form_completed', 'contact_form_submitted',
    'property_analyzer_started', 'property_analyzer_completed'
  )),
  route text not null check (route like '/%' and length(route) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);

alter table public.analytics_events enable row level security;
create policy "Staff read analytics events" on public.analytics_events
  for select using (public.is_staff());

comment on table public.analytics_events is 'Low-detail first-party website events. Do not store IP addresses, form values, or personal data.';
