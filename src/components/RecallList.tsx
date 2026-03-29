"use client";

import { useState } from "react";
import type { Recall, Complaint } from "@/lib/nhtsa";
import { nhtsaRecallUrl, formatDate } from "@/lib/nhtsa";

interface Props {
  recalls: Recall[];
  complaints: Complaint[];
  make: string;
  modelDisplay: string;
}

export default function RecallList({ recalls, complaints, make, modelDisplay }: Props) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Group by year
  const yearMap = new Map<string, number>();
  for (const r of recalls) {
    const y = r.ModelYear || "Unknown";
    yearMap.set(y, (yearMap.get(y) || 0) + 1);
  }
  const yearEntries = Array.from(yearMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  // Filter recalls by selected year
  const filteredRecalls = selectedYear
    ? recalls.filter((r) => r.ModelYear === selectedYear)
    : recalls;

  const recentComplaints = complaints.slice(0, 10);

  return (
    <>
      {/* Year filter badges */}
      {yearEntries.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Filter by Model Year</h2>
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setSelectedYear(null)}
              className={`rounded-lg px-4 py-2 text-center border transition-colors cursor-pointer ${
                selectedYear === null
                  ? "bg-brand text-white border-brand"
                  : "bg-white border-border text-slate-600 hover:border-brand"
              }`}
            >
              <div className="font-semibold text-sm">All Years</div>
              <div className="text-xs opacity-70">{recalls.length} total</div>
            </button>
            {yearEntries.map(([year, count]) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={`rounded-lg px-4 py-2 text-center border transition-colors cursor-pointer ${
                  selectedYear === year
                    ? "bg-brand text-white border-brand"
                    : "bg-white border-border text-slate-600 hover:border-brand"
                }`}
              >
                <div className="font-semibold text-sm">{year}</div>
                <div className="text-xs opacity-70">
                  {count} recall{count !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Filtered recall count */}
      {selectedYear && (
        <div className="mb-4 text-sm text-slate-500">
          Showing {filteredRecalls.length} recall{filteredRecalls.length !== 1 ? "s" : ""} for {make} {modelDisplay} {selectedYear}
          <button
            onClick={() => setSelectedYear(null)}
            className="ml-2 text-brand hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* All recalls */}
      {filteredRecalls.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            {selectedYear ? `${selectedYear} Recalls` : "All Recalls"}
          </h2>
          <div className="space-y-4 mb-12">
            {filteredRecalls.map((r) => (
              <div
                key={r.NHTSACampaignNumber}
                className="bg-white border border-border rounded-lg p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <a
                    href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono bg-slate-100 text-brand px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    title="View on NHTSA.gov"
                  >
                    {r.NHTSACampaignNumber} ↗
                  </a>
                  <span className="text-xs text-slate-400">
                    {formatDate(r.ReportReceivedDate)}
                  </span>
                  <span className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded">
                    {r.ModelYear}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {r.Component}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {r.Summary}
                </p>
                {r.Consequence && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-danger">Risk:</span>{" "}
                    <span className="text-slate-600">{r.Consequence}</span>
                  </div>
                )}
                {r.Remedy && (
                  <div className="mt-1 text-sm">
                    <span className="font-medium text-safe">Remedy:</span>{" "}
                    <span className="text-slate-600">{r.Remedy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {filteredRecalls.length === 0 && selectedYear && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center mb-12">
          <p className="text-slate-500">No recalls found for {selectedYear} {make} {modelDisplay}.</p>
          <button onClick={() => setSelectedYear(null)} className="mt-2 text-brand hover:underline cursor-pointer">
            Show all years
          </button>
        </div>
      )}

      {/* Complaints */}
      {recentComplaints.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">
            Recent Owner Complaints ({complaints.length.toLocaleString()} total)
          </h2>
          <div className="space-y-4">
            {recentComplaints.map((c, i) => (
              <div
                key={c.odiNumber || i}
                className="bg-white border border-border rounded-lg p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(c.dateComplaintFiled)}
                  </span>
                  <span className="text-xs bg-blue-50 text-brand px-2 py-0.5 rounded">
                    {c.modelYear} {c.model}
                  </span>
                  {c.crash && (
                    <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded font-medium">
                      Crash reported
                    </span>
                  )}
                  {c.fire && (
                    <span className="text-xs bg-danger-light text-danger px-2 py-0.5 rounded font-medium">
                      Fire reported
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">
                  {c.components}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {c.summary}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
