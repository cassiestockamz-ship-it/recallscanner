import Link from "next/link";
import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/breadcrumb";

export const metadata: Metadata = {
  title: "About RecallScanner",
  description: "RecallScanner is an independent publisher that turns NHTSA vehicle recall data into plain-English lookups. Learn about our mission, methodology, and editorial standards.",
  alternates: { canonical: "https://www.recallscanner.com/about" },
};

export default function AboutPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RecallScanner",
    url: "https://www.recallscanner.com",
    logo: "https://www.recallscanner.com/opengraph-image.png",
    description:
      "Independent U.S. publisher that translates NHTSA vehicle recall and complaint data into free, plain-English lookups for owners and used-car buyers.",
    sameAs: ["https://www.recallscanner.com"],
  };

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <h1 className="text-3xl font-bold mb-6">About RecallScanner</h1>

      <div className="space-y-6 text-slate-600 text-[15px] leading-relaxed">
        <p>
          RecallScanner is an independent, privately operated reference site that turns the National Highway Traffic Safety
          Administration&apos;s public vehicle-safety data into something normal drivers and used-car buyers can actually use.
          We are not NHTSA. We are not a dealer, a law firm, or an automaker. We build software, read government APIs, and try
          to make the answers you need take seconds instead of an afternoon.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">Why this site exists</h2>
        <p>
          The U.S. has one of the most comprehensive vehicle-safety data systems in the world, and almost none of it is
          presented in a way regular people want to use. NHTSA&apos;s own recall lookup works, but it&apos;s built for a small
          set of use cases: one VIN at a time, one campaign at a time, with little cross-reference between models, brands, or
          historical patterns. Dealer and insurer tools are closed. Third-party tools either gate the data behind a paywall or
          bury it under upsells.
        </p>
        <p>
          We started RecallScanner because every time we bought a used car, checked a friend&apos;s recall status, or tried to
          research a model&apos;s track record before a road trip, we ended up copy-pasting between multiple government pages.
          The data was there. The usability wasn&apos;t.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">What we do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Live VIN lookups.</strong> Type in a 17-character VIN and we pass it directly to NHTSA&apos;s live API to
            return the list of open recalls for that specific vehicle, plus a decoded vehicle summary.
          </li>
          <li>
            <strong>Brand and model history pages.</strong> For every brand and model we track, we assemble the full recall
            campaign history in one scrollable page, with component categorization, reliability scorecards, and filtering by
            model year.
          </li>
          <li>
            <strong>Owner-complaint context.</strong> Alongside recall data, we surface NHTSA complaint counts (including crash,
            fire, injury, and death flags) so that a pattern forming in real-world reports is easier to notice.
          </li>
          <li>
            <strong>Monthly recap reports.</strong> Every month we publish a plain-language summary of every recall NHTSA logged
            in the preceding month, with a short editorial read on which brands and components stood out.
          </li>
          <li>
            <strong>Editorial explainers.</strong> On top of each brand and model page we add a human-written analysis layer
            that describes what the underlying numbers actually mean: the three most common recall categories, the model years
            affected, the model with the highest campaign count, and how to use the page responsibly.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">Editorial standards</h2>
        <p>
          We keep the raw campaign records as NHTSA published them, minus obvious formatting cruft. When we add a written
          analysis layer, it&apos;s clearly separated from the raw records and is generated from the live dataset at
          publication time. We don&apos;t invent recalls, we don&apos;t pay for visibility, and we don&apos;t accept payment
          from manufacturers to suppress or re-rank specific campaigns. The full details (data sources, refresh cadence, what
          we calculate, and what we deliberately don&apos;t do) are on our{" "}
          <Link href="/methodology" className="text-brand hover:underline">methodology page</Link>.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">What RecallScanner is not</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>We are not a government agency or a branch of NHTSA.</li>
          <li>We are not affiliated with, endorsed by, or sponsored by any vehicle manufacturer or dealer network.</li>
          <li>We do not provide legal, mechanical, or insurance advice. See our <Link href="/disclaimer" className="text-brand hover:underline">disclaimer</Link>.</li>
          <li>We do not store the VINs you look up, sell your data, or run remarketing against your searches.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">How we&apos;re funded</h2>
        <p>
          RecallScanner is free for everyone and will stay that way. The site covers its operating costs (servers, the daily
          data pipeline, domain, monitoring) primarily through contextual advertising, which is clearly labeled and never
          affects which recalls we show or how we categorize them. See our{" "}
          <Link href="/disclaimer" className="text-brand hover:underline">disclaimer</Link> for the full advertising and
          sponsorship statement.
        </p>

        <h2 className="text-xl font-semibold text-slate-800 mt-8">Corrections and contact</h2>
        <p>
          If you spot an error on any page (a missing recall, a stale status, an incorrect editorial claim), please{" "}
          <Link href="/contact" className="text-brand hover:underline">contact us</Link> with the URL and what looks wrong. We
          review every correction request and update against the live NHTSA source.
        </p>
        <p>
          For anything else, email{" "}
          <a href="mailto:hello@recallscanner.com" className="text-brand hover:underline">hello@recallscanner.com</a>
          {" "}or see our <Link href="/contact" className="text-brand hover:underline">contact page</Link>.
        </p>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
