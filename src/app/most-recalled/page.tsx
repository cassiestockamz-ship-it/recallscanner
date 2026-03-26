import Link from "next/link";
import { POPULAR_MAKES, makeSlug, nhtsaRecallUrl } from "@/lib/nhtsa";
import { getRecentRecallsAll } from "@/lib/db";
import type { Metadata } from "next";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "Most Recalled Vehicles — Recent Safety Recalls Across All Brands",
  description:
    "See the latest vehicle safety recalls across all major brands. Updated daily with data from NHTSA. Ford, Toyota, Honda, Chevrolet, and more.",
  alternates: { canonical: "https://www.recallscanner.com/most-recalled" },
};

export const revalidate = 3600;

export default async function MostRecalledPage() {
  // Single Supabase query -- no more 10 parallel NHTSA calls
  const recentRecalls = await getRecentRecallsAll(50);

  // Count by make
  const makeCounts = new Map<string, number>();
  for (const r of recentRecalls) {
    makeCounts.set(r.Make, (makeCounts.get(r.Make) || 0) + 1);
  }
  const topMakes = Array.from(makeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Most Recalled Vehicles</h1>
      <p className="text-slate-500 mb-8">
        The latest safety recalls across all major vehicle brands. Updated daily from NHTSA.
      </p>

      {/* Brand recall counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
        {topMakes.map(([make, count]) => (
          <Link
            key={make}
            href={`/recalls/${makeSlug(make)}`}
            className="bg-white border border-border rounded-lg p-3 text-center hover:border-brand transition-colors group"
          >
            <div className="font-bold text-lg text-brand">{count}</div>
            <div className="text-xs text-slate-500 group-hover:text-brand transition-colors">{make}</div>
          </Link>
        ))}
      </div>

      {/* Email capture */}
      <div className="mb-10">
        <EmailCapture variant="banner" />
      </div>

      {/* Recent recalls */}
      <h2 className="text-2xl font-bold mb-4">Latest Recalls</h2>
      <div className="space-y-4 mb-12">
        {recentRecalls.slice(0, 30).map((r) => (
          <div key={r.NHTSACampaignNumber} className="bg-white border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <a
                href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono bg-slate-100 text-brand px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
              >
                {r.NHTSACampaignNumber} ↗
              </a>
              <span className="text-xs text-slate-400">{r.ReportReceivedDate}</span>
              <Link
                href={`/recalls/${makeSlug(r.Make)}`}
                className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
              >
                {r.Make}
              </Link>
              <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded">
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
          </div>
        ))}
      </div>

      {/* Browse all brands */}
      <div className="bg-surface rounded-lg p-6 text-center">
        <h2 className="font-semibold text-lg mb-2">Browse All Brands</h2>
        <p className="text-sm text-slate-500 mb-4">Check recalls for any vehicle manufacturer.</p>
        <Link href="/recalls" className="text-brand font-medium hover:underline">
          View all {POPULAR_MAKES.length} brands &rarr;
        </Link>
      </div>
    </div>
  );
}
