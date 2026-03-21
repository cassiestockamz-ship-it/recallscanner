const BASE = "https://api.nhtsa.gov";

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
}

export interface Complaint {
  ODINumber: string;
  Make: string;
  Model: string;
  ModelYear: string;
  DateOfIncident: string;
  DateComplaintFiled: string;
  Component: string;
  Summary: string;
  Crash: boolean;
  Fire: boolean;
  NumberOfInjuries: number;
  NumberOfDeaths: number;
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
  return model.toLowerCase().replace(/[\s/]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function unslug(slug: string): string {
  return slug.replace(/-/g, " ");
}

export async function getRecallsByVin(vin: string): Promise<Recall[]> {
  const res = await fetch(
    `${BASE}/recalls/recallsByVehicle?make=&model=&modelYear=&campaignNumber=&vin=${vin}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function decodeVin(vin: string): Promise<VinDecode | null> {
  const res = await fetch(
    `${BASE}/vehicles/DecodeVinValues/${vin}?format=json`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const result = data.Results?.[0];
  if (!result || result.ErrorCode === "0") return result;
  return result;
}

export async function getRecallsByMakeModelYear(
  make: string,
  model: string,
  year: string
): Promise<Recall[]> {
  const res = await fetch(
    `${BASE}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function getComplaintsByMakeModelYear(
  make: string,
  model: string,
  year: string
): Promise<Complaint[]> {
  const res = await fetch(
    `${BASE}/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

// Get models with recalls for a make across recent years
export async function getModelsForMake(make: string): Promise<{ model: string; year: string }[]> {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const results: { model: string; year: string }[] = [];
  const seen = new Set<string>();

  // Fetch models across recent years in parallel
  const fetches = years.map(async (year) => {
    const res = await fetch(
      `${BASE}/products/vehicle/models?make=${encodeURIComponent(make)}&modelYear=${year}&issueType=r`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: { model: string }) => ({ model: r.model, year: String(year) }));
  });

  const allResults = await Promise.all(fetches);
  for (const yearResults of allResults) {
    for (const r of yearResults) {
      // Normalize model name — take the base name before parentheses
      const baseModel = r.model.split("(")[0].trim();
      if (!seen.has(baseModel)) {
        seen.add(baseModel);
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

  // Get models for recent years
  const modelSets = await Promise.all(
    years.map(async (year) => {
      const res = await fetch(
        `${BASE}/products/vehicle/models?make=${encodeURIComponent(make)}&modelYear=${year}&issueType=r`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results ?? []).map((r: { model: string }) => ({ model: r.model, year: String(year) }));
    })
  );

  // Pick up to 5 unique models to fetch recalls for (to avoid too many API calls)
  const seen = new Set<string>();
  const toFetch: { model: string; year: string }[] = [];
  for (const models of modelSets) {
    for (const m of models) {
      const base = m.model.split("(")[0].trim();
      const key = `${base}-${m.year}`;
      if (!seen.has(key) && toFetch.length < 15) {
        seen.add(key);
        toFetch.push({ model: m.model, year: m.year });
      }
    }
  }

  const recalls = await Promise.all(
    toFetch.map((m) => getRecallsByMakeModelYear(make, m.model, m.year))
  );

  // Deduplicate by campaign number
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
