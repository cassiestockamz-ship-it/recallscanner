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

/** Get all models for sitemap generation */
export async function getAllModels(): Promise<DbModel[]> {
  return query<DbModel>(
    "nhtsa_models",
    `order=make.asc,model.asc&select=make,make_slug,model,model_slug,latest_year`
  );
}
