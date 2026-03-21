import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About RecallScanner",
  description: "RecallScanner provides free vehicle recall lookups powered by official NHTSA data. Learn about our mission and methodology.",
  alternates: { canonical: "https://www.recallscanner.com/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About RecallScanner</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-sm leading-relaxed">
        <p>
          RecallScanner is a free tool that helps vehicle owners check whether their car, truck, or SUV has any open safety recalls.
          We believe everyone deserves quick, easy access to safety information about the vehicles they drive every day.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">Our Data Source</h2>
        <p>
          All recall data comes directly from the{" "}
          <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
            National Highway Traffic Safety Administration (NHTSA)
          </a>
          , the official U.S. government agency responsible for vehicle safety. NHTSA maintains the most comprehensive database
          of vehicle recalls, consumer complaints, and safety investigations in the United States.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">How It Works</h2>
        <p>
          When you enter your VIN or browse by vehicle make and model, RecallScanner queries the NHTSA API in real-time
          to retrieve the latest recall information. We do not store your VIN or any personal information.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">Important Notes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>RecallScanner is not affiliated with NHTSA or any government agency.</li>
          <li>Recall repairs are always free — by law, manufacturers must fix recalled vehicles at no cost to the owner.</li>
          <li>If your vehicle has an open recall, contact your nearest authorized dealership to schedule the repair.</li>
          <li>Data is refreshed daily, but there may be a short delay between when NHTSA publishes a new recall and when it appears here.</li>
        </ul>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
