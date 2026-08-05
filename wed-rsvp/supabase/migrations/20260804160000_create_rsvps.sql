create extension if not exists pgcrypto;

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  email text not null check (char_length(trim(email)) between 3 and 320),
  email_normalized text generated always as (lower(trim(email))) stored,
  additional_details text not null default '' check (char_length(additional_details) <= 4000),
  submission_source text not null
    check (submission_source in ('pre_wedding', 'wedding_day', 'admin')),
  notification_status jsonb not null default '{}'::jsonb,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_normalized)
);

create index rsvps_created_at_idx on public.rsvps (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (
    new.first_name,
    new.last_name,
    new.email,
    new.additional_details,
    new.submission_source
  ) is distinct from (
    old.first_name,
    old.last_name,
    old.email,
    old.additional_details,
    old.submission_source
  ) then
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create trigger set_rsvps_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

alter table public.rsvps enable row level security;

revoke all on table public.rsvps from anon, authenticated;
grant all on table public.rsvps to service_role;

comment on table public.rsvps is
  'Server-managed RSVP submissions. Direct browser access is intentionally disabled.';
