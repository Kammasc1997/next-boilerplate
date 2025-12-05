# Komplet Setup Guide

## Forudsætninger

Før du starter, skal du have installeret:
- **Node.js 20+** (download fra [nodejs.org](https://nodejs.org/))
- **npm 9+** (kommer med Node.js)

Verificer installation:
```bash
node --version  # Skal vise v20 eller højere
npm --version   # Skal vise v9 eller højere
```

## Step 1: Installer Dependencies

Kør denne kommando i projektets root mappe:

```bash
npm install
```

Dette installerer:
- `@googlemaps/js-api-loader` - Google Maps SDK loader
- `@supabase/supabase-js` - Supabase client
- `zod` - Runtime validation
- `suncalc` - Solhøjde beregninger
- `@types/suncalc` - TypeScript types

## Step 2: Opret Environment Variabler

### 2a. Kopier template filen

```bash
cp .env.local.example .env.local
```

### 2b. Rediger `.env.local` og tilføj dine API keys

Åbn `.env.local` i din editor og udfyld følgende:

```bash
# Google Maps API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=din_google_maps_key_her
GOOGLE_MAPS_PLACES_API_KEY=din_google_places_key_her

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dit-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key_her

# DMI API Configuration
DMI_API_KEY=din_dmi_api_key_her
DMI_API_BASE_URL=https://dmigw.govcloud.dk

# Optional: Default location (København)
NEXT_PUBLIC_DEFAULT_LOCATION=55.6761,12.5683
```

## Step 3: Opsæt Supabase Database

### 3a. Opret Supabase projekt

1. Gå til [supabase.com](https://supabase.com)
2. Opret gratis konto
3. Opret nyt projekt
4. Vent til projektet er klar (ca. 2 minutter)

### 3b. Kør database setup SQL

1. Gå til Supabase Dashboard → SQL Editor
2. Åbn filen `scripts/supabase-setup.sql`
3. Kopier hele indholdet
4. Indsæt i SQL Editor
5. Klik "Run"

Dette opretter:
- `venues` tabellen
- Indexes for performance
- RLS policies for public read access

### 3c. Hent API credentials

1. Gå til Settings → API
2. Kopiér "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Kopiér "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Tilføj til `.env.local`

## Step 4: Opret Google Maps API Keys

### 4a. Opret Google Cloud projekt

1. Gå til [Google Cloud Console](https://console.cloud.google.com/)
2. Opret nyt projekt eller vælg eksisterende
3. Aktiver følgende APIs:
   - Maps JavaScript API
   - Places API

### 4b. Opret API keys

1. Gå til "Credentials" → "Create Credentials" → "API Key"
2. Opret to keys (eller brug samme til begge):
   - **Browser key** (til Maps JavaScript SDK)
     - Restrictions: HTTP referrers
     - Tilføj: `http://localhost:3000/*` og dit domæne
   - **Server key** (til Places API)
     - Restrictions: IP addresses (eller None for testing)
     - Tilføj din server IP hvis relevant

3. Kopiér keys til `.env.local`:
   - Browser key → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Server key → `GOOGLE_MAPS_PLACES_API_KEY`

## Step 5: Få DMI API Key

1. Gå til [DMI dokumentation](https://confluence.govcloud.dk/pages/viewpage.action?pageId=32115017)
2. Følg instruktioner for at få API key
3. Tilføj key til `.env.local` som `DMI_API_KEY`

## Step 6: Start Udviklingsserveren

```bash
npm run dev
```

Serveren starter på `http://localhost:3000`

Åbn browseren og besøg URL'en.

## Verificer Setup

### Tjek at alt virker:

1. **Kortet loader:**
   - Hvis kortet vises = Google Maps API virker ✅
   - Hvis fejl = Tjek `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

2. **Venues vises:**
   - Hvis steder vises = Google Places API virker ✅
   - Hvis ingen steder = Tjek `GOOGLE_MAPS_PLACES_API_KEY`

3. **Vejrdata:**
   - Hvis sol-badges vises = DMI API virker ✅
   - Hvis ingen vejrdata = Tjek `DMI_API_KEY`

4. **Supabase metadata:**
   - Hvis "Udenfor" badges vises = Supabase virker ✅
   - Hvis ingen metadata = Tjek Supabase credentials

## Fejlfinding

### "npm: command not found"
- Installer Node.js fra [nodejs.org](https://nodejs.org/)
- Genstart terminal efter installation

### "Google Maps API key not configured"
- Tjek at `.env.local` eksisterer
- Verificer at key er korrekt kopieret
- Genstart dev serveren efter ændringer

### "Failed to fetch venues"
- Tjek browser console for fejl
- Verificer at Google Places API er aktiveret
- Tjek at API key har korrekt restrictions

### "Supabase error"
- Verificer at `venues` tabellen eksisterer
- Tjek at RLS policies er sat korrekt
- Verificer API credentials i `.env.local`

### "DMI API error"
- Verificer at API key er korrekt
- Tjek DMI API dokumentation for endpoint changes
- Se browser console for specifikke fejl

## Næste Skridt

Når alt virker:
1. Tilføj favoritsteder i Supabase `venues` tabellen
2. Test alle filtre (åben nu, sol nu, etc.)
3. Deploy til Vercel (se README.md)

## Hjælp

Hvis du støder på problemer:
1. Tjek browser console for fejl
2. Tjek terminal output
3. Verificer alle environment variabler
4. Se QUICKSTART.md for hurtig reference

