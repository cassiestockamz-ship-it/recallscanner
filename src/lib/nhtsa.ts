// Two distinct NHTSA API hosts:
//   - vPIC (vehicle identification): vpic.nhtsa.dot.gov/api
//   - Recall API:                    api.nhtsa.gov
// We use each for its own endpoints — mixing them up returns 403.
const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api";
const RECALL_BASE = "https://api.nhtsa.gov";

export interface Recall {
  NHTSACampaignNumber: string;
  Manufacturer: string;
  Make: string;
  Model: string;
  ModelYear: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  Notes: string;
  /** AI-generated plain-English one-sentence hook, cached at pipeline ingest time. */
  PlainEnglishHook?: string;
}

export interface Complaint {
  odiNumber: string;
  make: string;
  model: string;
  modelYear: string;
  dateOfIncident: string;
  dateComplaintFiled: string;
  components: string;
  summary: string;
  crash: boolean;
  fire: boolean;
  numberOfInjuries: number;
  numberOfDeaths: number;
}

export interface VinDecode {
  Make: string;
  Model: string;
  ModelYear: string;
  BodyClass: string;
  VehicleType: string;
  PlantCity: string;
  PlantState: string;
  Manufacturer: string;
  FuelTypePrimary: string;
  DisplacementL: string;
  EngineConfiguration: string;
  EngineCylinders: string;
  DriveType: string;
  TransmissionStyle: string;
  ErrorCode: string;
  ErrorText: string;
}

// Popular makes for the index page — covers 95%+ of US vehicles
export const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti",
  "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda",
  "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram",
  "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

export function makeSlug(make: string): string {
  return make.toLowerCase().replace(/[\s-]+/g, "-");
}

export function modelSlug(model: string): string {
  return model.toLowerCase().replace(/[\s/]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function unslug(slug: string): string {
  return slug.replace(/-/g, " ");
}

export function nhtsaRecallUrl(campaignNumber: string): string {
  return `https://www.nhtsa.gov/recalls?nhtsaId=${campaignNumber}`;
}

/**
 * Format a date string for display. Handles:
 *  - DD/MM/YYYY (NHTSA recall API / Supabase stored format)
 *  - MM/DD/YYYY (NHTSA complaints/VIN API format)
 *  - ISO / any Date-parseable string
 * Returns "Jan 15, 2024" style output, or the original string if unparseable.
 */
export function formatDate(raw: string): string {
  if (!raw) return "";
  // DD/MM/YYYY vs MM/DD/YYYY: if first segment > 12, it must be a day
  const slashParts = raw.split("/");
  if (slashParts.length === 3) {
    const [a, b, year] = slashParts;
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    let month: number, day: number;
    if (aNum > 12) {
      // DD/MM/YYYY
      day = aNum;
      month = bNum;
    } else if (bNum > 12) {
      // MM/DD/YYYY
      month = aNum;
      day = bNum;
    } else {
      // Ambiguous -- assume MM/DD/YYYY (US convention for NHTSA VIN/complaint data)
      month = aNum;
      day = bNum;
    }
    const d = new Date(parseInt(year, 10), month - 1, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  }
  // Fallback: try native parse
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return raw;
}

export async function getRecallsByVin(vin: string): Promise<{ recalls: Recall[]; apiError: boolean }> {
  try {
    const res = await fetch(
      `${RECALL_BASE}/recalls/recallsByVehicle?make=&model=&modelYear=&campaignNumber=&vin=${encodeURIComponent(vin)}`,
      { next: { revalidate: 86400 } }
    );
    // NHTSA's recall API is quirky: it returns HTTP 400 even on success
    // (with Count:0 and a "Results returned successfully" message) when a
    // VIN has no recalls. We have to parse the body regardless of status
    // and only treat as an error if the JSON itself is missing/invalid.
    let data: { results?: Recall[]; Count?: number; Message?: string } | null = null;
    try {
      data = await res.json();
    } catch {
      return { recalls: [], apiError: true };
    }
    if (!data || !Array.isArray(data.results)) {
      // 5xx or truly malformed
      if (res.status >= 500) return { recalls: [], apiError: true };
      return { recalls: [], apiError: false };
    }
    return { recalls: data.results, apiError: false };
  } catch {
    return { recalls: [], apiError: true };
  }
}

export async function decodeVin(vin: string): Promise<VinDecode | null> {
  try {
    const res = await fetch(
      `${VPIC_BASE}/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.Results?.[0];
    if (!result) return null;
    // ErrorCode "0" means success. NHTSA can return multi-part codes like
    // "1,4" (partial decodes) — we still keep those as "known enough" as
    // long as Make is populated.
    const code = String(result.ErrorCode ?? "").split(",")[0].trim();
    if (code && code !== "0" && !result.Make) return null;
    return result;
  } catch {
    return null;
  }
}

export async function getRecallsByMakeModelYear(
  make: string,
  model: string,
  year: string
): Promise<Recall[]> {
  try {
    const res = await fetch(
      `${RECALL_BASE}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

export async function getComplaintsByMakeModelYear(
  make: string,
  model: string,
  year: string
): Promise<Complaint[]> {
  try {
    const res = await fetch(
      `${RECALL_BASE}/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

// Get models with recalls for a make across recent years
export async function getModelsForMake(make: string): Promise<{ model: string; year: string }[]> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const results: { model: string; year: string }[] = [];
  const seen = new Set<string>();

  const fetches = years.map(async (year) => {
    try {
      const res = await fetch(
        `${RECALL_BASE}/products/vehicle/models?make=${encodeURIComponent(make)}&modelYear=${year}&issueType=r`,
        { next: { revalidate: 86400 } }
      );
      const data = await res.json();
      return Array.isArray(data?.results)
        ? data.results.map((r: { model: string }) => ({ model: r.model, year: String(year) }))
        : [];
    } catch {
      return [];
    }
  });

  const allResults = await Promise.all(fetches);
  for (const yearResults of allResults) {
    for (const r of yearResults) {
      // Normalize: strip parentheses, uppercase for dedup
      const baseModel = r.model.split("(")[0].trim();
      const dedupKey = baseModel.toUpperCase();
      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        results.push({ model: baseModel, year: r.year });
      }
    }
  }

  return results.sort((a, b) => a.model.localeCompare(b.model));
}

// Get recalls for a make across recent years (for brand page)
export async function getRecentRecallsForMake(make: string): Promise<Recall[]> {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const modelSets = await Promise.all(
    years.map(async (year) => {
      try {
        const res = await fetch(
          `${RECALL_BASE}/products/vehicle/models?make=${encodeURIComponent(make)}&modelYear=${year}&issueType=r`,
          { next: { revalidate: 86400 } }
        );
        const data = await res.json();
        return Array.isArray(data?.results)
          ? data.results.map((r: { model: string }) => ({ model: r.model, year: String(year) }))
          : [];
      } catch {
        return [];
      }
    })
  );

  const seen = new Set<string>();
  const toFetch: { model: string; year: string }[] = [];
  for (const models of modelSets) {
    for (const m of models) {
      const base = m.model.split("(")[0].trim();
      const key = `${base.toUpperCase()}-${m.year}`;
      if (!seen.has(key) && toFetch.length < 15) {
        seen.add(key);
        toFetch.push({ model: m.model, year: m.year });
      }
    }
  }

  const recalls = await Promise.all(
    toFetch.map((m) => getRecallsByMakeModelYear(make, m.model, m.year))
  );

  const campaignSeen = new Set<string>();
  const all: Recall[] = [];
  for (const batch of recalls) {
    for (const r of batch) {
      if (!campaignSeen.has(r.NHTSACampaignNumber)) {
        campaignSeen.add(r.NHTSACampaignNumber);
        all.push(r);
      }
    }
  }

  return all.sort(
    (a, b) => new Date(b.ReportReceivedDate).getTime() - new Date(a.ReportReceivedDate).getTime()
  );
}
