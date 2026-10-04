/**
 * Supabase data layer for NHTSA data.
 * Uses REST API directly (no SDK dependency).
 * All data is pre-fetched by the VPS pipeline — zero NHTSA calls at render time.
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const PAGE_SIZE = 1000; // PostgREST caps a response at 1000 rows

async function fetchRows<T>(url: string, range?: string): Promise<T[] | null> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
  if (range) headers.Range = range;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 }, // 1hr ISR — pipeline refreshes daily
  });
  if (!res.ok) {
    console.error(`Supabase query failed: ${res.status} ${await res.text()}`);
    return null;
  }
  return res.json();
}

/**
 * Query a table. Without an explicit limit/offset it pages through every row
 * (1000 per request, stable order with id as tie-break) so counts are never
 * silently capped. The allRows flag is kept for call-site readability.
 */
async function query<T>(table: string, params: string, _allRows = false): Promise<T[]> {
  const base = `${SUPABASE_URL}/rest/v1/${table}`;
  if (params.includes("limit=") || params.includes("offset=")) {
    return (await fetchRows<T>(`${base}?${params}`)) ?? [];
  }
  const orderMatch = params.match(/(^|&)order=([^&]*)/);
  const stable = orderMatch
    ? params.replace(orderMatch[0], `${orderMatch[1]}order=${orderMatch[2]},id.asc`)
    : `${params}${params ? "&" : ""}order=id.asc`;
  const out: T[] = [];
  for (let from = 0; from < 200000; from += PAGE_SIZE) {
    const page = await fetchRows<T>(`${base}?${stable}`, `${from}-${from + PAGE_SIZE - 1}`);
    if (page === null) return from === 0 ? [] : out;
    out.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return out;
}

// ── Types ───────────────────────────────────────────────────

export interface DbModel {
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  latest_year: number;
}

export interface DbRecall {
  campaign_number: string;
  manufacturer: string | null;
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  model_year: string;
  component: string | null;
  summary: string | null;
  consequence: string | null;
  remedy: string | null;
  report_date: string | null;
  notes: string | null;
  plain_english_hook: string | null;
}

export interface DbComplaint {
  odi_number: string;
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  model_year: string;
  date_incident: string | null;
  date_filed: string | null;
  components: string | null;
  summary: string | null;
  crash: boolean;
  fire: boolean;
  injuries: number;
  deaths: number;
}

// ── Mappers (DB snake_case -> existing component interfaces) ─

import type { Recall, Complaint } from "./nhtsa";

function toRecall(r: DbRecall): Recall {
  return {
    NHTSACampaignNumber: r.campaign_number,
    Manufacturer: r.manufacturer ?? "",
    Make: r.make,
    Model: r.model,
    ModelYear: r.model_year,
    Component: r.component ?? "",
    Summary: r.summary ?? "",
    Consequence: r.consequence ?? "",
    Remedy: r.remedy ?? "",
    ReportReceivedDate: r.report_date ?? "",
    Notes: r.notes ?? "",
    PlainEnglishHook: r.plain_english_hook ?? undefined,
  };
}

function toComplaint(c: DbComplaint): Complaint {
  return {
    odiNumber: c.odi_number,
    make: c.make,
    model: c.model,
    modelYear: c.model_year,
    dateOfIncident: c.date_incident ?? "",
    dateComplaintFiled: c.date_filed ?? "",
    components: c.components ?? "",
    summary: c.summary ?? "",
    crash: c.crash,
    fire: c.fire,
    numberOfInjuries: c.injuries,
    numberOfDeaths: c.deaths,
  };
}

// ── Queries ─────────────────────────────────────────────────

/** Get all models for a make (brand page model grid) */
export async function getModelsForMake(makeSlugVal: string): Promise<DbModel[]> {
  return query<DbModel>(
    "nhtsa_models",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&order=model.asc&select=make,make_slug,model,model_slug,latest_year`
  );
}

/**
 * Get only models for a make that actually have recall data. Used on the
 * brand page model grid and the related-models section so we never link to a
 * slug that would 404 at render time. vPIC returns every trim-level variant
 * (F-150 Super Crew, F-150 Super Cab, ...) but the Recall API rolls those up
 * under the base model, so ~80% of nhtsa_models rows have zero recalls and
 * zero complaints under their specific slug.
 */
export async function getModelsForMakeWithData(makeSlugVal: string): Promise<DbModel[]> {
  // The list is built from the recall and complaint rows themselves, so a
  // pipeline cleanup of nhtsa_models can never make a real model disappear.
  // nhtsa_models only supplies the display name and latest year when present.
  const cols = "select=make,make_slug,model,model_slug,model_year";
  const [models, recallRows, complaintRows] = await Promise.all([
    getModelsForMake(makeSlugVal),
    query<ModelRow>("nhtsa_recalls", `make_slug=eq.${encodeURIComponent(makeSlugVal)}&${cols}`, true),
    query<ModelRow>("nhtsa_complaints", `make_slug=eq.${encodeURIComponent(makeSlugVal)}&${cols}`, true),
  ]);
  return modelsFromRows([...recallRows, ...complaintRows], models);
}

interface ModelRow {
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  model_year: string | null;
}

/** Distinct (make, model) from data rows, preferring nhtsa_models names when it has them. */
function modelsFromRows(rows: ModelRow[], known: DbModel[]): DbModel[] {
  const names = new Map(known.map((m) => [`${m.make_slug}/${m.model_slug}`, m]));
  const out = new Map<string, DbModel>();
  for (const r of rows) {
    const key = `${r.make_slug}/${r.model_slug}`;
    const year = parseInt(r.model_year ?? "", 10) || 0;
    const have = out.get(key);
    if (have) {
      if (year > have.latest_year) have.latest_year = year;
      continue;
    }
    const k = names.get(key);
    out.set(key, {
      make: k?.make ?? r.make,
      make_slug: r.make_slug,
      model: k?.model ?? r.model,
      model_slug: r.model_slug,
      latest_year: k?.latest_year ?? year,
    });
  }
  return [...out.values()].sort(
    (x, y) => x.make.localeCompare(y.make) || x.model.localeCompare(y.model)
  );
}

/**
 * Resolve an orphan model slug (one that has no recalls or complaints) to the
 * closest canonical slug that does. Handles two common pipeline mismatches:
 *   1. Dash normalization: nhtsa_models stores "rx-350", nhtsa_recalls stores "rx350"
 *   2. Trim rollup: nhtsa_models stores "f-150-super-crew", recalls roll up under "f-150"
 * Returns null if no reasonable canonical slug exists.
 */
export async function resolveModelSlug(
  makeSlugVal: string,
  modelSlugVal: string
): Promise<string | null> {
  const [recallSlugs, complaintSlugs] = await Promise.all([
    query<{ model_slug: string }>(
      "nhtsa_recalls",
      `make_slug=eq.${encodeURIComponent(makeSlugVal)}&select=model_slug`,
      true
    ),
    query<{ model_slug: string }>(
      "nhtsa_complaints",
      `make_slug=eq.${encodeURIComponent(makeSlugVal)}&select=model_slug`,
      true
    ),
  ]);
  const canonical = new Set<string>();
  for (const r of recallSlugs) canonical.add(r.model_slug);
  for (const c of complaintSlugs) canonical.add(c.model_slug);
  if (canonical.has(modelSlugVal)) return modelSlugVal;

  // Try dash-normalization: rx-350 -> rx350, es-350 -> es350, etc.
  const dashStripped = modelSlugVal.replace(/-/g, "");
  if (canonical.has(dashStripped)) return dashStripped;

  // Try collapsing letter-digit dashes only: f-150-super-crew -> f150-super-crew
  const letterDigitStripped = modelSlugVal.replace(/([a-z])-(\d)/g, "$1$2");
  if (canonical.has(letterDigitStripped)) return letterDigitStripped;

  // Try progressively shorter prefixes: f-150-super-crew -> f-150-super -> f-150 -> f
  const parts = modelSlugVal.split("-");
  for (let i = parts.length - 1; i >= 1; i--) {
    const probe = parts.slice(0, i).join("-");
    if (canonical.has(probe)) return probe;
    const probeNoDash = probe.replace(/-/g, "");
    if (canonical.has(probeNoDash)) return probeNoDash;
  }

  // Last resort: sibling trim match. Silverado 2500 has no recalls but its
  // sibling Silverado 1500 does -- redirect to the sibling with the most
  // recall data so readers land on the page closest to what they searched.
  const baseWord = parts[0];
  if (baseWord && baseWord.length >= 3) {
    const siblings = [...canonical].filter(
      (s) => s === baseWord || s.startsWith(`${baseWord}-`) || s.startsWith(`${baseWord}`)
    );
    if (siblings.length > 0) {
      const counts = new Map<string, number>();
      for (const r of recallSlugs) counts.set(r.model_slug, (counts.get(r.model_slug) || 0) + 1);
      siblings.sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
      return siblings[0];
    }
  }
  return null;
}

/** report_date is text DD/MM/YYYY, so SQL ordering is wrong. Parse to a sortable number. */
function recallTime(d: string | null): number {
  const m = (d ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
}

/** Complaint dates are text MM/DD/YYYY. */
function complaintTime(d: string | null): number {
  const m = (d ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? Number(m[3]) * 10000 + Number(m[1]) * 100 + Number(m[2]) : 0;
}

/**
 * Newest recalls first. Fetches only rows from the last N years (widening
 * until `limit` rows are found), parses the text dates in JS, sorts, slices.
 */
async function newestRecalls(filter: string, limit: number): Promise<DbRecall[]> {
  const thisYear = new Date().getFullYear();
  for (let span = 2; span <= 40; span *= 2) {
    const years = Array.from({ length: span }, (_, i) => `report_date.like.*/${thisYear - i}`).join(",");
    const rows = await query<DbRecall>(
      "nhtsa_recalls",
      `${filter}${filter ? "&" : ""}or=(${years})&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes,plain_english_hook`
    );
    if (rows.length >= limit || span >= 32) {
      return rows.sort((a, b) => recallTime(b.report_date) - recallTime(a.report_date)).slice(0, limit);
    }
  }
  return [];
}

/** Get recent recalls for a make, mapped to Recall interface */
export async function getRecentRecallsForMake(makeSlugVal: string, limit = 30): Promise<Recall[]> {
  const rows = await newestRecalls(`make_slug=eq.${encodeURIComponent(makeSlugVal)}`, limit);
  return rows.map(toRecall);
}

/** Get all recalls for a specific model, mapped to Recall interface */
export async function getRecallsForModel(makeSlugVal: string, modelSlugVal: string): Promise<Recall[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes,plain_english_hook`
  );
  return rows.sort((a, b) => recallTime(b.report_date) - recallTime(a.report_date)).map(toRecall);
}

/** Get complaints for a specific model, mapped to Complaint interface */
export async function getComplaintsForModel(makeSlugVal: string, modelSlugVal: string): Promise<Complaint[]> {
  const rows = await query<DbComplaint>(
    "nhtsa_complaints",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&order=date_filed.desc&select=odi_number,make,make_slug,model,model_slug,model_year,date_incident,date_filed,components,summary,crash,fire,injuries,deaths`
  );
  return rows.sort((a, b) => complaintTime(b.date_filed) - complaintTime(a.date_filed)).map(toComplaint);
}

/** Get recent recalls across all makes (most-recalled page) */
export async function getRecentRecallsAll(limit = 30): Promise<Recall[]> {
  const rows = await newestRecalls("", limit);
  return rows.map(toRecall);
}

// ── Trends Queries ─────────────────────────────────────────

/** Get recall counts grouped by year */
export async function getRecallsByYear(): Promise<{ year: string; count: number }[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `select=report_date&order=report_date.desc`,
    true
  );
  const yearMap = new Map<string, number>();
  for (const r of rows) {
    if (!r.report_date) continue;
    const match = r.report_date.match(/(\d{4})$/);
    if (match) yearMap.set(match[1], (yearMap.get(match[1]) || 0) + 1);
  }
  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

/** Get recall counts by brand */
export async function getRecallsByBrand(): Promise<{ make: string; makeSlug: string; count: number }[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `select=make,make_slug`,
    true
  );
  const brandMap = new Map<string, { make: string; makeSlug: string; count: number }>();
  for (const r of rows) {
    const existing = brandMap.get(r.make);
    if (existing) existing.count++;
    else brandMap.set(r.make, { make: r.make, makeSlug: r.make_slug, count: 1 });
  }
  return Array.from(brandMap.values()).sort((a, b) => b.count - a.count);
}

/** Get recall counts by component category */
export async function getRecallsByComponent(): Promise<{ category: string; count: number }[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `select=component`,
    true
  );
  const catMap = new Map<string, number>();
  for (const r of rows) {
    const c = (r.component || "").toUpperCase();
    let cat = "Other";
    if (c.includes("AIR BAG") || c.includes("AIRBAG")) cat = "Air Bags";
    else if (c.includes("BRAKE")) cat = "Brakes";
    else if (c.includes("ENGINE") || c.includes("STARTER")) cat = "Engine";
    else if (c.includes("STEERING")) cat = "Steering";
    else if (c.includes("ELECTRICAL") || c.includes("WIRING")) cat = "Electrical";
    else if (c.includes("FUEL")) cat = "Fuel System";
    else if (c.includes("TIRE") || c.includes("WHEEL")) cat = "Tires/Wheels";
    else if (c.includes("SEAT BELT") || c.includes("SEATBELT")) cat = "Seat Belts";
    else if (c.includes("SUSPENSION")) cat = "Suspension";
    else if (c.includes("TRANSMISSION") || c.includes("POWERTRAIN")) cat = "Transmission";
    else if (c.includes("LIGHT") || c.includes("LAMP")) cat = "Lighting";
    else if (c.includes("SOFTWARE") || c.includes("CAMERA") || c.includes("SENSOR")) cat = "Software/Electronics";
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  }
  return Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Reliability Queries ────────────────────────────────────

export interface ModelReliability {
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
  recallCount: number;
  complaintCount: number;
  crashes: number;
  fires: number;
  injuries: number;
  deaths: number;
}

/** Get reliability stats for a specific model */
export async function getModelReliability(makeSlugVal: string, modelSlugVal: string): Promise<ModelReliability | null> {
  const recalls = await query<DbRecall>(
    "nhtsa_recalls",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&select=campaign_number,make,make_slug,model,model_slug`
  );
  const complaints = await query<DbComplaint>(
    "nhtsa_complaints",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&select=odi_number,make,make_slug,model,model_slug,crash,fire,injuries,deaths`
  );
  if (recalls.length === 0 && complaints.length === 0) return null;
  const first = recalls[0] || complaints[0];
  return {
    make: first.make,
    makeSlug: first.make_slug,
    model: first.model,
    modelSlug: first.model_slug,
    recallCount: recalls.length,
    complaintCount: complaints.length,
    crashes: complaints.filter(c => c.crash).length,
    fires: complaints.filter(c => c.fire).length,
    injuries: complaints.reduce((s, c) => s + (c.injuries || 0), 0),
    deaths: complaints.reduce((s, c) => s + (c.deaths || 0), 0),
  };
}

/** Get top models by recall count for trends page */
export async function getMostRecalledModels(limit = 15): Promise<{ make: string; model: string; makeSlug: string; modelSlug: string; count: number }[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `select=make,make_slug,model,model_slug`,
    true
  );
  const modelMap = new Map<string, { make: string; model: string; makeSlug: string; modelSlug: string; count: number }>();
  for (const r of rows) {
    const key = `${r.make_slug}/${r.model_slug}`;
    const existing = modelMap.get(key);
    if (existing) existing.count++;
    else modelMap.set(key, { make: r.make, model: r.model, makeSlug: r.make_slug, modelSlug: r.model_slug, count: 1 });
  }
  return Array.from(modelMap.values()).sort((a, b) => b.count - a.count).slice(0, limit);
}

// ── Blog Queries ───────────────────────────────────────────

/** Get recalls for a specific month/year (for blog posts) */
export async function getRecallsForMonth(month: number, year: number): Promise<Recall[]> {
  // Use Supabase text filter: report_date contains /MM/YYYY
  const monthStr = month.toString().padStart(2, "0");
  const pattern = `/${monthStr}/${year}`;
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `report_date=like.*${encodeURIComponent(pattern)}&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes,plain_english_hook`
  );
  return rows.sort((a, b) => recallTime(b.report_date) - recallTime(a.report_date)).map(toRecall);
}

/**
 * Exact number of recall rows for a month, via PostgREST `Prefer: count=exact`
 * (Content-Range total), so it is never truncated by the 1000-row response cap.
 * Returns null if the count cannot be read.
 */
export async function countRecallsForMonth(month: number, year: number): Promise<number | null> {
  const monthStr = month.toString().padStart(2, "0");
  const pattern = `/${monthStr}/${year}`;
  const url = `${SUPABASE_URL}/rest/v1/nhtsa_recalls?report_date=like.*${encodeURIComponent(pattern)}&select=campaign_number&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const total = (res.headers.get("content-range") || "").split("/")[1];
    const n = total ? parseInt(total, 10) : NaN;
    return isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

/** Fetch every report_date, paging past the PostgREST 1000-row response cap. */
async function getAllReportDates(): Promise<{ report_date: string | null }[]> {
  const PAGE = 1000;
  const out: { report_date: string | null }[] = [];
  for (let offset = 0; offset < 100000; offset += PAGE) {
    const page = await query<{ report_date: string | null }>(
      "nhtsa_recalls",
      `select=report_date&order=campaign_number.asc&offset=${offset}&limit=${PAGE}`
    );
    out.push(...page);
    if (page.length < PAGE) break;
  }
  return out;
}

/** Get all distinct months that have recall data (for blog index + sitemap) */
export async function getDistinctRecallMonths(): Promise<{ month: number; year: number; count: number; slug: string }[]> {
  const rows = await getAllReportDates();
  const monthMap = new Map<string, { month: number; year: number; count: number }>();
  for (const r of rows) {
    if (!r.report_date) continue;
    const parts = r.report_date.split("/");
    if (parts.length !== 3) continue;
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(year)) continue;
    const key = `${year}-${month}`;
    const existing = monthMap.get(key);
    if (existing) existing.count++;
    else monthMap.set(key, { month, year, count: 1 });
  }
  const monthNames = ["", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  return Array.from(monthMap.values())
    .map(m => ({
      ...m,
      slug: `${monthNames[m.month]}-${m.year}-vehicle-recalls`,
    }))
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

/** Get all models for sitemap generation (only models that have recalls) */
export async function getAllModels(): Promise<DbModel[]> {
  // Built from nhtsa_recalls (not nhtsa_models) so the sitemap survives any cleanup of the models table.
  const [known, recallRows] = await Promise.all([
    query<DbModel>("nhtsa_models", `order=make.asc,model.asc&select=make,make_slug,model,model_slug,latest_year`),
    query<ModelRow>("nhtsa_recalls", `select=make,make_slug,model,model_slug,model_year`, true),
  ]);
  // Only models with enough recalls to justify an indexable page (AdSense / HCU: no thin programmatic pages)
  const recallCounts = new Map<string, number>();
  for (const r of recallRows) {
    const key = `${r.make_slug}/${r.model_slug}`;
    recallCounts.set(key, (recallCounts.get(key) || 0) + 1);
  }
  const MIN_RECALLS_FOR_INDEX = 3;
  return modelsFromRows(recallRows, known).filter(
    (m) => (recallCounts.get(`${m.make_slug}/${m.model_slug}`) || 0) >= MIN_RECALLS_FOR_INDEX
  );
}
