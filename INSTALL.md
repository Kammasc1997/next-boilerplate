# Installation Guide

## ⚠️ Node.js/npm ikke fundet i shell

Jeg kan ikke installere dependencies automatisk fordi Node.js/npm ikke er tilgængelig i shell'en.

## Løsning: Installer manuelt

### Step 1: Installer Node.js

**macOS (anbefalet - Homebrew):**
```bash
brew install node
```

**Eller download direkte:**
1. Gå til [nodejs.org](https://nodejs.org/)
2. Download LTS version (20.x eller højere)
3. Installer .pkg filen
4. Genstart terminalen

**Verificer installation:**
```bash
node --version  # Skal vise v20.x.x eller højere
npm --version   # Skal vise v9.x.x eller højere
```

### Step 2: Installer Dependencies

Når Node.js er installeret, kør:

```bash
cd /Users/kamma.s/Documents/GitHub/next-boilerplate
npm install
```

Dette installerer:
- @googlemaps/js-api-loader@^1.16.6
- @supabase/supabase-js@^2.45.4
- zod@^3.24.1
- suncalc@^1.9.0
- @types/suncalc@^1.9.2

### Step 3: Opret Environment Fil

```bash
cp .env.local.example .env.local
```

Rediger `.env.local` og tilføj dine API keys.

### Step 4: Start Serveren

```bash
npm run dev
```

## Alternativ: Brug install-and-run.sh

Når Node.js er installeret:

```bash
./install-and-run.sh
```

Dette script håndterer alt automatisk.

## Hjælp

Hvis du har problemer:
1. Verificer Node.js installation: `node --version`
2. Tjek at du er i rigtig mappe: `pwd`
3. Se `SETUP.md` for detaljerede instruktioner

