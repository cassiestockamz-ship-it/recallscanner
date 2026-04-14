import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { makeSlug } from "@/lib/nhtsa";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px] text-slate-500">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-[16px] mb-3">
              <span className="w-6 h-6 grid place-items-center rounded-md bg-[var(--color-brand)] text-white">
                <ShieldCheck size={14} strokeWidth={2.5} />
              </span>
              RecallScanner
            </div>
            <p className="leading-relaxed">
              The verdict layer on top of NHTSA. Severity-scored recall lookups, plain-English summaries, free forever.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
              Popular Brands
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {["Ford", "Toyota", "Honda", "Chevrolet", "Hyundai", "Kia"].map((m) => (
                <Link
                  key={m}
                  href={`/recalls/${makeSlug(m)}`}
                  className="hover:text-[var(--color-brand)] transition-colors"
                >
                  {m} Recalls
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
              Tools
            </h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/vin" className="hover:text-[var(--color-brand)] transition-colors">
                VIN Recall Check
              </Link>
              <Link href="/recalls" className="hover:text-[var(--color-brand)] transition-colors">
                All Brands
              </Link>
              <Link href="/most-recalled" className="hover:text-[var(--color-brand)] transition-colors">
                Latest Recalls
              </Link>
              <Link href="/trends" className="hover:text-[var(--color-brand)] transition-colors">
                Recall Trends
              </Link>
              <Link href="/guides" className="hover:text-[var(--color-brand)] transition-colors">
                Recall Guides
              </Link>
              <Link href="/blog" className="hover:text-[var(--color-brand)] transition-colors">
                Monthly Reports
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
              About
            </h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/about" className="hover:text-[var(--color-brand)] transition-colors">
                About
              </Link>
              <Link href="/methodology" className="hover:text-[var(--color-brand)] transition-colors">
                Methodology
              </Link>
              <Link href="/contact" className="hover:text-[var(--color-brand)] transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-[var(--color-brand)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[var(--color-brand)] transition-colors">
                Terms
              </Link>
              <Link href="/disclaimer" className="hover:text-[var(--color-brand)] transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--color-border)] text-[12px] text-slate-400 space-y-1">
          <p>
            Recall data sourced daily from the{" "}
            <a
              href="https://www.nhtsa.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-brand)] underline"
            >
              National Highway Traffic Safety Administration (NHTSA)
            </a>
            .
          </p>
          <p>
            &copy; {new Date().getFullYear()} RecallScanner. Independent publisher. Not affiliated with NHTSA, any automaker, or any government agency.
          </p>
        </div>
      </div>
    </footer>
  );
}
