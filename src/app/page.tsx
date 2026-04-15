import Link from "next/link";
import {
  ArrowRight,
  Database,
  ShieldCheck,
  Clock,
  Gauge,
  BookOpen,
  Scale,
  GitCompare,
  ListChecks,
} from "lucide-react";
import VinChecker from "@/components/VinChecker";
import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";

const FAQS = [
  {
    q: "Where do I find my VIN?",
    a: "Your 17-character VIN is on your vehicle registration, insurance card, the lower-left corner of the windshield (visible from outside), or on a sticker inside the driver's-side door jamb.",
  },
  {
    q: "How much does a recall repair cost?",
    a: "Nothing. By law, manufacturers must repair recalled vehicles for free, regardless of whether you're the original owner or the vehicle is out of warranty.",
  },
  {
    q: "Do recalls expire?",
    a: "No. There is no statute of limitations on a recall remedy for passenger vehicles. A campaign from a decade ago is still redeemable today if nobody ever brought the car in.",
  },
  {
    q: "Can any dealer do a recall repair?",
    a: "Yes. Any dealer authorized to service your vehicle's brand can perform the recall repair and file for reimbursement from the manufacturer. You don't need to go back to where you bought the car.",
  },
  {
    q: "Where does RecallScanner get its data?",
    a: "All recall data comes directly from the National Highway Traffic Safety Administration (NHTSA), the official U.S. government agency responsible for vehicle safety. Our database is refreshed daily.",
  },
];

const GUIDES = [
  {
    slug: "how-recalls-work",
    eyebrow: "Primer",
    title: "How vehicle recalls actually work",
    teaser: "What triggers a recall, who pays, and why so many open campaigns linger for years.",
    readingTime: "6 min",
    icon: BookOpen,
  },
  {
    slug: "your-rights",
    eyebrow: "Rights",
    title: "Your rights when a vehicle is recalled",
    teaser: "Free repairs, any authorized dealer, loaners, and what federal law actually guarantees you.",
    readingTime: "7 min",
    icon: Scale,
  },
  {
    slug: "vs-nhtsa",
    eyebrow: "Methodology",
    title: "RecallScanner vs NHTSA",
    teaser: "NHTSA is the source of truth. We're the severity layer. Here's when to use which.",
    readingTime: "5 min",
    icon: GitCompare,
  },
  {
    slug: "what-to-do",
    eyebrow: "Action",
    title: "What to do if you have an open recall",
    teaser: "A five-step playbook from reading the campaign text to handling Do-Not-Drive notices.",
    readingTime: "6 min",
    icon: ListChecks,
  },
];

const currentYear = new Date().getFullYear();

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='faq-q']", "[data-speakable='faq-a']"],
    },
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

          {/* The VIN checker, tagged so the sticky bar knows when to appear */}
          <div data-vin-hero>
            <VinChecker autoFocus />
          </div>

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
                className="cv-auto-sm rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-center text-[13px] font-medium text-slate-700 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
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
            <StatCard value="100%" label="Free. Recalls are fixed at no cost" />
          </div>
        </div>
      </section>

      {/* ── Guides — cards linking to long-form guide pages ───── */}
      <section className="py-14 md:py-16 bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900">
              The essentials
            </h2>
            <Link
              href="/guides"
              className="text-[13px] font-medium text-[var(--color-brand)] hover:underline inline-flex items-center gap-1"
            >
              All guides <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {GUIDES.map((g) => {
              const Icon = g.icon;
              return (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group relative rounded-2xl border border-[var(--color-border)] bg-white p-5 md:p-6 hover:border-[var(--color-brand)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand)] group-hover:bg-[var(--color-brand)] group-hover:text-white transition-colors">
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-1.5">
                        <span>{g.eyebrow}</span>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} /> {g.readingTime}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-[16.5px] leading-snug mb-1.5 group-hover:text-[var(--color-brand)] transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-[13.5px] text-slate-500 leading-relaxed">
                        {g.teaser}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Read guide <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
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
                  <span data-speakable="faq-q">{faq.q}</span>
                </summary>
                <div
                  className="px-5 pb-5 pl-12 text-slate-500 text-[14px] leading-relaxed"
                  data-speakable="faq-a"
                >
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

