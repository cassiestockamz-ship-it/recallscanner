import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import { getModelsForMake, getRecentRecallsForMake } from "@/lib/db";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";
import SearchFilter from "@/components/SearchFilter";
import BrandEditorial from "@/components/BrandEditorial";
import RecallCard from "@/components/RecallCard";
import { scoreRecall } from "@/lib/severity";

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
    title: `${make} Recalls · All Safety Recalls for ${make} Vehicles`,
    description: `Complete list of ${make} safety recalls from NHTSA with severity ratings. Check your VIN, browse every model, and see which campaigns are still open.`,
    alternates: { canonical: `https://www.recallscanner.com/recalls/${slug}` },
  };
}

export const revalidate = 3600;

export default async function MakePage({ params }: Props) {
  const { make: slug } = await params;
  const make = findMake(slug);
  if (!make) notFound();

  const [models, recalls] = await Promise.all([
    getModelsForMake(slug),
    getRecentRecallsForMake(slug),
  ]);

  const modelItems = models.map((m) => ({
    label: m.model,
    href: `/recalls/${slug}/${m.model_slug}`,
  }));

  const scored = recalls.map((r) => ({ recall: r, severity: scoreRecall(r) }));
  const critCount = scored.filter((s) => s.severity.tier === "crit").length;
  const watchCount = scored.filter((s) => s.severity.tier === "watch").length;
  const mostSevere = [...scored]
    .sort((a, b) => b.severity.score - a.severity.score)
    .slice(0, 3);

  const otherBrands = POPULAR_MAKES.filter((m) => m !== make).slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-slate-400 mb-6 font-medium">
        <Link href="/recalls" className="hover:text-[var(--color-brand)]">All Brands</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{make}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-2">
          Brand Safety Profile
        </div>
        <h1 className="text-[36px] md:text-[48px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-2">
          {make} Safety Recalls
        </h1>
        <p className="text-slate-600 text-[16px] max-w-[58ch] leading-snug">
          {models.length} model{models.length === 1 ? "" : "s"} tracked. {recalls.length} recent campaign{recalls.length === 1 ? "" : "s"}
          {critCount > 0 && (
            <>
              {" · "}
              <span className="text-[var(--color-crit)] font-semibold">{critCount} critical</span>
            </>
          )}
          {watchCount > 0 && (
            <>
              {" · "}
              <span className="text-[var(--color-watch-ink)] font-semibold">{watchCount} watch</span>
            </>
          )}
          .
        </p>
      </header>

      {/* VIN checker — TOOL FIRST */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 md:p-7 mb-10">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
          Check your specific {make}
        </div>
        <h2 className="text-[20px] font-bold text-slate-900 mb-4">
          Is your VIN affected?
        </h2>
        <VinChecker compact />
      </section>

      {/* Most severe — if there are critical/watch recalls, surface them */}
      {mostSevere.length > 0 && mostSevere[0].severity.tier !== "clear" && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[20px] font-bold text-slate-900">Most Urgent {make} Recalls</h2>
            <span className="text-[12px] text-slate-400">top {mostSevere.length}</span>
          </div>
          <div className="space-y-3">
            {mostSevere.map(({ recall }) => (
              <RecallCard key={recall.NHTSACampaignNumber} recall={recall} />
            ))}
          </div>
        </section>
      )}

      {/* Models grid with search */}
      <section className="mb-10">
        <h2 className="text-[20px] font-bold text-slate-900 mb-4">
          {make} Models with Recalls
        </h2>
        <SearchFilter items={modelItems} placeholder={`Search ${make} models…`} />
      </section>

      {/* Recent recalls (full list, deferred paint) */}
      {scored.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[20px] font-bold text-slate-900 mb-4">
            Recent {make} Recalls
          </h2>
          <div className="space-y-3">
            {scored.slice(0, 20).map(({ recall }, i) => (
              <RecallCard key={recall.NHTSACampaignNumber} recall={recall} deferPaint={i > 2} />
            ))}
          </div>
        </section>
      )}

      {/* ── Editorial — collapsed by default ──────────────────── */}
      <details className="mt-12 rounded-2xl border border-[var(--color-border)] bg-white group">
        <summary className="cursor-pointer list-none px-5 py-4 flex items-center gap-3">
          <span className="inline-block w-4 text-center text-slate-400 transition-transform group-open:rotate-90">
            ›
          </span>
          <div className="flex-1">
            <div className="font-semibold text-slate-900 text-[15px]">
              Full analysis of {make} recall history
            </div>
            <div className="text-[12px] text-slate-500">
              Category breakdown, most-recalled model, year-over-year, severity context.
            </div>
          </div>
        </summary>
        <div className="px-5 pb-5">
          <BrandEditorial make={make} recalls={recalls} modelCount={models.length} />
        </div>
      </details>

      {/* Cross-links */}
      <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4">Other Popular Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {otherBrands.map((m) => (
            <Link
              key={m}
              href={`/recalls/${makeSlug(m)}`}
              className="group rounded-xl border border-[var(--color-border)] bg-white p-3 text-[13px] font-medium text-slate-600 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors flex items-center justify-between"
            >
              {m} Recalls
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
