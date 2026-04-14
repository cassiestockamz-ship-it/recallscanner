import Link from "next/link";
import { ArrowRight, Database, ShieldCheck, Clock, Gauge } from "lucide-react";
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
    description: "Free vehicle recall lookup by VIN with severity-scored verdicts. Powered by official NHTSA data.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "RecallScanner",
            url: "https://recallscanner.com",
            description:
              "Free vehicle recall check by VIN with severity-scored verdicts. Search the official NHTSA database for open safety recalls.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://recallscanner.com/vin/{vin}",
              },
              "query-input": "required name=vin",
            },
            publisher: {
              "@type": "Organization",
              name: "RecallScanner",
              url: "https://recallscanner.com/about",
            },
          }),
        }}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white"
        />
        {/* Soft accent gradient */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[600px] opacity-[0.12] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #1e40af 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 pt-14 md:pt-24 pb-10 md:pb-16">
          {/* Eyebrow */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 backdrop-blur px-3 py-1 text-[11px] font-semibold text-slate-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-clear)]" />
              Powered by live NHTSA data · updated daily
            </div>
          </div>

          <h1 className="text-center text-[38px] md:text-[58px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-4">
            Is your car{" "}
            <span className="relative inline-block">
              <span className="relative z-10">safe to drive?</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 md:bottom-2 h-[10px] md:h-[14px] bg-[var(--color-watch-soft)] -z-0 rounded"
              />
            </span>
          </h1>
          <p className="text-center text-slate-600 text-[15px] md:text-[18px] max-w-[58ch] mx-auto mb-8 md:mb-10 leading-snug">
            Check any 17-character VIN against the official NHTSA recall database and get a plain-English safety verdict in seconds. Free, unlimited, no signup.
          </p>

          {/* The VIN checker — the star */}
          <VinChecker autoFocus />

          {/* Trust ribbon */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-slate-500">
            <TrustItem icon={<Database size={13} />} label="Official NHTSA data" />
            <TrustItem icon={<ShieldCheck size={13} />} label="No tracking, no signup" />
            <TrustItem icon={<Clock size={13} />} label="Refreshed daily" />
            <TrustItem icon={<Gauge size={13} />} label="Severity-scored verdicts" />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-center text-[24px] md:text-[28px] font-bold text-slate-900 mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Paste your VIN",
                desc: "17 characters from your windshield, door jamb, or registration. We decode it live as you type.",
              },
              {
                step: "02",
                title: "We run NHTSA",
                desc: "We query the official recall API and score every open campaign for severity, fire risk, and crash risk.",
              },
              {
                step: "03",
                title: "See the verdict",
                desc: "A one-screen safety card tells you if your car is clear, should be watched, or needs action right now.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6"
              >
                <div className="text-[11px] font-mono font-bold tracking-wider text-slate-400 mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 text-[17px] mb-2">{item.title}</h3>
                <p className="text-slate-500 text-[13.5px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by brand ───────────────────────────────────── */}
      <section className="py-14 md:py-16 bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900">
              Browse recalls by brand
            </h2>
            <Link
              href="/recalls"
              className="text-[13px] font-medium text-[var(--color-brand)] hover:underline inline-flex items-center gap-1"
            >
              All brands <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {POPULAR_MAKES.map((make) => (
              <Link
                key={make}
                href={`/recalls/${makeSlug(make)}`}
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-center text-[13px] font-medium text-slate-700 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
              >
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <StatCard value="1,000+" label="Active recall campaigns tracked" />
            <StatCard value="29M+" label={`Vehicles recalled in ${currentYear - 1}`} />
            <StatCard value="100%" label="Free — recalls are fixed at no cost" />
          </div>
        </div>
      </section>

      {/* ── Educational — collapsed behind details ───────────── */}
      <section className="py-14 bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-center text-[22px] md:text-[26px] font-bold text-slate-900 mb-8">
            The essentials, explained
          </h2>
          <div className="space-y-2">
            <InfoDetails
              title="What is a vehicle recall, really?"
              body={
                <>
                  <p>
                    A vehicle safety recall is a formal campaign opened by a manufacturer — sometimes voluntarily, sometimes after a federal investigation — to fix a defect that creates an unreasonable risk to safety or that fails to meet a federal motor vehicle safety standard. NHTSA oversees the process and keeps a public record of every campaign. When a recall is issued, the automaker has to notify owners and fix the problem at no cost, no matter whether the car was bought new, used, is inside its original warranty window, or decades past it.
                  </p>
                  <p>
                    The thing most people get wrong is assuming "recall" is a single event — a letter in the mail, a trip to the dealer, a quick fix. In practice, most passenger vehicles on U.S. roads today have had at least one recall campaign over their lifetime, and a surprising number of those recalls are still <em>open</em> because the original owner either never got the notification, threw it out, or sold the car before the repair was scheduled.
                  </p>
                  <p>
                    This matters most for used-car buyers and for people who&apos;ve had the same vehicle for five-plus years without ever looking. A recall doesn&apos;t expire. The only way to know the current status of a specific vehicle is to run the VIN through NHTSA&apos;s live database, which is exactly what the tool at the top of this page does.
                  </p>
                </>
              }
            />
            <InfoDetails
              title="Your rights when a vehicle is recalled"
              body={
                <>
                  <p>
                    Federal law — the National Traffic and Motor Vehicle Safety Act — gives you a number of rights when a car, truck, SUV, motorcycle, or piece of equipment is under an active recall:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong className="text-slate-800">The repair is free.</strong> The manufacturer pays for parts, labor, and any reasonable associated costs, regardless of owner history or warranty status.
                    </li>
                    <li>
                      <strong className="text-slate-800">Any authorized dealer can do it.</strong> You are not tied to where you bought the vehicle.
                    </li>
                    <li>
                      <strong className="text-slate-800">You may be entitled to a loaner or refund.</strong> If the remedy isn&apos;t available, the automaker is generally required to provide transportation or a loaner.
                    </li>
                    <li>
                      <strong className="text-slate-800">You have the right to know.</strong> Manufacturers must notify registered owners of record. If paperwork went astray, the live VIN lookup above is the backstop.
                    </li>
                    <li>
                      <strong className="text-slate-800">Unresolved recalls don&apos;t disappear.</strong> A recall from 2012 is still redeemable today.
                    </li>
                  </ul>
                </>
              }
            />
            <InfoDetails
              title="Why use RecallScanner instead of NHTSA directly?"
              body={
                <>
                  <p>
                    NHTSA&apos;s own recall site is the source of truth for recall data, and we recommend using it any time you&apos;re making a significant decision. RecallScanner doesn&apos;t replace it — we sit on top of the same government data and make certain workflows faster to read.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="text-slate-800">Severity-scored verdicts.</strong> Every recall gets a RecallScore (0–100) and a tier (critical / watch / lower-severity) so you can see the shape of a vehicle&apos;s history at a glance.</li>
                    <li><strong className="text-slate-800">Plain-English hooks.</strong> We rewrite NHTSA&apos;s "this defect may result in" language into a one-line hook you can read in seconds.</li>
                    <li><strong className="text-slate-800">Full model history on one page</strong>, with search and year filters.</li>
                    <li><strong className="text-slate-800">Brand-level analysis</strong> of the most common recall categories, years, and affected models.</li>
                    <li><strong className="text-slate-800">No login, no upsells, no tracking.</strong></li>
                  </ul>
                </>
              }
            />
            <InfoDetails
              title="What to do if your vehicle has an open recall"
              body={
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong className="text-slate-800">Read the full campaign text.</strong> Look at Consequence and Remedy on the recall card. They tell you what can go wrong and what the dealer will actually do to fix it.
                  </li>
                  <li>
                    <strong className="text-slate-800">Decide whether it&apos;s safe to drive.</strong> Some campaigns are "do not drive" or "park outside." Most are not. If uncertain, call the manufacturer&apos;s customer service line before your next drive.
                  </li>
                  <li>
                    <strong className="text-slate-800">Call any authorized dealer.</strong> Give them the campaign number and your VIN. They&apos;ll confirm parts and schedule the free repair.
                  </li>
                  <li>
                    <strong className="text-slate-800">Ask about a loaner if parts are backordered.</strong>
                  </li>
                  <li>
                    <strong className="text-slate-800">Keep the paperwork</strong> — it helps at resale.
                  </li>
                </ol>
              }
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-center text-[22px] md:text-[26px] font-bold text-slate-900 mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="rounded-2xl border border-[var(--color-border)] bg-white group">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center gap-3 font-semibold text-slate-900 text-[15px]">
                  <span className="inline-block w-4 text-center text-slate-400 transition-transform group-open:rotate-90">
                    ›
                  </span>
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 pl-12 text-slate-500 text-[14px] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      {label}
    </span>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <div className="text-[38px] md:text-[44px] font-bold text-[var(--color-brand)] leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[13px] text-slate-500 mt-2">{label}</div>
    </div>
  );
}

function InfoDetails({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <details className="rounded-2xl border border-[var(--color-border)] bg-white group">
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center gap-3 font-semibold text-slate-900 text-[15px]">
        <span className="inline-block w-4 text-center text-slate-400 transition-transform group-open:rotate-90">
          ›
        </span>
        {title}
      </summary>
      <div className="px-5 pb-5 pl-12 space-y-3 text-slate-600 text-[14.5px] leading-relaxed">
        {body}
      </div>
    </details>
  );
}
