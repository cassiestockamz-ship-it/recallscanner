import VinChecker from "@/components/VinChecker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free VIN Recall Check — Check Your Vehicle by VIN Number",
  description:
    "Enter your 17-digit VIN to instantly check for open safety recalls. Free lookup powered by official NHTSA data. Works for all US vehicles.",
  alternates: { canonical: "https://www.recallscanner.com/vin" },
};

export default function VinLanding() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RecallScanner VIN Recall Checker",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free vehicle recall lookup by VIN. Powered by official NHTSA data.",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Free VIN Recall Check</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Enter your 17-digit Vehicle Identification Number to instantly check for open safety recalls.
          100% free, powered by official NHTSA data.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-8 mb-12">
        <div className="flex justify-center">
          <VinChecker />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-lg mb-2">Where to Find Your VIN</h2>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>Driver&apos;s side dashboard (visible through windshield)</li>
            <li>Driver&apos;s side door jamb sticker</li>
            <li>Vehicle registration card</li>
            <li>Insurance card or policy</li>
            <li>Vehicle title document</li>
          </ul>
        </div>
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="font-semibold text-lg mb-2">What We Check</h2>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>All open NHTSA safety recalls</li>
            <li>Vehicle identification and specs</li>
            <li>Recall details, risks, and remedies</li>
            <li>Links to official NHTSA documentation</li>
            <li>Related owner complaints</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-slate-400">
        <p>Data sourced from the National Highway Traffic Safety Administration (NHTSA). Updated daily.</p>
      </div>
    </div>
  );
}
