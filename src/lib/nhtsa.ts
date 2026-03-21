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
  model?: string,
  year?: string
): Promise<Recall[]> {
  const params = new URLSearchParams({ make });
  if (model) params.set("model", model);
  if (year) params.set("modelYear", year);
  const res = await fetch(
    `${BASE}/recalls/recallsByVehicle?${params}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function getComplaintsByMakeModelYear(
  make: string,
  model?: string,
  year?: string
): Promise<Complaint[]> {
  const params = new URLSearchParams({ make });
  if (model) params.set("model", model);
  if (year) params.set("modelYear", year);
  const res = await fetch(
    `${BASE}/complaints/complaintsByVehicle?${params}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results ?? [];
}

export async function getModelsByMake(make: string): Promise<string[]> {
  const recalls = await getRecallsByMakeModelYear(make);
  const models = new Set<string>();
  for (const r of recalls) {
    if (r.Model) models.add(r.Model);
  }
  return Array.from(models).sort();
}
