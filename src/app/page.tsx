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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "RecallScanner",
        "url": "https://recallscanner.com",
        "description": "Free vehicle recall check by VIN. Search the official NHTSA database for open safety recalls.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://recallscanner.com/vin/{vin}"
          },
          "query-input": "required name=vin"
        },
        "publisher": {
          "@type": "Organization",
          "name": "RecallScanner",
          "url": "https://recallscanner.com/about"
        }
      })}} />
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

      {/* What is a recall — educational */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800">What is a vehicle recall, really?</h2>
          <p>
            A vehicle safety recall is a formal campaign opened by a manufacturer — sometimes voluntarily, sometimes after a
            federal investigation — to fix a defect that creates an unreasonable risk to safety or that fails to meet a
            federal motor vehicle safety standard. The National Highway Traffic Safety Administration, NHTSA, oversees the
            process and keeps a public record of every campaign. When a recall is issued, the automaker has to notify owners
            and fix the problem at no cost to the current owner, no matter whether the car was bought new, bought used, is
            inside its original warranty window, or is two decades past it.
          </p>
          <p>
            The thing most people get wrong is assuming &quot;recall&quot; is a single, dramatic event — a letter in the mail,
            a trip to the dealer, a quick fix. In practice, most passenger vehicles on U.S. roads today have had at least one
            recall campaign over their lifetime, and a surprising number of those recalls are still <em>open</em> on real
            vehicles because the original owner either never got the notification, threw it out, or sold the car before the
            repair was scheduled. When that car gets sold again, the recall moves with it — but the paperwork rarely does.
          </p>
          <p>
            This matters most for used-car buyers and for people who&apos;ve had the same vehicle for five-plus years without
            ever looking. A recall doesn&apos;t expire. It also doesn&apos;t get &quot;closed&quot; just because time passed.
            The only way to know the current status of a specific vehicle is to run the VIN through NHTSA&apos;s live
            database, which is exactly what the tool at the top of this page does.
          </p>
        </div>
      </section>

      {/* Your rights */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800">Your rights when a vehicle is recalled</h2>
          <p>
            Federal law — specifically the National Traffic and Motor Vehicle Safety Act — gives you a number of rights when a
            car, truck, SUV, motorcycle, or piece of equipment is under an active recall. The big ones worth knowing:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-slate-800">The repair is free.</strong> The manufacturer pays for parts, labor, and any
              reasonable associated costs. You should never be charged for a recall remedy, regardless of whether you&apos;re
              the original owner, how many miles are on the odometer, or whether your warranty has lapsed.
            </li>
            <li>
              <strong className="text-slate-800">Any authorized dealer can do it.</strong> You&apos;re not required to go back
              to the dealership where you purchased the vehicle. Any dealer authorized to service that brand can perform the
              recall repair and file for reimbursement from the manufacturer.
            </li>
            <li>
              <strong className="text-slate-800">You may be entitled to a loaner, refund, or repurchase.</strong> If the
              remedy isn&apos;t available yet, the automaker is generally required to provide transportation or a loaner
              vehicle. In rare cases — typically when a defect can&apos;t be repaired within a reasonable time — a recall can
              escalate to a refund or a vehicle repurchase.
            </li>
            <li>
              <strong className="text-slate-800">You have the right to know.</strong> Manufacturers must notify registered
              owners of record. If you bought the car used, registered an address change, or were the second or third owner,
              that notification may have been lost. The live VIN lookup above is the backstop for that.
            </li>
            <li>
              <strong className="text-slate-800">Unresolved recalls don&apos;t disappear.</strong> There is no statute of
              limitations on a recall remedy for passenger vehicles. A recall from 2012 is still redeemable today if nobody
              ever brought the car in.
            </li>
          </ul>
          <p>
            None of this is legal advice. If you believe a defect has caused harm or if an automaker is refusing a remedy
            you&apos;re entitled to, talk to a licensed attorney or contact NHTSA directly.
          </p>
        </div>
      </section>

      {/* How RecallScanner compares */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800">Why use RecallScanner instead of NHTSA directly?</h2>
          <p>
            NHTSA&apos;s own recall site is excellent, and we recommend using it as the source of truth any time you&apos;re
            about to make a significant decision — buying a used car, handing over keys, starting a road trip. RecallScanner
            doesn&apos;t replace it. What we do is sit on top of the same underlying government data and make certain
            workflows faster and more readable than NHTSA&apos;s own interface supports.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-slate-800">Full model history on one page.</strong> NHTSA shows recall campaigns
              individually. We pre-assemble every campaign in a model&apos;s history into a single page with filtering by
              year and component.
            </li>
            <li>
              <strong className="text-slate-800">Brand-level analysis.</strong> We compute the three most common recall
              categories, the model years affected, and the model with the highest campaign count for each brand so you can
              eyeball patterns at a glance instead of downloading a CSV.
            </li>
            <li>
              <strong className="text-slate-800">Complaint context alongside recalls.</strong> NHTSA stores owner complaints
              separately from recalls. We link them together on each model page so you can see whether a defect pattern is
              forming before the formal campaign is opened.
            </li>
            <li>
              <strong className="text-slate-800">Monthly recap reports.</strong> Every month we publish a short editorial
              summary of every recall that landed that month, grouped by brand and by component, with the critical campaigns
              surfaced first.
            </li>
            <li>
              <strong className="text-slate-800">No login, no upsells, no data retention.</strong> We don&apos;t store your
              VIN when you look it up. See our <Link href="/methodology" className="text-brand hover:underline">methodology</Link>
              {" "}page for exactly how the data pipeline works.
            </li>
          </ul>
        </div>
      </section>

      {/* What to do if you find a recall */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-800">What to do if your vehicle has an open recall</h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong className="text-slate-800">Read the full campaign text.</strong> Open the recall card on the VIN results
              or model page and look at the Consequence and Remedy fields. They tell you what can go wrong, how likely it is
              to happen at highway speed versus sitting in a driveway, and what the dealer will actually do to fix it.
            </li>
            <li>
              <strong className="text-slate-800">Decide whether the vehicle is safe to drive in the meantime.</strong> Some
              campaigns are &quot;do not drive&quot; or &quot;park outside&quot; orders. Most are not. The consequence text
              will usually make that clear. If you&apos;re uncertain, the safer default is to call the manufacturer&apos;s
              customer service line before your next drive.
            </li>
            <li>
              <strong className="text-slate-800">Call any authorized dealer.</strong> You don&apos;t need the dealership you
              bought from. Give them the campaign number and your VIN. They&apos;ll confirm parts availability and schedule
              the free repair.
            </li>
            <li>
              <strong className="text-slate-800">Ask about a loaner if parts are backordered.</strong> If the dealer can&apos;t
              perform the remedy immediately and the defect is significant, you may be entitled to transportation or a loaner
              vehicle while you wait.
            </li>
            <li>
              <strong className="text-slate-800">Keep the paperwork.</strong> When the repair is complete, keep the invoice or
              recall completion record. It helps at resale time and is useful if anything related to the defect surfaces
              later.
            </li>
          </ol>
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
