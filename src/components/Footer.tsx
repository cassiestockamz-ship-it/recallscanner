import Link from "next/link";
import { makeSlug } from "@/lib/nhtsa";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-slate-500">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">RecallScanner</h3>
            <p>Free vehicle recall lookup powered by official NHTSA data. Check if your car, truck, or SUV has any open safety recalls.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Popular Brands</h3>
            <div className="grid grid-cols-2 gap-1">
              {["Ford", "Toyota", "Honda", "Chevrolet", "Hyundai", "Kia"].map((m) => (
                <Link key={m} href={`/recalls/${makeSlug(m)}`} className="hover:text-brand transition-colors">
                  {m} Recalls
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Tools</h3>
            <div className="flex flex-col gap-1">
              <Link href="/vin" className="hover:text-brand transition-colors">VIN Recall Check</Link>
              <Link href="/recalls" className="hover:text-brand transition-colors">Browse All Brands</Link>
              <Link href="/about" className="hover:text-brand transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Data Source</h3>
            <p>
              All recall data comes from the{" "}
              <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                National Highway Traffic Safety Administration (NHTSA)
              </a>
              . Updated daily.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} RecallScanner. Not affiliated with NHTSA or any government agency.
        </div>
      </div>
    </footer>
  );
}
