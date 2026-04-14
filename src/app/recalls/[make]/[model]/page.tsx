import Link from "next/link";
import { notFound } from "next/navigation";
import { POPULAR_MAKES, makeSlug, unslug } from "@/lib/nhtsa";
import {
  getModelsForMake,
  getRecallsForModel,
  getComplaintsForModel,
  getModelReliability,
} from "@/lib/db";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";
import RecallBuckets from "@/components/RecallBuckets";
import ModelSeverityHeader from "@/components/ModelSeverityHeader";
import ModelEditorial from "@/components/ModelEditorial";

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

  const [recalls, complaints] = await Promise.all([
    getRecallsForModel(makeParam, modelParam),
    getComplaintsForModel(makeParam, modelParam),
  ]);
  const isThin = recalls.length < 3 && complaints.length < 20;

  return {
    title: `${make} ${modelDisplay} Recalls · Safety Recalls & Complaints`,
    description: `All safety recalls, complaint data, and RecallScore severity rating for the ${make} ${modelDisplay}. Check by VIN.`,
    alternates: {
      canonical: `https://www.recallscanner.com/recalls/${makeParam}/${modelParam}`,
    },
    ...(isThin ? { robots: { index: false, follow: true } } : {}),
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

  const [recalls, complaints, reliability] = await Promise.all([
    getRecallsForModel(makeParam, modelParam),
    getComplaintsForModel(makeParam, modelParam),
    getModelReliability(makeParam, modelParam),
  ]);

  // Soft-404 prevention
  if (recalls.length === 0 && complaints.length === 0) notFound();

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
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-[12px] text-slate-400 mb-6 font-medium">
        <Link href="/recalls" className="hover:text-[var(--color-brand)]">All Brands</Link>
        <span className="mx-2">/</span>
        <Link href={`/recalls/${makeParam}`} className="hover:text-[var(--color-brand)]">{make}</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{modelDisplay}</span>
      </nav>

      {/* Severity header — the hero */}
      <ModelSeverityHeader
        make={make}
        modelDisplay={modelDisplay}
        recalls={recalls}
        complaints={complaints}
        reliability={reliability}
      />

      {/* VIN checker — directly under the hero, tool-first */}
      <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
          Check your specific {modelDisplay}
        </div>
        <h2 className="text-[18px] font-bold text-slate-900 mb-3">
          Is your VIN affected?
        </h2>
        <VinChecker compact />
      </div>

      {/* Recall buckets */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px] font-bold text-slate-900">All Recalls</h2>
          <span className="text-[12px] text-slate-400">
            {recalls.length} campaign{recalls.length === 1 ? "" : "s"}
          </span>
        </div>
        <RecallBuckets
          recalls={recalls}
          complaints={complaints}
          make={make}
          modelDisplay={modelDisplay}
        />
      </div>

      {/* Editorial analysis — collapsed, still in DOM for SEO/AdSense */}
      <details className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white group">
        <summary className="cursor-pointer list-none px-5 py-4 flex items-center gap-3">
          <span className="inline-block w-4 text-center text-slate-400 transition-transform group-open:rotate-90">
            ›
          </span>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 text-[15px]">
              Full analysis: how to read the {make} {modelDisplay} recall history
            </div>
            <div className="text-[12px] text-slate-500">
              Year range, common components, complaint patterns, and how to use this page.
            </div>
          </div>
        </summary>
        <div className="px-5 pb-5">
          <ModelEditorial
            make={make}
            modelDisplay={modelDisplay}
            recalls={recalls}
            complaints={complaints}
            reliability={reliability}
          />
        </div>
      </details>

      {/* Related models */}
      {allModels.length > 1 && (
        <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <h2 className="text-[16px] font-bold text-slate-900 mb-4">Other {make} Models</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allModels
              .filter((m) => m.model_slug !== modelParam)
              .slice(0, 8)
              .map((m) => (
                <Link
                  key={m.model}
                  href={`/recalls/${makeParam}/${m.model_slug}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-3 text-center text-[13px] font-medium text-slate-600 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                >
                  {m.model}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
