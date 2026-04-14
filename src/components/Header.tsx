import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 font-bold text-[17px] text-slate-900"
        >
          <span className="w-7 h-7 grid place-items-center rounded-lg bg-[var(--color-brand)] text-white group-hover:scale-105 transition-transform">
            <ShieldCheck size={16} strokeWidth={2.5} />
          </span>
          RecallScanner
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-[13px] font-medium text-slate-600">
          <Link href="/recalls" className="hover:text-[var(--color-brand)] transition-colors">
            Brands
          </Link>
          <Link href="/most-recalled" className="hidden sm:inline hover:text-[var(--color-brand)] transition-colors">
            Latest
          </Link>
          <Link href="/trends" className="hidden sm:inline hover:text-[var(--color-brand)] transition-colors">
            Trends
          </Link>
          <Link href="/blog" className="hidden md:inline hover:text-[var(--color-brand)] transition-colors">
            Reports
          </Link>
          <Link
            href="/vin"
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-white font-semibold text-[12px] hover:bg-[#1635a1] transition-colors"
          >
            Check VIN
          </Link>
        </nav>
      </div>
    </header>
  );
}
