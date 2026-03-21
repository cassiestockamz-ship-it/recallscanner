import Link from "next/link";
import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Vehicle Recall Brands",
  description:
    "Browse safety recalls by vehicle brand. Find open recalls for Ford, Toyota, Honda, Chevrolet, and 30+ other manufacturers. Free NHTSA recall data.",
};

export default function RecallsIndex() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Vehicle Recalls by Brand</h1>
      <p className="text-slate-500 mb-8">
        Select a manufacturer to view all safety recalls. Data sourced from NHTSA.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {POPULAR_MAKES.map((make) => (
          <Link
            key={make}
            href={`/recalls/${makeSlug(make)}`}
            className="bg-white border border-border rounded-lg p-5 hover:border-brand hover:shadow-sm transition-all group"
          >
            <div className="font-semibold text-lg text-slate-800 group-hover:text-brand transition-colors">
              {make}
            </div>
            <div className="text-sm text-slate-400 mt-1">View all recalls &rarr;</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
