import Link from "next/link";
import { ArrowRight, Search, BookOpen, Gauge, ShieldAlert } from "lucide-react";
import VinChecker from "@/components/VinChecker";

export const metadata = {
  title: "Page not found",
  description:
    "We couldn't find that page. Check a VIN, browse recalls by brand, or read one of our plain-English guides.",
  robots: { index: false, follow: true },
};

const RECOVERY_CARDS = [
  {
    href: "/recalls",
    title: "Browse by brand",
    body: "32 manufacturers tracked, severity-scored across every model.",
    icon: Search,
  },
  {
    href: "/most-recalled",
    title: "Latest critical recalls",
    body: "The newest campaigns across every brand, sorted by severity.",
    icon: Gauge,
  },
  {
    href: "/guides",
    title: "Read a guide",
    body: "Plain-English walkthroughs of how recalls work and what to do.",
    icon: BookOpen,
  },
  {
    href: "/trends",
    title: "Recall trends",
    body: "Years, brands, and components. Updated daily from NHTSA.",
    icon: ShieldAlert,
  },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-20">
      {/* Hero */}
      <header className="text-center mb-12">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-3">
          Error 404
        </div>
        <h1 className="text-[44px] md:text-[60px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-4">
          We couldn&apos;t find that page.
        </h1>
        <p className="text-slate-600 text-[17px] max-w-[52ch] mx-auto leading-snug">
          The link may be broken, the page may have moved, or the URL may be
          mistyped. Here are a few places to land safely.
        </p>
      </header>

      {/* VIN checker — the fastest recovery path */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 md:p-8 mb-10">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
          If you came here to check a vehicle
        </div>
        <h2 className="text-[22px] font-bold text-slate-900 mb-4">
          Start with a VIN
        </h2>
        <VinChecker compact />
      </section>

      {/* Recovery grid */}
      <section className="mb-10">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4">
          Or go somewhere useful
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RECOVERY_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-brand)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-xl grid place-items-center bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand)] group-hover:bg-[var(--color-brand)] group-hover:text-white transition-colors">
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-[15px] group-hover:text-[var(--color-brand)] transition-colors flex items-center justify-between gap-2">
                      <span>{c.title}</span>
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-slate-300 group-hover:text-[var(--color-brand)] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <p className="text-[13px] text-slate-500 leading-snug mt-1">
                      {c.body}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-center text-[12px] text-slate-400">
        Think this is a mistake?{" "}
        <Link href="/contact" className="text-[var(--color-brand)] hover:underline">
          Tell us
        </Link>{" "}
        so we can fix the broken link.
      </p>
    </div>
  );
}
