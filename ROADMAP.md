# RecallScanner Roadmap

The running list of improvements identified during the 2026-04-14/15
verdict-layer revamp, organized by impact-per-hour. Kept in-repo so
it survives session context turnover.

Updated: 2026-04-15

---

## 🎯 Free wins (under 30 min each, genuine impact)

Status: **all six shipped in the 2026-04-15 polish pass** unless marked otherwise.

1. **Dynamic Open Graph images** — per-route cards via `next/og`. Every share of a VIN/brand/model/guide page becomes a billboard showing severity, RecallScore, campaign counts. Huge social ROI.
   - ✅ Shipped 2026-04-15 — per-segment `opengraph-image.tsx` on brand / model / guide routes.

2. **Breadcrumb schema on the rest of the site** — `/trends`, `/most-recalled`, `/blog`, `/blog/[slug]`, `/about`, `/methodology`, `/terms`, `/disclaimer`, `/contact`, `/privacy`, `/vin`, `/recalls`. Google shows breadcrumb trails in SERP.
   - ✅ Shipped 2026-04-15

3. **Custom 404 page** — branded, with "check a VIN / browse brands / read guides" recovery CTAs. Turns dead ends into sessions.
   - ✅ Shipped 2026-04-15

4. **Mobile hamburger menu** — the current Header hides `/most-recalled`, `/trends`, `/guides`, `/blog` on mobile via `hidden sm:inline`. A real drawer restores them.
   - ✅ Shipped 2026-04-15

5. **`content-visibility: auto` on grid lists** — homepage brand grid, `/recalls` index grid, `/recalls/[make]` model grid, related-models cross-links. One class, meaningful paint-time savings.
   - ✅ Shipped 2026-04-15

6. **Branded loading skeleton on `/vin/[vin]`** — wrap SafetyVerdict in a `<Suspense>` with a skeleton dial + skeleton card so the NHTSA call feels like the page is thinking for you, not broken.
   - ✅ Shipped 2026-04-15

---

## ⚡ Medium moves (1–3 hours each)

7. **Command palette (⌘K)** — scoped during the "seven upgrades" pass but skipped. Uses `cmdk` for fuzzy search across every brand, model, recall category, and guide. Doubles as an internal search tool we don't currently have. ~1.5h.

8. **Share-the-verdict button on `/vin/[vin]`** — one-tap copy link, optional QR code for the verdict, optional "text it to me" form. Used-car buyers in parking lots actually use this. ~30 min.

9. **Rebuild `/blog` + `/blog/[slug]` with `RecallCard` + `GuideShell`** — the monthly reports still use the old generic recall list. The GuideShell chrome from `/guides` is already reusable. ~1.5h.

10. **Brand-level RecallScore dial** — currently only model pages have the dial. Brand pages should aggregate: "Ford has an average RecallScore of 48 across 106 models, with 2 critical active campaigns." Perceived-authority signal. ~1h.

11. **Complaint data aggregated on brand pages** — complaints only show on model pages today. Brand pages should display "47,000 owner complaints indexed, 142 crashes, 3 fatalities" as a trust signal nobody else gives you in one view. ~45 min.

12. **Dark mode** — the palette is already OKLCH-ready for flipping. Ship the toggle + CSS variable swap. Reviewers notice. ~1h.

---

## 🏗️ Bigger swings (half-day to full-day each)

13. **Watchtower (SMS + email alerts by VIN)** — the single biggest user-value differentiator. Turns a lookup tool into an ongoing service. Twilio + a Supabase `watchtower_vins` table + a cron job comparing today's recall set against subscribed VINs. ~1 day.

14. **Used-car buying mode** — paste a Marketplace URL or seller's VIN, get a verdict + a printable "5 questions to ask the seller" checklist. Different user (pre-purchase), same data, new product. ~1 day.

15. **"Recall Index" original-research page** — use the severity engine on the full dataset to compute "the 10 brands with the most Do-Not-Drive notices this year." Publish as a linkable report with charts and a downloadable CSV. Journalists cite pieces like this. Front-of-Reddit / backlink bait. ~1 day.

16. **Reddit / forum distribution loop** — cron that watches for new critical-tier recalls and auto-posts a brief summary to relevant subreddits (`/r/cars`, `/r/MechanicAdvice`) linking back to our verdict card. Full compliance with self-promotion rules. ~half day.

17. **More long-form guides** — 6-8 additional `/guides/*` pages:
    - `/guides/takata-airbag-recall-explained`
    - `/guides/buying-a-used-car-recall-checklist`
    - `/guides/do-not-drive-explained`
    - `/guides/what-nhtsa-complaints-mean`
    - `/guides/engine-fire-recalls-what-to-know`
    - `/guides/airbag-recalls-by-model-year`
    - `/guides/how-to-file-a-nhtsa-complaint`
    - Each ~2h, cumulative topical-authority payoff.

---

## 🔍 "Should check when you get a chance"

- **Lighthouse audit** — pretty sure we're green but haven't measured. ~15 min run.
- **Keyboard nav + screen reader sweep** — aria-labels are in place but a real tab-through on the VIN decoder + SafetyVerdict would catch anything missed. ~30 min.
- **CSP headers** — basic security posture. `Content-Security-Policy` via middleware. ~20 min.
- **PWA manifest** — `icon.svg` exists but `manifest.json` for installability isn't set up. ~15 min, lets users pin the site to their phone home screen.
- **Bundle analysis** — run `@next/bundle-analyzer` once and see if anything is hogging KB. ~10 min.
- **AI tell sweep of `/blog/[slug]` content** — the rendered blog posts are data-driven but the template strings haven't been swept. ~15 min.
- **Dataset `downloadUrl`** — the `/trends` Dataset schema references `contentUrl` pointing at the trends page itself, not an actual CSV download. Adding a real CSV export unlocks Google Dataset Search inclusion. ~1h.

---

## Shipped (so we don't lose track)

### 2026-04-13
- Initial AdSense Low-Value-Content recovery: editorial layer, trust pages, noindex thresholds
- Amazon affiliate card removed from programmatic pages per playbook

### 2026-04-14
- Full verdict-layer revamp: severity engine, VIN decoder strip, SafetyVerdict card, RecallBuckets, ModelSeverityHeader, tool-first layouts across brand/model/VIN pages
- Fixed two pre-existing NHTSA API bugs (wrong host for `decodeVin`, 400-as-success on `recallsByVehicle`)
- Calm Emergency design system + Lucide iconography
- Zero AI tells in user-visible prose (swept against `~/.claude/fiction-patterns/banned_patterns.md`)
- Added `/guides` hub + 4 long-form evergreen guides (`how-recalls-work`, `your-rights`, `vs-nhtsa`, `what-to-do`)
- Removed homepage editorial accordions, replaced with 2×2 `GuideCard` grid
- Homepage FAQ duplicate removed
- Schema stack expanded: `WebApplication`, `FAQPage` + `Speakable`, `Article`, `BreadcrumbList`, `HowTo`, `Dataset`, `Organization`, `WebSite` with `SearchAction`
- Seven polish upgrades: odometer count-up, View Transitions API, sticky micro-VIN bar, HowTo schema, Dataset schema, Speakable schema, Breadcrumb schema on brand/model/VIN pages
- `/demo/critical` noindex route for previewing the `ACTION NEEDED` state
- Batch AI plain-English hook translation via Claude Haiku 4.5: 2,895 recalls backfilled for $3.62, cached in `nhtsa_recalls.plain_english_hook`
- `translateNewRecalls()` integration into the nightly VPS pipeline

### 2026-04-15
- VPS fully configured: `ANTHROPIC_API_KEY` verified in `/opt/shared/.env`, git pulled to `16400d3`, Claude API smoke-tested from the VPS, PM2 cron confirmed at `0 3 * * *` UTC
- First overnight pipeline run completed: picked up one new recall and translated it automatically (2,895 → 2,896, 0 untranslated)
- Roadmap document created (this file)
- All six free wins shipped in a single polish pass

---

## Guiding philosophy (for future sessions)

Three rules from the original revamp that still apply:

1. **Tool-first layouts.** If there's a calculator / lookup / interactive element on the page, the user can see and use it within 500px of the top of the viewport on mobile. Editorial context goes below or in a `<details>` collapse.

2. **Prose discipline is non-negotiable.** Every user-visible string gets swept against `~/.claude/fiction-patterns/banned_patterns.md`. Zero em dashes, zero banned words. Code comments are exempt (not rendered).

3. **Schema stack as a ranking moat.** Every new page type should emit at least one schema.org entity. Calculator = `WebApplication`. Guide = `Article`. Aggregated data = `Dataset`. Steps = `HowTo`. Q&A = `FAQPage` + `Speakable`. Navigation = `BreadcrumbList`. These compound every month we wait for domain age to catch up.
