"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, ArrowRight, Info } from "lucide-react";
import VinDecoderStrip from "./VinDecoderStrip";
import { isValidVinFormat } from "@/lib/vinPositions";

interface Props {
  /** Compact form variant used in-page (less chrome) */
  compact?: boolean;
  /** Auto-focus on mount (desktop hero only) */
  autoFocus?: boolean;
}

// Valid-check-digit example VINs for the typewriter placeholder.
// Real-looking but randomised serials, so the decoder strip demos cleanly.
const EXAMPLE_VINS = [
  "5YJ3E1EA3KF317801", // Tesla Model 3 · 2019
  "1FTFW1E55NFA12345", // Ford F-150 · 2022
  "JTDKN3DU8F0410000", // Toyota Prius · 2015
  "2HGFC2F54LH512345", // Honda Civic · 2020
];

export default function VinChecker({ compact = false, autoFocus = false }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [vin, setVin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placeholder, setPlaceholder] = useState("Enter your 17-character VIN");

  // Typewriter placeholder — cycles example VINs when the input is empty.
  useEffect(() => {
    if (vin.length > 0) return;
    let cancelled = false;
    let i = 0;
    let charIndex = 0;
    let phase: "typing" | "pause" | "erasing" = "typing";

    const tick = () => {
      if (cancelled) return;
      const sample = EXAMPLE_VINS[i % EXAMPLE_VINS.length];
      if (phase === "typing") {
        charIndex++;
        setPlaceholder("e.g. " + sample.slice(0, charIndex));
        if (charIndex >= sample.length) {
          phase = "pause";
          setTimeout(tick, 1400);
          return;
        }
      } else if (phase === "pause") {
        phase = "erasing";
      } else {
        charIndex--;
        setPlaceholder("e.g. " + sample.slice(0, charIndex));
        if (charIndex <= 0) {
          phase = "typing";
          i++;
        }
      }
      setTimeout(tick, phase === "typing" ? 65 : 35);
    };

    const start = setTimeout(tick, 900);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [vin]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
    setVin(raw);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vin) {
      setError("Paste or type your VIN to begin.");
      inputRef.current?.focus();
      return;
    }
    if (vin.length !== 17) {
      setError(`VIN must be 17 characters. You have ${vin.length}.`);
      return;
    }
    if (!isValidVinFormat(vin)) {
      setError("VINs cannot contain I, O, or Q.");
      return;
    }
    setError("");
    setSubmitting(true);
    router.push(`/vin/${vin}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      id="vin-checker"
    >
      {/* Decoder strip */}
      <VinDecoderStrip vin={vin} compact={compact} />

      {/* Input + button — tagged vt-vin-hero so it morphs between pages */}
      <div className={`vt-vin-hero relative mt-3 ${compact ? "" : "shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.22)]"} rounded-2xl bg-white border border-[var(--color-border)] focus-within:border-[var(--color-brand)] focus-within:ring-4 focus-within:ring-[var(--color-brand)]/10 transition-all`}>
        <div className="flex items-center gap-2 pl-4 pr-2 py-2">
          <Search size={18} className="text-slate-400 shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={vin}
            onChange={handleChange}
            placeholder={placeholder}
            aria-label="Vehicle Identification Number (VIN)"
            maxLength={17}
            className={`flex-1 min-w-0 bg-transparent outline-none font-mono tracking-[0.12em] text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal ${compact ? "text-[15px] py-2" : "text-[17px] py-3"}`}
          />
          <button
            type="submit"
            disabled={submitting}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand)] text-white font-semibold hover:bg-[#1635a1] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait ${compact ? "px-3 py-2 text-[13px]" : "px-5 py-3 text-[15px]"}`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Checking
              </>
            ) : (
              <>
                Check <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper / error line */}
      <div className="mt-2 min-h-[20px] text-[12px] flex items-center gap-1.5">
        {error ? (
          <span className="text-[var(--color-crit)] font-medium">{error}</span>
        ) : (
          <>
            <Info size={12} className="text-slate-400" />
            <span className="text-slate-500">
              Your VIN lives on the driver-side dashboard, the door jamb, or your registration card.
              We don't store it.
            </span>
          </>
        )}
      </div>
    </form>
  );
}
