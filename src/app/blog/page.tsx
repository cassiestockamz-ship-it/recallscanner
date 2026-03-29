import Link from "next/link";
import { getDistinctRecallMonths } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehicle Recall Reports — Monthly Safety Updates",
  description:
    "Monthly vehicle recall reports summarizing the latest safety recalls, trends, and what you need to know. Powered by NHTSA data.",
  alternates: { canonical: "https://www.recallscanner.com/blog" },
};

export const revalidate = 3600;

export default async function BlogIndex() {
  const months = await getDistinctRecallMonths();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Recall Reports</h1>
      <p className="text-slate-500 mb-8">
        Monthly summaries of vehicle safety recalls, trends, and what you need to know.
      </p>

      <div className="space-y-4">
        {months.map((m) => {
          const monthLabel = new Date(m.year, m.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
          return (
            <Link
              key={m.slug}
              href={`/blog/${m.slug}`}
              className="block bg-white border border-border rounded-lg p-5 hover:border-brand transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">{monthLabel} Vehicle Recalls</h2>
                  <p className="text-sm text-slate-500 mt-1">{m.count} recall{m.count !== 1 ? "s" : ""} reported to NHTSA</p>
                </div>
                <span className="text-sm text-brand font-medium shrink-0 ml-4">View report &rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 bg-surface rounded-lg p-6 text-center">
        <h2 className="font-semibold text-lg mb-2">Check Your Vehicle Now</h2>
        <p className="text-sm text-slate-500 mb-4">Don't wait for a monthly report. Look up your vehicle instantly.</p>
        <Link href="/vin" className="text-brand font-medium hover:underline">Free VIN Lookup &rarr;</Link>
      </div>
    </div>
  );
}
