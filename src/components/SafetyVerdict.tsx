import Link from "next/link";
import {
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Car,
  HeartPulse,
  Phone,
  Calendar,
} from "lucide-react";
import type { Recall, VinDecode } from "@/lib/nhtsa";
import { verdict } from "@/lib/severity";
import { makeSlug, modelSlug } from "@/lib/nhtsa";
import RecallCard from "./RecallCard";
import ScoreDial from "./ScoreDial";

interface Props {
  recalls: Recall[];
  decoded: VinDecode | null;
  vin: string;
}

/**
 * The hero output of a VIN check. Rendered server-side, streamed into the
 * VIN results page. Shows the one-screen verdict + top recall + counts.
 */
export default function SafetyVerdict({ recalls, decoded, vin }: Props) {
  const v = verdict(recalls);

  // Tier-specific color tokens
  const tierClasses = {
    crit: {
      ribbon: "ribbon-crit",
      surface: "bg-[var(--color-crit-soft)]",
      accent: "text-[var(--color-crit)]",
      label: "text-[var(--color-crit-ink)]",
      pill:  "bg-[var(--color-crit)] text-white",
      ringHex: "#d9342b",
    },
    watch: {
      ribbon: "ribbon-watch",
      surface: "bg-[var(--color-watch-soft)]",
      accent: "text-[var(--color-watch)]",
      label: "text-[var(--color-watch-ink)]",
      pill:  "bg-[var(--color-watch)] text-white",
      ringHex: "#c27803",
    },
    clear: {
      ribbon: "ribbon-clear",
      surface: "bg-[var(--color-clear-soft)]",
      accent: "text-[var(--color-clear)]",
      label: "text-[var(--color-clear-ink)]",
      pill:  "bg-[var(--color-clear)] text-white",
      ringHex: "#17803a",
    },
  }[v.tier];

  const VerdictIcon =
    v.tier === "crit"  ? AlertOctagon :
    v.tier === "watch" ? AlertTriangle :
                         ShieldCheck;

  const vehicleName = decoded?.Make
    ? `${decoded.ModelYear ?? ""} ${decoded.Make} ${decoded.Model ?? ""}`.trim()
    : "Your vehicle";

  return (
    <section>
      {/* ── Big Verdict Card ───────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-[var(--color-border)] ${tierClasses.ribbon} bg-white`}
      >
        {/* Tint gradient */}
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-40 pointer-events-none ${tierClasses.surface}`}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />

        <div className="relative p-6 md:p-10">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            {/* Left: verdict + vehicle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl grid place-items-center ${tierClasses.pill} animate-pulse-once shrink-0`}
                >
                  <VerdictIcon size={24} strokeWidth={2.5} />
                </div>
                <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500">
                  Safety Verdict
                </div>
              </div>

              <h1 className={`text-[34px] md:text-[48px] leading-[1.02] font-bold tracking-tight mb-2 ${tierClasses.label}`}>
                {v.label}
              </h1>
              <p className="text-slate-600 text-[15px] md:text-[17px] leading-snug max-w-[52ch]">
                {v.sub}
              </p>

              {/* Vehicle info row */}
              <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
                <Car size={16} className="text-slate-400" />
                <span className="font-semibold text-slate-900">{vehicleName}</span>
                <span className="font-mono text-[12px] text-slate-400 tracking-wider">{vin}</span>
              </div>
            </div>

            {/* Right: Dial */}
            <div className="shrink-0 self-center md:self-start">
              <ScoreDial score={v.score} color={tierClasses.ringHex} />
            </div>
          </div>

          {/* Count tiles */}
          {v.counts.total > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
              <CountTile
                icon={<AlertOctagon size={14} />}
                label="Critical"
                value={v.counts.crit}
                tone={v.counts.crit > 0 ? "crit" : "muted"}
              />
              <CountTile
                icon={<Flame size={14} />}
                label="Fire Risk"
                value={v.counts.fireRisk}
                tone={v.counts.fireRisk > 0 ? "crit" : "muted"}
              />
              <CountTile
                icon={<Car size={14} />}
                label="Crash Risk"
                value={v.counts.crashRisk}
                tone={v.counts.crashRisk > 0 ? "watch" : "muted"}
              />
              <CountTile
                icon={<HeartPulse size={14} />}
                label="Do Not Drive"
                value={v.counts.doNotDrive}
                tone={v.counts.doNotDrive > 0 ? "crit" : "muted"}
              />
            </div>
          )}

          {/* Primary action */}
          {v.counts.total > 0 && (
            <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
              <a
                href={`tel:+18003279646`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-[13px] hover:bg-slate-800 transition-colors"
              >
                <Phone size={14} /> NHTSA Hotline
              </a>
              {decoded?.Make && (
                <Link
                  href={`/recalls/${makeSlug(decoded.Make)}${decoded.Model ? `/${modelSlug(decoded.Model)}` : ""}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-slate-700 font-semibold text-[13px] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
                >
                  <Calendar size={14} /> All {decoded.Make} {decoded.Model} recalls
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Top recall promoted ──────────────────────────────────────── */}
      {v.topRecall && (
        <div className="mt-6">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
            Most urgent
          </div>
          <RecallCard recall={v.topRecall} defaultOpen />
        </div>
      )}
    </section>
  );
}

function CountTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "crit" | "watch" | "muted";
}) {
  const toneClasses =
    tone === "crit"
      ? "border-[var(--color-crit-ring)] bg-[var(--color-crit-soft)] text-[var(--color-crit-ink)]"
      : tone === "watch"
      ? "border-[var(--color-watch-ring)] bg-[var(--color-watch-soft)] text-[var(--color-watch-ink)]"
      : "border-[var(--color-border)] bg-white text-slate-400";
  return (
    <div className={`rounded-xl border p-3 ${toneClasses}`}>
      <div className="flex items-center justify-between mb-1 text-[11px] uppercase tracking-wider font-semibold">
        <span className="flex items-center gap-1.5">{icon} {label}</span>
      </div>
      <div className="text-[22px] font-bold tabular-nums leading-none">{value}</div>
    </div>
  );
}
