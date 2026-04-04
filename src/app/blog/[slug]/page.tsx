import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecallsForMonth, getDistinctRecallMonths } from "@/lib/db";
import { formatDate, makeSlug, nhtsaRecallUrl } from "@/lib/nhtsa";
import EmailCapture from "@/components/EmailCapture";
import SafetyProductRec from "@/components/SafetyProductRec";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** Parse slug like "march-2026-vehicle-recalls" into { month, year } */
function parseSlug(slug: string): { month: number; year: number } | null {
  const match = slug.match(/^([a-z]+)-(\d{4})-vehicle-recalls$/);
  if (!match) return null;
  const month = MONTH_NAMES[match[1]];
  const year = parseInt(match[2], 10);
  if (!month || isNaN(year)) return null;
  return { month, year };
}

export async function generateStaticParams() {
  const months = await getDistinctRecallMonths();
  return months.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};
  const monthLabel = new Date(parsed.year, parsed.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const title = `${monthLabel} Vehicle Recalls: What You Need to Know`;
  return {
    title,
    description: `${title}. All safety recalls reported to NHTSA in ${monthLabel}, with affected vehicles, components, and what to do.`,
    alternates: { canonical: `https://www.recallscanner.com/blog/${slug}` },
  };
}

export const revalidate = 3600;

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const recalls = await getRecallsForMonth(parsed.month, parsed.year);
  if (recalls.length === 0) notFound();

  const monthLabel = new Date(parsed.year, parsed.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const title = `${monthLabel} Vehicle Recalls: What You Need to Know`;
  const intro = `Here's a rundown of vehicle safety recalls reported to NHTSA in ${monthLabel}. If your vehicle is on this list, contact your dealer for a free repair.`;

  // Group by brand
  const byBrand = new Map<string, typeof recalls>();
  for (const r of recalls) {
    const list = byBrand.get(r.Make) || [];
    list.push(r);
    byBrand.set(r.Make, list);
  }
  const brandEntries = Array.from(byBrand.entries()).sort((a, b) => b[1].length - a[1].length);

  // Component breakdown
  const componentCounts = new Map<string, number>();
  for (const r of recalls) {
    const c = (r.Component || "").toUpperCase();
    let cat = "Other";
    if (c.includes("AIR BAG") || c.includes("AIRBAG")) cat = "Air Bags";
    else if (c.includes("BRAKE")) cat = "Brakes";
    else if (c.includes("ENGINE") || c.includes("STARTER")) cat = "Engine";
    else if (c.includes("STEERING")) cat = "Steering";
    else if (c.includes("ELECTRICAL") || c.includes("WIRING")) cat = "Electrical";
    else if (c.includes("FUEL")) cat = "Fuel System";
    else if (c.includes("SEAT BELT")) cat = "Seat Belts";
    else if (c.includes("SOFTWARE") || c.includes("CAMERA")) cat = "Software";
    else if (c.includes("LIGHT") || c.includes("LAMP")) cat = "Lighting";
    else if (c.includes("SUSPENSION")) cat = "Suspension";
    componentCounts.set(cat, (componentCounts.get(cat) || 0) + 1);
  }
  const topComponents = Array.from(componentCounts.entries())
    .filter(([c]) => c !== "Other")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Highlight critical recalls (fires, crashes, injuries mentioned)
  const critical = recalls.filter(r => {
    const text = `${r.Consequence} ${r.Summary}`.toLowerCase();
    return text.includes("fire") || text.includes("crash") || text.includes("injury") || text.includes("death");
  }).slice(0, 5);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/blog" className="hover:text-brand">Reports</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{monthLabel}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <time className="text-sm text-slate-400 block mb-6">{monthLabel}</time>
      <p className="text-slate-600 mb-8 leading-relaxed">{intro}</p>

      {/* At a glance */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{recalls.length}</div>
          <div className="text-xs text-slate-500">Recalls This Month</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{brandEntries.length}</div>
          <div className="text-xs text-slate-500">Brands Affected</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{critical.length}</div>
          <div className="text-xs text-slate-500">Critical Recalls</div>
        </div>
      </div>

      {/* Top components */}
      {topComponents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">Top Components Affected</h2>
          <div className="flex flex-wrap gap-2">
            {topComponents.map(([cat, cnt]) => (
              <span key={cat} className="bg-white border border-border rounded-full px-3 py-1 text-sm text-slate-600">
                {cat} <span className="font-bold text-brand ml-1">{cnt}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Critical recalls */}
      {critical.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Most Critical Recalls</h2>
          <div className="space-y-4">
            {critical.map((r) => (
              <div key={r.NHTSACampaignNumber} className="bg-white border border-red-200 rounded-lg p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <a
                    href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono bg-red-50 text-danger px-2 py-0.5 rounded hover:bg-red-100 transition-colors"
                  >
                    {r.NHTSACampaignNumber} ↗
                  </a>
                  <span className="text-xs text-slate-400">{formatDate(r.ReportReceivedDate)}</span>
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
        </section>
      )}

      {/* By brand */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Recalls by Brand</h2>
        <div className="space-y-4">
          {brandEntries.map(([brand, brandRecalls]) => (
            <details key={brand} className="bg-white border border-border rounded-lg">
              <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors">
                <span className="font-medium text-slate-700">{brand}</span>
                <span className="text-sm text-slate-400">{brandRecalls.length} recall{brandRecalls.length !== 1 ? "s" : ""}</span>
              </summary>
              <div className="px-4 pb-4 space-y-3">
                {brandRecalls.map((r) => (
                  <div key={r.NHTSACampaignNumber} className="border-t border-border pt-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <a
                        href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-brand hover:underline"
                      >
                        {r.NHTSACampaignNumber} ↗
                      </a>
                      <span className="text-xs text-slate-400">{formatDate(r.ReportReceivedDate)}</span>
                      <span className="text-xs text-slate-500">{r.ModelYear} {r.Model}</span>
                    </div>
                    <p className="text-sm text-slate-500">{r.Component}</p>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* What to do */}
      <section className="bg-blue-50 rounded-lg p-6 mb-10">
        <h2 className="text-lg font-bold mb-3">What Should You Do?</h2>
        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li><Link href="/vin" className="text-brand hover:underline">Check your VIN</Link> to see if your specific vehicle is affected</li>
          <li>Contact your dealer to schedule a free recall repair</li>
          <li>Sign up below to get notified about future recalls for your vehicle</li>
        </ol>
      </section>

      {/* Safety product affiliate card */}
      <SafetyProductRec />

      {/* Email capture */}
      <EmailCapture variant="banner" />

      {/* Back to reports */}
      <div className="mt-10 text-center">
        <Link href="/blog" className="text-brand font-medium hover:underline">&larr; All Reports</Link>
      </div>
    </article>
  );
}
