import Link from "next/link";
import { getRecallsByYear, getRecallsByBrand, getRecallsByComponent, getMostRecalledModels } from "@/lib/db";
import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/breadcrumb";

export const metadata: Metadata = {
  title: "Vehicle Recall Trends · Data & Statistics",
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

  // ── Schema.org Dataset markup ──
  // This puts the RecallScanner aggregate recall dataset into Google Dataset
  // Search. We describe what the dataset is, where it's sourced from, its
  // temporal coverage, refresh frequency, and the license (NHTSA data is
  // public domain; our aggregation layer is free-use with attribution).
  const currentYear = new Date().getFullYear();
  const earliestYear = byYear.length
    ? Math.min(...byYear.map((y) => parseInt(y.year, 10)).filter((n) => !isNaN(n)))
    : 2010;
  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "US Vehicle Safety Recall Dataset",
    alternateName: "RecallScanner Aggregate Recall Data",
    description:
      `An aggregated, severity-scored dataset of ${totalRecalls.toLocaleString()} US vehicle safety ` +
      `recall campaigns from ${earliestYear} through ${currentYear}, covering ${totalBrands} ` +
      `manufacturers. Sourced from NHTSA's public recall and complaint APIs, categorized by ` +
      `component and severity tier, refreshed daily by an automated ingestion pipeline.`,
    url: "https://www.recallscanner.com/trends",
    sameAs: "https://www.recallscanner.com/trends",
    keywords: [
      "vehicle recalls",
      "NHTSA",
      "auto safety",
      "recall campaigns",
      "vehicle safety",
      "automotive defects",
      "complaint data",
    ],
    creator: {
      "@type": "Organization",
      name: "RecallScanner",
      url: "https://www.recallscanner.com",
    },
    publisher: {
      "@type": "Organization",
      name: "RecallScanner",
      url: "https://www.recallscanner.com",
    },
    sourceOrganization: {
      "@type": "GovernmentOrganization",
      name: "National Highway Traffic Safety Administration",
      url: "https://www.nhtsa.gov",
    },
    temporalCoverage: `${earliestYear}/${currentYear}`,
    spatialCoverage: {
      "@type": "Country",
      name: "United States",
      alternateName: "US",
    },
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    isAccessibleForFree: true,
    datePublished: `${currentYear - 1}-01-01`,
    dateModified: new Date().toISOString().slice(0, 10),
    variableMeasured: [
      { "@type": "PropertyValue", name: "Recall campaign count", unitText: "count" },
      { "@type": "PropertyValue", name: "Complaints per model", unitText: "count" },
      { "@type": "PropertyValue", name: "Severity score", minValue: 0, maxValue: 100 },
      { "@type": "PropertyValue", name: "Injury reports", unitText: "count" },
      { "@type": "PropertyValue", name: "Crash reports", unitText: "count" },
      { "@type": "PropertyValue", name: "Fire reports", unitText: "count" },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: "https://www.recallscanner.com/trends",
    },
  };

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Trends", href: "/trends" },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
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
