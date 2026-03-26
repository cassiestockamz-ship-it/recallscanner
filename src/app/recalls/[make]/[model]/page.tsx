import Link from "next/link";
import { notFound } from "next/navigation";
import { POPULAR_MAKES, makeSlug, unslug } from "@/lib/nhtsa";
import { getModelsForMake, getRecallsForModel, getComplaintsForModel } from "@/lib/db";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";
import RecallList from "@/components/RecallList";
import EmailCapture from "@/components/EmailCapture";
import AdSlot from "@/components/AdSlot";

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
    alternates: { canonical: `https://www.recallscanner.com/recalls/${makeParam}/${modelParam}` },
  };
}

export const revalidate = 3600;

export default async function ModelPage({ params }: Props) {
  const { make: makeParam, model: modelParam } = await params;
  const make = findMake(makeParam);
  if (!make) notFound();

  const allModels = await getModelsForMake(makeParam);
  const matchingModel = allModels.find((m) => m.model_slug === modelParam);

  if (!matchingModel) notFound();

  const modelDisplay = matchingModel.model;

  // Single Supabase query each -- no more 10+ NHTSA API calls
  const [recalls, complaints] = await Promise.all([
    getRecallsForModel(makeParam, modelParam),
    getComplaintsForModel(makeParam, modelParam),
  ]);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${make} ${modelDisplay} Recall Checker`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `Check all safety recalls for the ${make} ${modelDisplay}. Free NHTSA recall lookup.`,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/recalls" className="hover:text-brand">All Brands</Link>
        <span className="mx-2">/</span>
        <Link href={`/recalls/${makeParam}`} className="hover:text-brand">{make}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{modelDisplay}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {make} {modelDisplay} Safety Recalls
      </h1>
      <p className="text-slate-500 mb-8">
        {recalls.length} recall campaign{recalls.length !== 1 ? "s" : ""} found.
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

      {/* Interactive recall list with year filtering */}
      <RecallList
        recalls={recalls}
        complaints={complaints}
        make={make}
        modelDisplay={modelDisplay}
      />

      <AdSlot position="after-results" className="my-8" />

      {/* Email capture */}
      <div className="my-10">
        <EmailCapture vehicleName={`${make} ${modelDisplay}`} variant="banner" />
      </div>

      {/* Related models cross-links */}
      {allModels.length > 1 && (
        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-lg font-bold mb-4">Other {make} Models</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allModels
              .filter((m) => m.model_slug !== modelParam)
              .slice(0, 8)
              .map((m) => (
                <Link
                  key={m.model}
                  href={`/recalls/${makeParam}/${m.model_slug}`}
                  className="bg-white border border-border rounded-lg p-3 text-center text-sm font-medium text-slate-600 hover:border-brand hover:text-brand transition-colors"
                >
                  {make} {m.model}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
