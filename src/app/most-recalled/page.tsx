import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import { getRecentRecallsAll } from "@/lib/db";
import type { Metadata } from "next";
import RecallCard from "@/components/RecallCard";
import { scoreRecall } from "@/lib/severity";

export const metadata: Metadata = {
  title: "Latest Vehicle Recalls Across All Brands",
  description:
    "The newest safety recalls across every major vehicle brand, severity-scored and plain-English. Updated daily from NHTSA.",
  alternates: { canonical: "https://www.recallscanner.com/most-recalled" },
};

export const revalidate = 3600;

export default async function MostRecalledPage() {
  const recentRecalls = await getRecentRecallsAll(60);
  const scored = recentRecalls
    .map((r) => ({ recall: r, severity: scoreRecall(r) }))
    .sort((a, b) => b.severity.score - a.severity.score);

  // Count by make
  const makeCounts = new Map<string, number>();
  for (const r of recentRecalls) {
    makeCounts.set(r.Make, (makeCounts.get(r.Make) || 0) + 1);
  }
  const topMakes = Array.from(makeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalCrit = scored.filter((s) => s.severity.tier === "crit").length;
  const totalWatch = scored.filter((s) => s.severity.tier === "watch").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Header */}
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-2">
          Latest from NHTSA · Updated daily
        </div>
        <h1 className="text-[36px] md:text-[48px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-2">
          Latest Vehicle Recalls
        </h1>
        <p className="text-slate-600 text-[16px] max-w-[58ch] leading-snug">
          The newest safety campaigns across every major brand, severity-scored so you can see the important ones at a glance.
          {totalCrit > 0 && (
            <>
              {" · "}
              <span className="text-[var(--color-crit)] font-semibold">{totalCrit} critical</span>
            </>
          )}
          {totalWatch > 0 && (
            <>
              {" · "}
              <span className="text-[var(--color-watch-ink)] font-semibold">{totalWatch} watch</span>
            </>
          )}
        </p>
      </header>

      {/* Top brands tiles */}
      <section className="mb-12">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4">Most active brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
          {topMakes.map(([make, count]) => (
            <Link
              key={make}
              href={`/recalls/${makeSlug(make)}`}
              className="group rounded-xl border border-[var(--color-border)] bg-white p-3 hover:border-[var(--color-brand)] transition-colors"
            >
              <div className="text-[22px] font-bold text-[var(--color-brand)] tabular-nums">{count}</div>
              <div className="text-[12px] text-slate-500 group-hover:text-[var(--color-brand)] transition-colors">
                {make} recall{count === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest recalls list */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px] font-bold text-slate-900">Newest campaigns</h2>
          <span className="text-[12px] text-slate-400">severity-sorted</span>
        </div>
        <div className="space-y-3">
          {scored.slice(0, 30).map(({ recall }, i) => (
            <RecallCard
              key={recall.NHTSACampaignNumber}
              recall={recall}
              deferPaint={i > 2}
            />
          ))}
        </div>
      </section>

      {/* Browse all */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <h2 className="font-bold text-slate-900 text-[16px] mb-1">Browse all {POPULAR_MAKES.length} brands</h2>
        <p className="text-[13px] text-slate-500 mb-4">Check recalls for any vehicle manufacturer.</p>
        <Link
          href="/recalls"
          className="inline-flex items-center gap-1.5 text-[var(--color-brand)] font-semibold hover:underline"
        >
          See all brands <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
