# Quick Start Guide

## Hurtig opsætning

### Automatisk setup (anbefalet)
Kør setup scriptet der håndterer det meste automatisk:

```bash
npm run setup
```

Eller manuelt:

### 1. Installer dependencies
```bash
npm install
```

### 2. Opret `.env.local` fil
Kopier `.env.local.example` og udfyld med dine API keys:

```bash
cp .env.local.example .env.local
```

Rediger `.env.local` og tilføj dine faktiske API keys.

### 3. Opsæt Supabase database
Kør SQL fra `scripts/supabase-setup.sql` i Supabase Dashboard → SQL Editor, eller brug denne SQL:

Se `scripts/supabase-setup.sql` for komplet SQL setup script.

Eller kør denne SQL direkte:

```sql
create table public.venues (
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

-- Slå RLS på og opret policy for public read access
alter table public.venues enable row level security;
create policy "Allow public read access" on public.venues for select using (true);
```

**Vigtigt:** SQL scriptet i `scripts/supabase-setup.sql` håndterer RLS korrekt.

### 4. Start udviklingsserveren
```bash
npm run dev
```

Besøg `http://localhost:3000` i din browser.

## Hvordan man får API keys

### Google Maps API
1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opret/ vælg projekt
3. Aktiver "Maps JavaScript API" og "Places API"
4. Opret API key under "Credentials"
5. Tilføj key til `.env.local`

### Supabase
1. Gå til [supabase.com](https://supabase.com)
2. Opret gratis konto og projekt
3. Gå til Settings → API
4. Kopiér "Project URL" og "anon public" key
5. Tilføj til `.env.local`

### DMI API
1. Få API key fra [DMI dokumentation](https://confluence.govcloud.dk/pages/viewpage.action?pageId=32115017)
2. Tilføj key til `.env.local`

## Test uden API keys

Du kan starte serveren og se UI'en, selv uden API keys. Kortet vil vise fejl, men resten af appen fungerer.

## Fejlfinding

- **Kortet loader ikke:** Tjek at `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` er sat korrekt
- **Ingen venues vises:** Tjek browser console for API fejl
- **Supabase fejl:** Verificer at `venues` tabellen eksisterer og RLS er slået fra

## Næste skridt

Når alt virker:
1. Tilføj favoritsteder i Supabase `venues` tabellen
2. Test filtrene (åben nu, sol nu, etc.)
3. Deploy til Vercel (se README.md)

