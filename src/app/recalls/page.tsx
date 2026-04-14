import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import type { Metadata } from "next";
import SearchFilter from "@/components/SearchFilter";
import VinChecker from "@/components/VinChecker";

export const metadata: Metadata = {
  title: "All Vehicle Recall Brands",
  description:
    "Browse safety recalls by vehicle brand. Severity-scored lookups for Ford, Toyota, Honda, Chevrolet, and 30+ other manufacturers. Free NHTSA recall data.",
  alternates: { canonical: "https://www.recallscanner.com/recalls" },
};

export default function RecallsIndex() {
  const items = POPULAR_MAKES.map((make) => ({
    label: make,
    href: `/recalls/${makeSlug(make)}`,
    subtitle: "View recalls →",
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-2">
          Browse by Manufacturer
        </div>
        <h1 className="text-[36px] md:text-[48px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-2">
          Recalls by Brand
        </h1>
        <p className="text-slate-600 text-[16px] max-w-[58ch] leading-snug">
          {POPULAR_MAKES.length} manufacturers tracked. Pick one to see every model with open campaigns — or skip the list and check a specific VIN below.
        </p>
      </header>

      {/* VIN shortcut */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 md:p-7 mb-10">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
          Check a specific vehicle
        </div>
        <h2 className="text-[20px] font-bold text-slate-900 mb-4">
          Look up any VIN
        </h2>
        <VinChecker compact />
      </section>

      <h2 className="text-[20px] font-bold text-slate-900 mb-4">All brands</h2>
      <SearchFilter
        items={items}
        placeholder="Search brands…"
        columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      />
    </div>
  );
}
