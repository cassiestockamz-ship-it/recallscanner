# RecallScanner -- CLAUDE.md

## What This Is
Free vehicle recall lookup tool powered by official NHTSA data. Users search by VIN or browse recalls by make/model. All recall data is pre-fetched by a VPS pipeline into Supabase -- zero NHTSA API calls at render time for brand/model pages; VIN lookups hit NHTSA directly.

## Live URL
https://recallscanner.com (canonical: www.recallscanner.com)

## Stack
- Next.js 16.2.1 (App Router, TypeScript)
- React 19.2.4
- Tailwind CSS 4
- Supabase (REST API, no SDK on frontend -- SDK used in pipeline only)
- NHTSA public API (VIN decode + VIN recall lookup)
- Geist font (via next/font)

## Key Features
- VIN recall checker (real-time NHTSA API lookup)
- VIN decoder (make, model, year, engine, drivetrain details)
- Browse recalls by brand (32 popular makes)
- Browse recalls by make/model (dynamic routes, Supabase-backed)
- Most-recalled vehicles page
- Complaints data per model (crash, fire, injuries, deaths)
- Email capture for recall alerts (per-vehicle or general)
- Ad slot placeholders (not yet active)
- FAQ with structured data (FAQPage, WebApplication, WebSite, SearchAction)
- Dynamic sitemap (static pages + brand pages + all model pages from Supabase)
- Project Dash analytics tracking (inline script in layout.tsx)
- FlexOffers verification meta tag

## Architecture

### Pages
- `/` -- Hero with VIN checker, browse by brand, stats, FAQ
- `/vin` -- Standalone VIN lookup page
- `/vin/[vin]` -- VIN results page (decode + recalls)
- `/recalls` -- All brands listing
- `/recalls/[make]` -- Brand page with model grid + recent recalls
- `/recalls/[make]/[model]` -- Model page with all recalls + complaints + reliability scorecard
- `/most-recalled` -- Recent recalls across all makes
- `/trends` -- Data visualizations: recalls by year, brand, component, most-recalled models
- `/blog` -- Monthly recall report index
- `/blog/[slug]` -- Individual monthly report (auto-generated from DB data)
- `/about` -- About page
- `/privacy` -- Privacy policy

### API Endpoints
- `POST /api/subscribe` -- Email capture, stores to `recall_subscribers` table in Supabase

### Data Layer (`src/lib/`)
- `nhtsa.ts` -- NHTSA API functions (VIN decode, VIN recalls, make/model recalls), types, slug helpers, POPULAR_MAKES list
- `nhtsa.ts` also has `formatDate()` utility for DD/MM/YYYY -> "Oct 31, 2024" conversion
- `db.ts` -- Supabase REST queries for pre-fetched data (models, recalls, complaints, trends, reliability, blog). 1hr ISR revalidation. Maps DB rows to NHTSA-style interfaces. Uses `allRows=true` param for aggregate queries (bypasses 1000-row default).

### Components (`src/components/`)
- `VinChecker.tsx` -- VIN input form (client component)
- `RecallList.tsx` -- Recall results display
- `SearchFilter.tsx` -- Search/filter for recall lists
- `EmailCapture.tsx` -- Email subscribe form (client component, calls /api/subscribe)
- `AdSlot.tsx` -- Placeholder ad slots (inactive)
- `Header.tsx` -- Site header/nav
- `Footer.tsx` -- Site footer

### Pipeline (`pipeline/`)
- `fetch-nhtsa.js` -- Fetches all recall/complaint/model data from NHTSA API, stores in Supabase. Runs daily on VPS via PM2 cron.
- `ecosystem.config.cjs` -- PM2 configuration for the pipeline
- Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- VPS path: loads from `/opt/shared/.env`

## Supabase
- Project: yoypsojuedwyzymbsubu (shared, us-east-1)
- Tracking site_id (Project Dash): `dea4c76d-7ba5-43a4-ab7e-16975ccc876f`
- Subscribe site_id: `recallscanner` (string, used in recall_subscribers table)
- Tables used:
  - `nhtsa_recalls` -- All recalls by make/model (pre-fetched by pipeline)
  - `nhtsa_complaints` -- All complaints by make/model (pre-fetched by pipeline)
  - `nhtsa_models` -- Model index with slugs (pre-fetched by pipeline)
  - `recall_subscribers` -- Email signups (site_id, email, vehicle, subscribed_at)
  - `job_runs` -- Pipeline execution logging

## Email Capture
- Component: `EmailCapture.tsx` (client-side form)
- Endpoint: `POST /api/subscribe` with `{ email, vehicle }` body
- Stores to `recall_subscribers` table with `site_id: "recallscanner"`
- Handles duplicate emails gracefully (treats as success)
- Falls back to console logging if Supabase env vars not set

## Deployment
- Vercel (hobby plan)
- Deploy command: `source ~/.claude/tokens.env && "C:/Users/Amazon IRL/AppData/Roaming/npm/vercel.cmd" --prod --token $VERCEL_TOKEN --scope taylors-projects-6d8e0bd8 --yes`
- GitHub: cassiestockamz-ship-it/recallscanner (private)
- ISR: 1hr revalidation for Supabase queries, 24hr for NHTSA VIN lookups

## Cloudflare
- Zone: 877618c3c8ba8ad9b6b42cdfdf1cb130
- Email: hello@recallscanner.com -> cassiestockamz@gmail.com (routing)

## Monetization
- Google AdSense: ca-pub-7557739369186741 (script in layout.tsx `<head>`, added 2026-03-29, pending review)
- FlexOffers: verification tag present (`fo-verify` meta in layout.tsx), awaiting approval
- CJ Affiliate: applied, awaiting approval
- No Amazon affiliate tag currently
- Ad slot placeholders: `AdSlot.tsx` with 4 positions (between-results, sidebar, after-tool, after-results)

## Monthly Blog Reports (Fully Automated)
- Blog posts are 100% auto-generated from DB data -- zero code changes needed
- Blog index (`/blog`) auto-discovers all months with recall data via `getDistinctRecallMonths()`
- Blog posts (`/blog/[slug]`) parse slug format `[month]-[year]-vehicle-recalls` and query DB
- New months appear automatically as the daily pipeline ingests new recall data
- Sitemap also auto-includes all blog post URLs
- Each post shows: recall count, brands affected, critical recalls, component breakdown, brand-by-brand details

## Reliability Scores
- Shown on model pages (`/recalls/[make]/[model]`) as a scorecard above the VIN checker
- Score: 1-10 scale based on recall count, complaint volume, crash/fire/death reports
- Data: computed from `getModelReliability()` in db.ts

## VPS Pipeline
- Runs on DO VPS (198.199.91.55) via PM2 cron
- Daily fetch of all 32 brands x 10 years of models, recalls, and complaints
- Stores everything in Supabase so the site never hits NHTSA at render time (except VIN lookups)
- Telegram notifications on pipeline runs
- Config: `pipeline/ecosystem.config.cjs`

## What to Read on Session Start
- This CLAUDE.md
- Memory: `government-data-apis-research.md`, `automotive-affiliate-research-2026.md`
- `src/lib/db.ts` (data layer) and `src/lib/nhtsa.ts` (types + VIN functions)
