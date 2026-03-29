import Link from "next/link";
import { getRecallsByYear, getRecallsByBrand, getRecallsByComponent, getMostRecalledModels } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehicle Recall Trends — Data & Statistics",
  description:
    "Explore vehicle recall trends across years, brands, and components. See which manufacturers have the most recalls and what parts fail most often. Updated daily from NHTSA data.",
  alternates: { canonical: "https://www.recallscanner.com/trends" },
};

export const revalidate = 3600;

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function TrendsPage() {
  const [byYear, byBrand, byComponent, topModels] = await Promise.all([
    getRecallsByYear(),
    getRecallsByBrand(),
    getRecallsByComponent(),
    getMostRecalledModels(10),
  ]);

  const maxYear = Math.max(...byYear.map(y => y.count));
  const maxBrand = byBrand[0]?.count || 1;
  const maxComponent = byComponent[0]?.count || 1;
  const maxModel = topModels[0]?.count || 1;
  const totalRecalls = byYear.reduce((s, y) => s + y.count, 0);
  const totalBrands = byBrand.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Vehicle Recall Trends</h1>
      <p className="text-slate-500 mb-8">
        {totalRecalls.toLocaleString()} recalls across {totalBrands} brands. Updated daily from NHTSA.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{totalRecalls.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total Recalls</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{totalBrands}</div>
          <div className="text-xs text-slate-500">Brands Tracked</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{byYear[0]?.count || 0}</div>
          <div className="text-xs text-slate-500">Recalls in {byYear[0]?.year || "2026"}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-brand">{byBrand[0]?.make || "N/A"}</div>
          <div className="text-xs text-slate-500">Most Recalled Brand</div>
        </div>
      </div>

      {/* Recalls by Year */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Recalls by Year</h2>
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="space-y-3">
            {byYear.filter(y => parseInt(y.year) >= 2016).map(({ year, count }) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-12">{year}</span>
                <div className="flex-1">
                  <Bar value={count} max={maxYear} color="bg-brand" />
                </div>
                <span className="text-sm text-slate-500 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-column: Brands + Components */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* By Brand */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recalls by Brand</h2>
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="space-y-3">
              {byBrand.slice(0, 12).map(({ make, makeSlug, count }) => (
                <div key={make} className="flex items-center gap-3">
                  <Link
                    href={`/recalls/${makeSlug}`}
                    className="text-sm font-medium text-slate-700 w-28 truncate hover:text-brand transition-colors"
                  >
                    {make}
                  </Link>
                  <div className="flex-1">
                    <Bar value={count} max={maxBrand} color="bg-blue-500" />
                  </div>
                  <span className="text-sm text-slate-500 w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* By Component */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recalls by Component</h2>
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="space-y-3">
              {byComponent.filter(c => c.category !== "Other").map(({ category, count }) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-28 truncate">{category}</span>
                  <div className="flex-1">
                    <Bar value={count} max={maxComponent} color="bg-amber-500" />
                  </div>
                  <span className="text-sm text-slate-500 w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Most Recalled Models */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Most Recalled Models</h2>
        <div className="bg-white border border-border rounded-lg p-5">
          <div className="space-y-3">
            {topModels.map(({ make, model, makeSlug, modelSlug, count }, i) => (
              <div key={`${makeSlug}/${modelSlug}`} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-5">{i + 1}</span>
                <Link
                  href={`/recalls/${makeSlug}/${modelSlug}`}
                  className="text-sm font-medium text-slate-700 w-44 truncate hover:text-brand transition-colors"
                >
                  {make} {model}
                </Link>
                <div className="flex-1">
                  <Bar value={count} max={maxModel} color="bg-red-500" />
                </div>
                <span className="text-sm text-slate-500 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-surface rounded-lg p-6 text-center">
        <h2 className="font-semibold text-lg mb-2">Check Your Vehicle</h2>
        <p className="text-sm text-slate-500 mb-4">Look up recalls for your specific vehicle by VIN or browse by brand.</p>
        <div className="flex justify-center gap-4">
          <Link href="/vin" className="text-brand font-medium hover:underline">VIN Lookup &rarr;</Link>
          <Link href="/recalls" className="text-brand font-medium hover:underline">Browse Brands &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
