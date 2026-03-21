import Link from "next/link";
import VinChecker from "@/components/VinChecker";
import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";

const FAQS = [
  {
    q: "What is a vehicle recall?",
    a: "A vehicle recall is issued when a manufacturer or NHTSA determines that a vehicle, equipment, car seat, or tire creates an unreasonable safety risk or fails to meet minimum safety standards. The manufacturer must fix the problem at no cost to you.",
  },
  {
    q: "Where do I find my VIN?",
    a: "Your 17-digit VIN can be found on your vehicle registration, insurance card, the driver's side dashboard (visible through the windshield), or on a sticker inside the driver's side door jamb.",
  },
  {
    q: "How much does a recall repair cost?",
    a: "Nothing. By law, manufacturers must repair recalled vehicles for free, regardless of whether you're the original owner or the vehicle is out of warranty.",
  },
  {
    q: "What should I do if my car has a recall?",
    a: "Contact your nearest authorized dealership to schedule the recall repair. You don't need an appointment at the dealership where you purchased the vehicle — any authorized dealer for your vehicle's brand can perform the repair.",
  },
  {
    q: "Where does RecallScanner get its data?",
    a: "All recall data comes directly from the National Highway Traffic Safety Administration (NHTSA), the official U.S. government agency responsible for vehicle safety. Our database is updated daily.",
  },
];

const currentYear = new Date().getFullYear();

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "RecallScanner",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free vehicle recall lookup by VIN. Powered by official NHTSA data.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Is Your Vehicle Recalled?
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Enter your VIN to instantly check for open safety recalls. Free lookup powered by official NHTSA data — the same database used by dealerships.
          </p>
          <div className="flex justify-center">
            <VinChecker />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Enter Your VIN", desc: "Find your 17-digit Vehicle Identification Number on your registration, insurance card, or driver's side dashboard." },
              { step: "2", title: "We Check NHTSA", desc: "We instantly search the official National Highway Traffic Safety Administration recall database." },
              { step: "3", title: "See Your Results", desc: "Get a complete list of any open recalls, what's affected, and what the manufacturer will fix for free." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by brand */}
      <section className="py-12 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">Browse Recalls by Brand</h2>
          <p className="text-center text-slate-500 mb-8">
            Select a manufacturer to see all safety recalls for that brand.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {POPULAR_MAKES.map((make) => (
              <Link
                key={make}
                href={`/recalls/${makeSlug(make)}`}
                className="bg-white border border-border rounded-lg px-4 py-3 text-center font-medium text-slate-700 hover:border-brand hover:text-brand transition-colors"
              >
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / trust */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-brand">1,000+</div>
              <div className="text-slate-500 text-sm mt-1">Active recall campaigns</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand">29M+</div>
              <div className="text-slate-500 text-sm mt-1">Vehicles recalled in {currentYear - 1}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand">100%</div>
              <div className="text-slate-500 text-sm mt-1">Free — recalls are fixed at no cost</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-surface">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white rounded-lg border border-border p-5">
                <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
