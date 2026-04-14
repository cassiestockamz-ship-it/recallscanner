"use client";

import { useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, ShieldCheck, Search, X, Filter } from "lucide-react";
import type { Recall, Complaint } from "@/lib/nhtsa";
import { scoreRecall, type Tier } from "@/lib/severity";
import RecallCard from "./RecallCard";

interface Props {
  recalls: Recall[];
  complaints: Complaint[];
  make: string;
  modelDisplay: string;
}

const TIER_META: Record<Tier, { label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; color: string; description: string }> = {
  crit:  { label: "Action needed", icon: AlertOctagon,   color: "var(--color-crit)",  description: "Urgent — schedule the free repair now." },
  watch: { label: "Watch",          icon: AlertTriangle,  color: "var(--color-watch)", description: "Schedule the free repair at your next service." },
  clear: { label: "Lower severity", icon: ShieldCheck,    color: "var(--color-clear)", description: "Still important, but not flagged critical." },
};

export default function RecallBuckets({ recalls, complaints, make, modelDisplay }: Props) {
  // Score every recall once
  const scored = useMemo(
    () =>
      recalls
        .map((r) => ({ recall: r, severity: scoreRecall(r) }))
        .sort((a, b) => b.severity.score - a.severity.score),
    [recalls]
  );

  // Year options
  const years = useMemo(() => {
    const s = new Set<string>();
    for (const r of recalls) if (r.ModelYear) s.add(r.ModelYear);
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [recalls]);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // Critical is always open, lower tiers default to closed so users aren't
  // drowning in 40+ card scroll walls. They can tap to expand.
  const [openBuckets, setOpenBuckets] = useState<Record<Tier, boolean>>({
    crit: true,
    watch: false,
    clear: false,
  });

  const filtered = useMemo(() => {
    return scored.filter(({ recall }) => {
      if (selectedYear && recall.ModelYear !== selectedYear) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${recall.Component} ${recall.Summary} ${recall.Consequence} ${recall.NHTSACampaignNumber}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [scored, selectedYear, query]);

  const buckets = useMemo(() => {
    const b: Record<Tier, typeof filtered> = { crit: [], watch: [], clear: [] };
    for (const item of filtered) b[item.severity.tier].push(item);
    return b;
  }, [filtered]);

  const totals = {
    total: scored.length,
    crit: scored.filter((s) => s.severity.tier === "crit").length,
    watch: scored.filter((s) => s.severity.tier === "watch").length,
    clear: scored.filter((s) => s.severity.tier === "clear").length,
    fireRisk: scored.filter((s) => s.severity.badges.includes("FIRE RISK")).length,
    crashRisk: scored.filter((s) => s.severity.badges.includes("CRASH RISK")).length,
    doNotDrive: scored.filter((s) => s.severity.badges.includes("DO NOT DRIVE")).length,
    injuries: complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0),
    deaths: complaints.reduce((s, c) => s + (c.numberOfDeaths || 0), 0),
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setQuery("");
  };
  const filtersActive = selectedYear !== null || query.length > 0;

  return (
    <div className="space-y-6">
      {/* ── Summary bar ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <span className="font-bold text-slate-900 tabular-nums">
            {totals.total} recall{totals.total === 1 ? "" : "s"}
          </span>
          {totals.crit > 0 && (
            <span className="flex items-center gap-1.5 text-[var(--color-crit)] font-semibold">
              <AlertOctagon size={14} /> {totals.crit} critical
            </span>
          )}
          {totals.doNotDrive > 0 && (
            <span className="flex items-center gap-1.5 text-[var(--color-crit)] font-semibold">
              🛑 {totals.doNotDrive} do-not-drive
            </span>
          )}
          {totals.fireRisk > 0 && (
            <span className="flex items-center gap-1.5 text-[var(--color-watch-ink)] font-semibold">
              🔥 {totals.fireRisk} fire risk
            </span>
          )}
          {totals.crashRisk > 0 && (
            <span className="flex items-center gap-1.5 text-[var(--color-watch-ink)] font-semibold">
              💥 {totals.crashRisk} crash risk
            </span>
          )}
          {totals.injuries > 0 && (
            <span className="text-slate-500">{totals.injuries.toLocaleString()} injuries reported</span>
          )}
          {totals.deaths > 0 && (
            <span className="text-[var(--color-crit)] font-semibold">{totals.deaths} deaths</span>
          )}
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${modelDisplay} recalls by component, campaign, or keyword…`}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-[14px] outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Year pills */}
        {years.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
              <Filter size={11} /> Model year
            </div>
            <div className="flex flex-wrap gap-1.5">
              <YearPill
                label="All"
                active={selectedYear === null}
                onClick={() => setSelectedYear(null)}
              />
              {years.map((y) => (
                <YearPill
                  key={y}
                  label={y}
                  active={selectedYear === y}
                  onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                />
              ))}
            </div>
          </div>
        )}

        {filtersActive && (
          <div className="flex items-center justify-between pt-1 text-[12px]">
            <span className="text-slate-500">
              Showing {filtered.length} of {totals.total} recalls
            </span>
            <button
              onClick={clearFilters}
              className="text-[var(--color-brand)] hover:underline font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Buckets ─────────────────────────────────────────────── */}
      {(["crit", "watch", "clear"] as Tier[]).map((tier) => {
        const items = buckets[tier];
        if (items.length === 0) return null;
        const meta = TIER_META[tier];
        const Icon = meta.icon;
        const isOpen = openBuckets[tier];
        return (
          <section key={tier}>
            <button
              onClick={() => setOpenBuckets((b) => ({ ...b, [tier]: !b[tier] }))}
              className="w-full flex items-center gap-3 px-1 py-3 cursor-pointer group"
              aria-expanded={isOpen}
            >
              <div
                className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
                style={{ background: meta.color, color: "white" }}
              >
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-bold text-slate-900">{meta.label}</span>
                  <span className="text-[13px] tabular-nums text-slate-500">{items.length}</span>
                </div>
                <div className="text-[12px] text-slate-500">{meta.description}</div>
              </div>
              <span
                className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              >
                ›
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 pt-2">
                  {items.map((item, i) => (
                    <RecallCard
                      key={item.recall.NHTSACampaignNumber || i}
                      recall={item.recall}
                      deferPaint={i > 2}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
          <p className="text-slate-500 text-[14px]">
            No recalls match your filters{selectedYear ? ` for ${selectedYear}` : ""}.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-[var(--color-brand)] hover:underline font-medium cursor-pointer text-[13px]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Complaints section — kept, but now as a quiet footer section */}
      {complaints.length > 0 && (
        <details className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <summary className="cursor-pointer list-none flex items-center gap-2 font-semibold text-slate-700">
            <span className="inline-block w-4 text-center transition-transform group-open:rotate-90">›</span>
            Owner complaints ({complaints.length.toLocaleString()})
          </summary>
          <div className="mt-4 space-y-3">
            {complaints.slice(0, 8).map((c, i) => (
              <div key={c.odiNumber || i} className="rounded-xl border border-[var(--color-border)] p-4">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">{c.dateComplaintFiled}</span>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {c.modelYear} {c.model}
                  </span>
                  {c.crash && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[var(--color-crit-soft)] text-[var(--color-crit-ink)] px-1.5 py-0.5 rounded">
                      Crash
                    </span>
                  )}
                  {c.fire && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[var(--color-crit-soft)] text-[var(--color-crit-ink)] px-1.5 py-0.5 rounded">
                      Fire
                    </span>
                  )}
                </div>
                <div className="text-[13px] font-medium text-slate-700 mb-1">{c.components}</div>
                <p className="text-[13px] text-slate-500 leading-relaxed">{c.summary}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Complaints are self-reported to NHTSA by owners and are not verified by the agency.
          </p>
        </details>
      )}
    </div>
  );
}

function YearPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-[12px] font-mono font-semibold cursor-pointer transition-all ${
        active
          ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
          : "bg-white border-[var(--color-border)] text-slate-600 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
      }`}
    >
      {label}
    </button>
  );
}
