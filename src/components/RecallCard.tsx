"use client";

import { useState, useId } from "react";
import {
  ShieldAlert,
  Disc3,
  Zap,
  Cog,
  Navigation,
  Fuel,
  Cpu,
  Lightbulb,
  Wrench,
  CircleDot,
  CarFront,
  AlertTriangle,
  Armchair,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import type { Recall } from "@/lib/nhtsa";
import { nhtsaRecallUrl, formatDate } from "@/lib/nhtsa";
import { scoreRecall, CATEGORY_LABELS, daysSince } from "@/lib/severity";
import type { IconName } from "@/lib/severity";

interface Props {
  recall: Recall;
  defaultOpen?: boolean;
  className?: string;
  /** Add content-visibility: auto — use on long lists below the fold */
  deferPaint?: boolean;
}

const ICON_MAP: Record<IconName, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  "shield-alert": ShieldAlert,
  "disc-3": Disc3,
  "zap": Zap,
  "cog": Cog,
  "navigation": Navigation,
  "fuel": Fuel,
  "seat": Armchair,
  "cpu": Cpu,
  "lightbulb": Lightbulb,
  "wrench": Wrench,
  "circle-dot": CircleDot,
  "car-front": CarFront,
  "alert-triangle": AlertTriangle,
};

export default function RecallCard({ recall, defaultOpen = false, className = "", deferPaint = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const regionId = useId();

  const severity = scoreRecall(recall);
  const Icon = ICON_MAP[severity.icon] ?? AlertTriangle;
  const days = daysSince(recall.ReportReceivedDate);

  const ribbonClass =
    severity.tier === "crit"  ? "ribbon-crit"  :
    severity.tier === "watch" ? "ribbon-watch" :
                                "ribbon-clear";
  const tintBg =
    severity.tier === "crit"  ? "bg-[var(--color-crit-soft)]"  :
    severity.tier === "watch" ? "bg-[var(--color-watch-soft)]" :
                                "bg-white";
  const iconColor =
    severity.tier === "crit"  ? "text-[var(--color-crit)]"  :
    severity.tier === "watch" ? "text-[var(--color-watch)]" :
                                "text-slate-500";

  function copyCampaign(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard?.writeText(recall.NHTSACampaignNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article
      className={`group relative rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden transition-all ${ribbonClass} ${deferPaint ? "cv-auto" : ""} ${className}`}
    >
      {/* Severity tint on critical/watch */}
      {severity.tier !== "clear" && (
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-24 pointer-events-none ${tintBg}`}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      )}

      <div className="relative p-5 md:p-6">
        {/* Row 1: icon + category + campaign id + date */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`shrink-0 w-9 h-9 rounded-lg grid place-items-center border border-[var(--color-border)] bg-white ${iconColor}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 leading-none">
              {CATEGORY_LABELS[severity.category]}
            </div>
            <button
              onClick={copyCampaign}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-[var(--color-brand)] transition-colors cursor-pointer"
              title="Copy campaign number"
            >
              {recall.NHTSACampaignNumber}
              {copied ? <Check size={11} /> : <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-mono shrink-0">
            {formatDate(recall.ReportReceivedDate) || "—"}
            {days != null && days > 0 && (
              <div className="text-slate-300 tabular-nums">{days} {days === 1 ? "day" : "days"} ago</div>
            )}
          </div>
        </div>

        {/* Row 2: headline */}
        <h3 className="text-[17px] md:text-[18px] font-semibold text-slate-900 leading-snug mb-2">
          {severity.hook}
        </h3>
        {recall.Component && (
          <div className="text-[13px] text-slate-500 mb-3 line-clamp-1">
            Affected: <span className="text-slate-600">{recall.Component}</span>
            {recall.ModelYear && <> · <span className="font-mono text-slate-600">{recall.ModelYear}</span></>}
          </div>
        )}

        {/* Row 3: badges */}
        {severity.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {severity.badges.map((b) => {
              const isCrit = b === "DO NOT DRIVE" || b === "FIRE RISK";
              return (
                <span
                  key={b}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    isCrit
                      ? "bg-[var(--color-crit)] text-white"
                      : severity.tier === "crit"
                      ? "bg-[var(--color-crit-ring)] text-[var(--color-crit-ink)]"
                      : "bg-[var(--color-watch-ring)] text-[var(--color-watch-ink)]"
                  }`}
                >
                  {b}
                </span>
              );
            })}
          </div>
        )}

        {/* Row 4: CTAs */}
        <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={regionId}
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 hover:text-[var(--color-brand)] transition-colors cursor-pointer"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
            {open ? "Hide details" : "Show details"}
          </button>
          <a
            href={nhtsaRecallUrl(recall.NHTSACampaignNumber)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-[var(--color-brand)] transition-colors"
          >
            NHTSA <ExternalLink size={12} />
          </a>
        </div>

        {/* Expanded detail */}
        <div
          id={regionId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 text-[13.5px] leading-relaxed border-t border-[var(--color-border)] pt-4">
              {recall.Summary && (
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">Summary</div>
                  <p className="text-slate-600">{recall.Summary}</p>
                </div>
              )}
              {recall.Consequence && (
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-crit)] mb-1">Consequence</div>
                  <p className="text-slate-600">{recall.Consequence}</p>
                </div>
              )}
              {recall.Remedy && (
                <div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-clear)] mb-1">Remedy</div>
                  <p className="text-slate-600">{recall.Remedy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
