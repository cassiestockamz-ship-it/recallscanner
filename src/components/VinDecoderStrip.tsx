"use client";

import { useMemo } from "react";
import { livePartialDecode, SLOT_META } from "@/lib/vinPositions";

interface Props {
  vin: string;
  /** Visually compact mode (shrink slot widths) */
  compact?: boolean;
  /** Show the label row under the slots */
  showLabels?: boolean;
}

/**
 * 17-slot live decoder. Slots AND labels live on the same 17-column
 * CSS grid so label spans (WMI 3, VDS 5, ✓ 1, Year 1, Plant 1, Serial 6)
 * always line up exactly under the characters they describe.
 *
 * Zero network calls. WMI / model year / check digit computed client-side.
 */
export default function VinDecoderStrip({ vin, compact = false, showLabels = true }: Props) {
  const live = useMemo(() => livePartialDecode(vin), [vin]);

  const padded = (vin.toUpperCase() + "                 ").slice(0, 17);
  const chars = padded.split("");

  // Grid template: 17 equal columns with a tight gap.
  const gridCols = { gridTemplateColumns: "repeat(17, minmax(0, 1fr))" };
  const slotHeight = compact ? "h-7 text-[11px]" : "h-9 sm:h-10 text-[13px] sm:text-[15px]";

  return (
    <div className="w-full">
      {/* Description strip — e.g. "[US] USA · Ford · 2019" */}
      <div className="min-h-[22px] mb-2 text-[12px] font-medium text-slate-500 flex items-center gap-2">
        {live.description ? (
          <span className="inline-flex items-center gap-1.5 animate-fade-up">
            {live.wmi && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold tracking-wider font-mono">
                {live.wmi.code}
              </span>
            )}
            <span className="text-slate-600">{live.description}</span>
            {live.checkValid === true && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-clear-soft)] text-[var(--color-clear-ink)]">
                Valid
              </span>
            )}
            {live.checkValid === false && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-crit-soft)] text-[var(--color-crit-ink)]">
                Check digit
              </span>
            )}
          </span>
        ) : (
          <span className="text-slate-300">Start typing. We&apos;ll decode your VIN as you go.</span>
        )}
      </div>

      {/* 17-slot grid */}
      <div className="grid gap-[2px] sm:gap-1 font-mono" style={gridCols} aria-hidden>
        {chars.map((ch, i) => {
          const meta = SLOT_META[i];
          const filled = ch.trim().length > 0;
          const isCheck = meta.segment === "check";
          const checkBad = isCheck && live.checkValid === false && filled;

          // Segment backgrounds
          let bg = "bg-slate-50 text-slate-300 border-slate-200";
          if (filled) {
            switch (meta.segment) {
              case "wmi":    bg = "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"; break;
              case "vds":    bg = "bg-slate-900 text-white border-slate-900"; break;
              case "check":  bg = checkBad
                ? "bg-[var(--color-crit)] text-white border-[var(--color-crit)] animate-shake"
                : "bg-[var(--color-clear)] text-white border-[var(--color-clear)]"; break;
              case "year":   bg = "bg-[var(--color-brand-light)] text-white border-[var(--color-brand-light)]"; break;
              case "plant":  bg = "bg-slate-700 text-white border-slate-700"; break;
              case "serial": bg = "bg-white text-slate-700 border-slate-300"; break;
            }
          }

          return (
            <div
              key={i}
              className={`rounded-[5px] border grid place-items-center font-semibold transition-colors duration-150 ${slotHeight} ${bg}`}
            >
              {filled ? ch : ""}
            </div>
          );
        })}
      </div>

      {/* Labels row — same 17-column grid with spans matching the segments */}
      {showLabels && (
        <div
          className="hidden md:grid gap-[2px] sm:gap-1 mt-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-sans font-semibold"
          style={gridCols}
          aria-hidden
        >
          <div className="col-span-3 text-center">WMI</div>
          <div className="col-span-5 text-center">Vehicle Descriptor</div>
          <div className="col-span-1 text-center">✓</div>
          <div className="col-span-1 text-center">Year</div>
          <div className="col-span-1 text-center">Plant</div>
          <div className="col-span-6 text-center">Serial</div>
        </div>
      )}
    </div>
  );
}
