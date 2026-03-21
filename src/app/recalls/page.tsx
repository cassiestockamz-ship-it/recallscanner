import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import type { Metadata } from "next";
import SearchFilter from "@/components/SearchFilter";

export const metadata: Metadata = {
  title: "All Vehicle Recall Brands",
  description:
    "Browse safety recalls by vehicle brand. Find open recalls for Ford, Toyota, Honda, Chevrolet, and 30+ other manufacturers. Free NHTSA recall data.",
  alternates: { canonical: "https://www.recallscanner.com/recalls" },
};

export default function RecallsIndex() {
  const items = POPULAR_MAKES.map((make) => ({
    label: make,
    href: `/recalls/${makeSlug(make)}`,
    subtitle: "View all recalls →",
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Vehicle Recalls by Brand</h1>
      <p className="text-slate-500 mb-8">
        Select a manufacturer to view all safety recalls. Data sourced from NHTSA.
      </p>
      <SearchFilter items={items} placeholder="Search brands..." columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4" />
    </div>
  );
}
