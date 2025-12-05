# Solspot (arbejdstitel)

En Next.js 14 App Router-applikation, der kobler data fra **Google Maps Places** og **DMI's vejr-API** for at vise, hvilke caféer og restauranter der er åbne i solen lige nu – og hvordan solen rammer senere på dagen. Projektet er designet til at kunne deles med venner via en Vercel-deploy, men skal være let at arbejde på i Cursor.

---

## Hovedfunktioner
- Kortvisning af caféer/restauranter via Google Maps Places (`Nearby Search` + `Place Details`).
- Live-vurdering af sol/sky-status for hvert sted med DMI observationsdata (nu) og prognoser (senere).
- Åbningstider direkte fra Places API samt lokale overrides fra Supabase.
- Filtre for “åben nu”, “sol nu”, “sol senere”, “har udendørs seating”.
- Favoritliste lokalt (ingen login) + mulighed for at gemme kuraterede steder via Supabase dashboard.

## Tech stack & services
- **Next.js 14** (App Router, React Server Components, TypeScript).
- **Tailwind CSS** til styling + `@tailwindcss/forms/typography`.
- **Supabase** (Postgres + RLS off, ingen auth) til egne metadata, cached åbningstider eller manuelle tags.
- **Google Maps JavaScript API** + **Places API** til kort og POI-data.
- **DMI Vejr-API** til sol/sky-data og solhøjde.
- **Vercel** til hosting og edge runtime.

---

## Arkitektur & dataflow
1. **Client (MapView)** henter brugerens geolokation (med samtykke) og kalder en serveraction (`getNearbyVenues`) i `src/app/api`.
2. **Serveraction** laver to kald:
   - Google Places `Nearby Search` (liste) + `Place Details` (åbningstider, geometri, fotos).
   - Supabase for ekstra metadata (`venues` tabel med flags som `has_outdoor_seating`, noter osv.).
3. Resultatet enriches med **DMI**:
   - Observation endpoint (`/metObs/v2/observation`) for nuværende sky-dække.
   - Forecast endpoint (`/metFc/dmi-lightning` eller relevant sol/sky endpoint) for de næste timer. Brug solhøjde til at beregne “sol senere”.
4. Data sendes tilbage til klienten, som renderer kortet (Google Maps JS SDK) + en liste/overblik.
5. Ingen auth: alle brugere deler samme læse-data. Eventuelle skrive-operationer til Supabase sker via service role i cron jobs (ikke brugere).

---

## Mapper og konventioner
| Mappe/fil            | Beskrivelse |
|----------------------|-------------|
| `src/app`            | App Router pages, layouts og server actions (`api/venues/route.ts`). |
| `src/components`     | Reusable UI: `MapCanvas`, `VenueCard`, `SunBadge`, `FilterBar`. |
| `src/lib/dmi`        | Klient + helper til at kalde DMI endpoints og beregne solstatus. |
| `src/lib/google`     | Helpers til Places/Maps (fetcher, type guards, rate-limit handling). |
| `src/lib/supabase`   | Supabase client + queries. |
| `src/types`          | Zod/TypeScript typer for venues, forecasts osv. |
| `public`             | Ikoner, fallback-billeder. |

Cursor kan nemt følge disse mapper, og README'en beskriver, hvor ny funktionalitet skal placeres.

---

## Forudsætninger
- Node.js 20+ og npm 9+ (eller pnpm/bun, men eksempler her bruger npm).
- Google Cloud-projekt med **Maps JavaScript API** og **Places API** aktiveret.
- DMI API-nøgle (https://confluence.govcloud.dk/pages/viewpage.action?pageId=32115017).
- Supabase-projekt (gratis tier er nok).
- Vercel-konto til deployment.

---

## Hurtig start (lokalt)

### Automatisk setup (anbefalet)
```bash
./install-and-run.sh
```

Dette script:
- Installerer alle dependencies
- Opretter `.env.local` fra template
- Starter udviklingsserveren

### Manuelt setup
1. **Klon repo og installer**  
   ```bash
   git clone <repo-url>
   cd next-boilerplate
   npm install
   ```
2. **Opret `.env.local`** baseret på `.env.local.example` eller tabellen nedenfor.
3. **Opsæt Supabase** - Kør `scripts/supabase-setup.sql` i Supabase Dashboard
4. **Start udviklingsserver**  
   ```bash
   npm run dev
   ```  
   Besøg `http://localhost:3000`. Cursor kan køre samme kommando via "Run" panelet.
5. **Valider Google Maps** ved at sikre, at kortet loader, og at `window.google` findes i devtools.

> 📖 Se `SETUP.md` for detaljeret step-by-step guide med alle API keys setup.

---

## Miljøvariabler
Gem disse i `.env.local` (Cursor læser den automatisk). `NEXT_PUBLIC_` variabler må bruges i client components.

| Navn | Påkrævet | Beskrivelse |
|------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | Key til Maps JavaScript SDK (browser). |
| `GOOGLE_MAPS_PLACES_API_KEY` | ✅ | Server-side Places key (kan være samme som ovenfor, men brug helst IP-restricted key). |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key til client-side reads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Bruges kun til baggrundsscripts/cron (må ikke til klienten). |
| `DMI_API_KEY` | ✅ | Nøgle til DMI endpoints. |
| `DMI_API_BASE_URL` | Optional | Default `https://dmigw.govcloud.dk` – konfigurerbar til mocking. |
| `NEXT_PUBLIC_DEFAULT_LOCATION` | Optional | `lat,lng` fallback hvis brugeren ikke deler lokation. |

> Tip: Tilføj `env.local` til `.gitignore` (allerede tilfældet i Next templates).

---

## Supabase data-model (forslag)
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
```
- Brug `external_place_id` til at matche Google Places `place_id`.
- Tilføj evt. `sun_score` kolonne hvis du vil cache resultater fra DMI periodisk (cron job via Supabase edge function).

### Seeding
- Du kan importere CSV over favoritsteder eller bruge Supabase Dashboard → Table Editor.
- Cursor tip: opret scripts i `scripts/seed.ts` der bruger Supabase service role via `dotenv`.

---

## DMI-integration
- **Observationer (nu)**: Brug endpointet `https://dmigw.govcloud.dk/metObs/v2/observation` filtreret på `parameterId=cloud_cover` og nærmeste DMI-station. Kombinér med solhøjde beregnet via `suncalc` (npm) for at afgøre om solen rammer terrassen.
- **Prognoser (senere)**: `metFc/dmiWeather` eller tilsvarende – vælg det, der returnerer `cloudCover` + `validFrom/To`. Gem 3-4 kommende timeblokke til UI’et.
- Rate limiting: cache resultater i memory/server cache (Next Route Handler kan bruge `cache: 'no-store'` og evt. `@upstash/redis` hvis nødvendigt).

---

## Google Maps & Places integration
1. **Enable APIs** i Google Cloud Console og opret to keys:
   - Browser key (restriktion: HTTP referrers).
   - Server key (restriktion: IP eller `None` + bedre monitoring).
2. **Loader script** i `src/app/layout.tsx` med `@googlemaps/js-api-loader`.
3. **Serveraction** i `src/app/api/venues/route.ts`:
   ```ts
   import { getNearbyPlaces } from "@/lib/google/places";
   import { getCurrentSky } from "@/lib/dmi";
   import { enrichWithSupabase } from "@/lib/supabase";
   ```
4. **Åbningstider**: brug `result.current_opening_hours` og `result.opening_hours.weekday_text` fra Places. Kombinér med `utc_offset_minutes`.
5. **Priser**: Google giver $200 gratis pr. måned (~6000 Place Details). Monitorér forbruget i Cloud Console.

---

## Deployment (Vercel)
1. Push koden til GitHub.
2. Opret nyt projekt på Vercel og vælg repo.
3. Tilføj alle miljøvariabler under Settings → Environment Variables (Production + Preview).
4. Aktiver Vercel Geo/Edge kun hvis nødvendigt. Standard Node runtime er fint.
5. Del produktion-URL med venner (fx `https://solspot.vercel.app`). Ingen auth betyder, at alle ser samme data.

> Husk at tilføje Google Maps-domæner (`*.vercel.app`, dit custom domæne) som autoriserede referrers.

---

## Arbejdsgang i Cursor
- Formuler tasks direkte i README (“Tilføj solprognose overlay”) så Cursor kan bruge det som prompt.
- Brug `cmd+k` → `@terminal npm run dev` for at holde dev-server kørende mens du prompt-engineerer.
- Når du genererer nye filer, nævn placering i prompten (fx “create `src/lib/dmi/getForecast.ts`”).
- Brug Tests panelet til at køre `npm run lint` eller `npm run test` (hvis du tilføjer Vitest/Jest senere).

---

## Backlog / næste skridt
1. Implementér Google Maps loader + basiskort.
2. Skriv `getNearbyVenues` serveraction der kombinerer Places, Supabase og DMI.
3. Design UI (kort + liste + filterchip) i Tailwind.
4. Tilføj caching/memoization for API-kald.
5. Opsæt cron job (fx GitHub Action) til at gemme populære steder i Supabase.

Med denne README burde både du og Cursor have en klar retning for at bygge appen og gøre den klar til deling. God fornøjelse i solen! 🌞
