/**
 * Supabase data layer for NHTSA data.
 * Uses REST API directly (no SDK dependency).
 * All data is pre-fetched by the VPS pipeline — zero NHTSA calls at render time.
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

async function query<T>(table: string, params: string): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    next: { revalidate: 3600 }, // 1hr ISR — pipeline refreshes daily
  });
  if (!res.ok) {
    console.error(`Supabase query failed: ${res.status} ${await res.text()}`);
    return [];
  }
  return res.json();
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

/** Get recent recalls for a make, mapped to Recall interface */
export async function getRecentRecallsForMake(makeSlugVal: string, limit = 30): Promise<Recall[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&order=report_date.desc&limit=${limit}&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes`
  );
  return rows.map(toRecall);
}

/** Get all recalls for a specific model, mapped to Recall interface */
export async function getRecallsForModel(makeSlugVal: string, modelSlugVal: string): Promise<Recall[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&order=report_date.desc&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes`
  );
  return rows.map(toRecall);
}

/** Get complaints for a specific model, mapped to Complaint interface */
export async function getComplaintsForModel(makeSlugVal: string, modelSlugVal: string): Promise<Complaint[]> {
  const rows = await query<DbComplaint>(
    "nhtsa_complaints",
    `make_slug=eq.${encodeURIComponent(makeSlugVal)}&model_slug=eq.${encodeURIComponent(modelSlugVal)}&order=date_filed.desc&select=odi_number,make,make_slug,model,model_slug,model_year,date_incident,date_filed,components,summary,crash,fire,injuries,deaths`
  );
  return rows.map(toComplaint);
}

/** Get recent recalls across all makes (most-recalled page) */
export async function getRecentRecallsAll(limit = 30): Promise<Recall[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `order=report_date.desc&limit=${limit}&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes`
  );
  return rows.map(toRecall);
}

// ── Trends Queries ─────────────────────────────────────────

/** Get recall counts grouped by year */
export async function getRecallsByYear(): Promise<{ year: string; count: number }[]> {
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `select=report_date&order=report_date.desc`
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
    `select=make,make_slug`
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
    `select=component`
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
    `select=make,make_slug,model,model_slug`
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
  const rows = await query<DbRecall>(
    "nhtsa_recalls",
    `order=report_date.desc&select=campaign_number,manufacturer,make,make_slug,model,model_slug,model_year,component,summary,consequence,remedy,report_date,notes`
  );
  const monthStr = month.toString().padStart(2, "0");
  const filtered = rows.filter(r => {
    if (!r.report_date) return false;
    // DD/MM/YYYY format
    const parts = r.report_date.split("/");
    if (parts.length !== 3) return false;
    return parts[1] === monthStr && parts[2] === year.toString();
  });
  return filtered.map(toRecall);
}

/** Get all models for sitemap generation */
export async function getAllModels(): Promise<DbModel[]> {
  return query<DbModel>(
    "nhtsa_models",
    `order=make.asc,model.asc&select=make,make_slug,model,model_slug,latest_year`
  );
}
