"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import { isValidVinFormat } from "@/lib/vinPositions";

/**
 * Appears fixed below the header once the user scrolls past the main
 * in-page VIN checker. The hero VIN checker is marked with data-vin-hero
 * so we can observe it with IntersectionObserver and toggle the bar when
 * it leaves the viewport.
 *
 * If a page has no VIN hero (trends, blog, etc.), we fall back to a
 * scroll threshold so the bar still surfaces after some downward scroll.
 *
 * The bar lives inside layout.tsx so every page gets it automatically.
 */
export default function StickyVinBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [vin, setVin] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Never show on VIN result pages — they already ARE the result.
  const hideOnRoute = pathname?.startsWith("/vin/");

  useEffect(() => {
    if (hideOnRoute) {
      setVisible(false);
      return;
    }

    const hero = document.querySelector<HTMLElement>("[data-vin-hero]");

    if (hero) {
      // Observe the hero. Bar appears once the hero is fully out of view above.
      const io = new IntersectionObserver(
        ([entry]) => {
          // `isIntersecting` is true when any pixel is in view.
          // We want the bar ONLY when the hero is completely above the viewport.
          const pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          setVisible(pastHero);
        },
        { rootMargin: "-56px 0px 0px 0px" } // account for sticky header height
      );
      io.observe(hero);
      return () => io.disconnect();
    }

    // Fallback: no hero on this page → show after 400px of scroll.
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, hideOnRoute]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
    setVin(raw);
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vin) {
      inputRef.current?.focus();
      return;
    }
    if (vin.length !== 17 || !isValidVinFormat(vin)) {
      setError("17 chars, no I/O/Q");
      return;
    }
    setError("");
    router.push(`/vin/${vin}`);
    // Collapse the input value after submit so it's clean on return
    setVin("");
  }

  if (hideOnRoute) return null;

  return (
    <div
      className={`vt-sticky-vin fixed left-0 right-0 top-14 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3"
      >
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 shrink-0">
          <ShieldCheck size={13} className="text-[var(--color-brand)]" />
          Check a VIN
        </div>
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={vin}
            onChange={handleChange}
            placeholder="Enter your 17-character VIN"
            aria-label="Vehicle Identification Number (VIN)"
            maxLength={17}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-white text-[13px] font-mono tracking-wider outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
          />
        </div>
        {error && (
          <span className="hidden md:inline text-[11px] text-[var(--color-crit)] font-medium shrink-0">
            {error}
          </span>
        )}
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[var(--color-brand)] text-white font-semibold text-[12px] px-3 py-1.5 hover:bg-[#1635a1] active:scale-[0.98] transition-all cursor-pointer"
        >
          Check <ArrowRight size={12} />
        </button>
      </form>
    </div>
  );
}
