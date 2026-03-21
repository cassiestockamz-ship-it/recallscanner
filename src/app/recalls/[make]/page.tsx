import Link from "next/link";
import { notFound } from "next/navigation";
import {
  POPULAR_MAKES,
  makeSlug,
  modelSlug,
  getModelsForMake,
  getRecentRecallsForMake,
  nhtsaRecallUrl,
} from "@/lib/nhtsa";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";
import SearchFilter from "@/components/SearchFilter";
import EmailCapture from "@/components/EmailCapture";
import AdSlot from "@/components/AdSlot";

interface Props {
  params: Promise<{ make: string }>;
}

function findMake(slug: string): string | undefined {
  return POPULAR_MAKES.find((m) => makeSlug(m) === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make: slug } = await params;
  const make = findMake(slug);
  if (!make) return {};
  return {
    title: `${make} Recalls — All Safety Recalls for ${make} Vehicles`,
    description: `Complete list of ${make} safety recalls from NHTSA. Check if your ${make} has open recalls and find affected models, components, and remedies.`,
    alternates: { canonical: `https://www.recallscanner.com/recalls/${slug}` },
  };
}

export const revalidate = 86400;

export default async function MakePage({ params }: Props) {
  const { make: slug } = await params;
  const make = findMake(slug);
  if (!make) notFound();

  const [models, recalls] = await Promise.all([
    getModelsForMake(make),
    getRecentRecallsForMake(make),
  ]);

  const modelItems = models.map(({ model }) => ({
    label: model,
    href: `/recalls/${slug}/${modelSlug(model)}`,
  }));

  // Other popular brands for cross-linking
  const otherBrands = POPULAR_MAKES.filter((m) => m !== make).slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/recalls" className="hover:text-brand">All Brands</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{make}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{make} Safety Recalls</h1>
      <p className="text-slate-500 mb-8">
        {models.length} models with recall campaigns found for {make} vehicles.
        Select a model below or check your specific vehicle by VIN.
      </p>

      {/* VIN checker */}
      <div className="bg-blue-50 rounded-lg p-6 mb-10">
        <h2 className="font-semibold text-lg mb-3">Check Your {make} by VIN</h2>
        <VinChecker />
      </div>

      {/* Models grid with search */}
      <h2 className="text-2xl font-bold mb-4">{make} Models with Recalls</h2>
      <SearchFilter items={modelItems} placeholder={`Search ${make} models...`} />

      <div className="my-10">
        <AdSlot position="between-results" />
      </div>

      {/* Email capture */}
      <div className="mb-10">
        <EmailCapture vehicleName={`${make} vehicles`} variant="banner" />
      </div>

      {/* Recent recalls */}
      {recalls.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Recent {make} Recalls</h2>
          <div className="space-y-4 mb-12">
            {recalls.slice(0, 20).map((r) => (
              <div key={r.NHTSACampaignNumber} className="bg-white border border-border rounded-lg p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <a
                    href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono bg-slate-100 text-brand px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    title="View on NHTSA.gov"
                  >
                    {r.NHTSACampaignNumber} ↗
                  </a>
                  <span className="text-xs text-slate-400">{r.ReportReceivedDate}</span>
                  <span className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded">
                    {r.ModelYear} {r.Model}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">{r.Component}</div>
                <p className="text-sm text-slate-500 leading-relaxed">{r.Summary}</p>
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

      <AdSlot position="after-results" />

      {/* Cross-links to other brands */}
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-bold mb-4">Other Popular Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {otherBrands.map((m) => (
            <Link
              key={m}
              href={`/recalls/${makeSlug(m)}`}
              className="bg-white border border-border rounded-lg p-3 text-center text-sm font-medium text-slate-600 hover:border-brand hover:text-brand transition-colors"
            >
              {m} Recalls
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
