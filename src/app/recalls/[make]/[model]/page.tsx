import Link from "next/link";
import { notFound } from "next/navigation";
import {
  POPULAR_MAKES,
  makeSlug,
  modelSlug,
  unslug,
  getRecallsByMakeModelYear,
  getComplaintsByMakeModelYear,
  getModelsForMake,
} from "@/lib/nhtsa";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";

interface Props {
  params: Promise<{ make: string; model: string }>;
}

function findMake(slug: string): string | undefined {
  return POPULAR_MAKES.find((m) => makeSlug(m) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make: makeParam, model: modelParam } = await params;
  const make = findMake(makeParam);
  if (!make) return {};
  const modelDisplay = unslug(modelParam).toUpperCase();
  return {
    title: `${make} ${modelDisplay} Recalls — Safety Recalls & Complaints`,
    description: `All safety recalls and NHTSA complaints for the ${make} ${modelDisplay}. Check by VIN, see affected years, components, and free repair details.`,
  };
}

export default async function ModelPage({ params }: Props) {
  const { make: makeParam, model: modelParam } = await params;
  const make = findMake(makeParam);
  if (!make) notFound();

  // Get all models for this make to find the right model name and years
  const allModels = await getModelsForMake(make);
  const matchingModels = allModels.filter(
    (m) => modelSlug(m.model) === modelParam
  );

  if (matchingModels.length === 0) notFound();

  const modelDisplay = matchingModels[0].model;

  // Fetch recalls across recent years for this model
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  const recallBatches = await Promise.all(
    years.map((year) => getRecallsByMakeModelYear(make, modelDisplay, year))
  );

  // Deduplicate by campaign number
  const campaignSeen = new Set<string>();
  const recalls = recallBatches
    .flat()
    .filter((r) => {
      if (campaignSeen.has(r.NHTSACampaignNumber)) return false;
      campaignSeen.add(r.NHTSACampaignNumber);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.ReportReceivedDate).getTime() -
        new Date(a.ReportReceivedDate).getTime()
    );

  // Group by year
  const yearMap = new Map<string, number>();
  for (const r of recalls) {
    const y = r.ModelYear || "Unknown";
    yearMap.set(y, (yearMap.get(y) || 0) + 1);
  }
  const yearEntries = Array.from(yearMap.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  // Fetch complaints for one recent year (to keep API calls reasonable)
  const complaints = await getComplaintsByMakeModelYear(
    make,
    modelDisplay,
    String(currentYear - 1)
  );
  const recentComplaints = complaints.slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/recalls" className="hover:text-brand">
          All Brands
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/recalls/${makeParam}`} className="hover:text-brand">
          {make}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{modelDisplay}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {make} {modelDisplay} Safety Recalls
      </h1>
      <p className="text-slate-500 mb-8">
        {recalls.length} recall campaign{recalls.length !== 1 ? "s" : ""} found
        across {yearEntries.length} model year
        {yearEntries.length !== 1 ? "s" : ""}.
        {complaints.length > 0 &&
          ` Plus ${complaints.length.toLocaleString()} owner complaints.`}
      </p>

      {/* VIN checker */}
      <div className="bg-blue-50 rounded-lg p-6 mb-10">
        <h2 className="font-semibold text-lg mb-3">
          Check Your {make} {modelDisplay} by VIN
        </h2>
        <VinChecker />
      </div>

      {/* Year breakdown */}
      {yearEntries.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Recalls by Model Year</h2>
          <div className="flex flex-wrap gap-2 mb-10">
            {yearEntries.map(([year, count]) => (
              <div
                key={year}
                className="bg-white border border-border rounded-lg px-4 py-2 text-center"
              >
                <div className="font-semibold text-slate-800">{year}</div>
                <div className="text-xs text-slate-400">
                  {count} recall{count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All recalls */}
      {recalls.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">All Recalls</h2>
          <div className="space-y-4 mb-12">
            {recalls.map((r) => (
              <div
                key={r.NHTSACampaignNumber}
                className="bg-white border border-border rounded-lg p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    {r.NHTSACampaignNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {r.ReportReceivedDate}
                  </span>
                  <span className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded">
                    {r.ModelYear}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {r.Component}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {r.Summary}
                </p>
                {r.Consequence && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-danger">Risk:</span>{" "}
                    <span className="text-slate-600">{r.Consequence}</span>
                  </div>
                )}
                {r.Remedy && (
                  <div className="mt-1 text-sm">
                    <span className="font-medium text-safe">Remedy:</span>{" "}
                    <span className="text-slate-600">{r.Remedy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Complaints */}
      {recentComplaints.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Recent Owner Complaints ({complaints.length.toLocaleString()} total)
          </h2>
          <div className="space-y-4">
            {recentComplaints.map((c, i) => (
              <div
                key={c.ODINumber || i}
                className="bg-white border border-border rounded-lg p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">
                    {c.DateComplaintFiled}
                  </span>
                  <span className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded">
                    {c.ModelYear} {c.Model}
                  </span>
                  {c.Crash && (
                    <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded font-medium">
                      Crash reported
                    </span>
                  )}
                  {c.Fire && (
                    <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded font-medium">
                      Fire reported
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {c.Component}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {c.Summary}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
