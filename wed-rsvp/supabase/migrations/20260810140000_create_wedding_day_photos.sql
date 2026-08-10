-- Wedding-day guest photos (metadata). Binary files live in Storage bucket
-- `wedding-day-photos` (private; service-role access only — create the bucket
-- in the Supabase dashboard or via `storage.buckets` insert below).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-day-photos',
  'wedding-day-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create table public.wedding_day_photos (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.rsvps (id) on delete cascade,
  storage_path text not null unique,
  captured_at timestamptz,
  created_at timestamptz not null default now()
);

create index wedding_day_photos_guest_id_idx
  on public.wedding_day_photos (guest_id);

create index wedding_day_photos_captured_at_idx
  on public.wedding_day_photos (captured_at desc nulls last);

alter table public.wedding_day_photos enable row level security;

revoke all on table public.wedding_day_photos from anon, authenticated;
grant all on table public.wedding_day_photos to service_role;

comment on table public.wedding_day_photos is
  'Server-managed wedding-day photobooth captures. Direct browser access is intentionally disabled.';
