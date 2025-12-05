-- Solspot Supabase Database Setup
-- Kør denne SQL i Supabase Dashboard → SQL Editor

-- Opret venues tabel
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  external_place_id text unique not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  has_outdoor_seating boolean default false,
  manual_opening_hours jsonb,
  notes text,
  updated_at timestamptz default now()
);

-- Opret index for hurtigere søgninger
create index if not exists idx_venues_external_place_id on public.venues(external_place_id);
create index if not exists idx_venues_location on public.venues using gist (
  ll_to_earth(latitude, longitude)
);

-- Slå RLS (Row Level Security) fra som specificeret i README
-- Projektet har ingen auth, så alle kan læse data
alter table public.venues enable row level security;

-- Opret policy der tillader alle at læse (ingen auth nødvendig)
create policy "Allow public read access" on public.venues
  for select
  using (true);

-- Opret policy der tillader alle at indsætte (hvis nødvendigt senere)
-- create policy "Allow public insert" on public.venues
--   for insert
--   with check (true);

-- Kommentar: Skrive-operationer skal ske via service role key i cron jobs,
-- ikke direkte fra klienten. Derfor er insert/update policies kommenteret ud.

