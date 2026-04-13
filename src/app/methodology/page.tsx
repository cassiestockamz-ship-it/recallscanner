import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Research — Methodology",
  description: "How RecallScanner sources, processes, and presents NHTSA vehicle recall data. Data pipeline, refresh cadence, editorial process, and corrections policy.",
  alternates: { canonical: "https://www.recallscanner.com/methodology" },
};

export default function MethodologyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">How We Research</h1>
      <p className="text-sm text-slate-400 mb-8">Methodology — last updated: {lastUpdated}</p>

      <div className="space-y-8 text-slate-600 text-sm leading-relaxed">
        <section>
          <p>
            RecallScanner exists to turn NHTSA&apos;s vehicle safety data into something a normal person can actually use without
            clicking through twelve different government screens. This page explains where our data comes from, what we do with
            it, what we add on top, and what we do when something&apos;s wrong.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Where the data comes from</h2>
          <p>
            Every recall campaign, every VIN decode, and every owner complaint displayed on RecallScanner ultimately traces back
            to a public API operated by the{" "}
            <a href="https://www.nhtsa.gov" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              National Highway Traffic Safety Administration (NHTSA)
            </a>. Specifically, we use:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>NHTSA Recalls API</strong> — for the recall campaign records you see on brand and model pages, including
              campaign numbers, affected model years, component categories, consequence language, and remedy instructions.
            </li>
            <li>
              <strong>NHTSA Complaints API</strong> — for the owner-reported complaint counts shown on model pages, including
              crash, fire, injury, and death indicators flagged by the submitter.
            </li>
            <li>
              <strong>NHTSA VPIC (Vehicle Product Information Catalog) API</strong> — for VIN decoding. When you enter a VIN, we
              pass it directly to VPIC to return make, model, year, engine, body class, drivetrain, and other decoded attributes.
            </li>
            <li>
              <strong>NHTSA VIN Recalls API</strong> — for the live &quot;does this specific VIN have an open recall&quot; answer
              on our VIN results page.
            </li>
          </ul>
          <p className="mt-2">
            None of these APIs require payment. They are the same underlying data sources that dealerships, insurers, and
            government-facing lookup tools rely on.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. How we refresh the data</h2>
          <p>
            Our ingestion pipeline runs on a daily cron schedule and pulls the full recall and complaint record set for every
            brand and model we track. The pipeline writes to a structured database, which the live site reads on demand. Model
            pages and brand pages are served from that database and cached for up to one hour before re-validating.
          </p>
          <p className="mt-2">
            VIN lookups, by contrast, are <strong>not</strong> cached. When you type a VIN into the checker, the request goes
            straight to NHTSA&apos;s live API so that the answer always reflects the most recent data the federal government has
            about that specific vehicle.
          </p>
          <p className="mt-2">
            There is an unavoidable small lag — usually under 24 hours — between when NHTSA publishes a new recall and when it
            appears on our brand and model listing pages. If you need the absolute current state of a specific VIN, the VIN
            checker is the right tool for that.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. What we add on top of the raw data</h2>
          <p>
            We don&apos;t rewrite or edit the underlying NHTSA campaign records. The campaign text, consequence language, and
            remedy description that appear in each recall card are exactly as NHTSA and the manufacturer published them, minus
            obvious formatting cruft.
          </p>
          <p className="mt-2">What we <em>do</em> add is a layer of organization and analysis:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Brand and model grouping</strong> — NHTSA&apos;s own site makes it surprisingly hard to see every recall a
              single model has had over time. We pre-compute the full list per brand and per model so you can see it at a glance.
            </li>
            <li>
              <strong>Component categorization</strong> — NHTSA returns a free-text &quot;Component&quot; field that&apos;s
              inconsistent across campaigns. We map it into a small set of broader buckets (brakes, airbags, electrical, engine,
              software, etc.) so that patterns show up.
            </li>
            <li>
              <strong>Critical-recall flagging</strong> — we scan each campaign&apos;s consequence and summary text for keywords
              related to fire, crash, injury, death, or loss of control and surface the matching campaigns first. It&apos;s a
              simple text filter, not a risk score, and we label it as such.
            </li>
            <li>
              <strong>Reliability scorecards</strong> — on model pages we display a 1–10 score derived from recall count,
              complaint volume, and the presence of crash, fire, and fatality reports. The formula is documented in our codebase
              and is meant as a rough comparative signal, not a replacement for a pre-purchase inspection.
            </li>
            <li>
              <strong>Editorial analysis</strong> — some pages include a plain-language analysis section written from the live
              dataset (&quot;the most common recall category for this brand is X, appearing in Y campaigns&quot;). Those sections
              are clearly separated from the raw campaign records and exist to put the numbers in context.
            </li>
            <li>
              <strong>Monthly recap reports</strong> — on the blog we publish a monthly summary of every recall that landed in
              NHTSA&apos;s database that month, with a short editorial intro explaining what stood out.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. What we deliberately don&apos;t do</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We don&apos;t invent recall campaigns, fabricate campaign numbers, or fill in missing NHTSA data with guesses.</li>
            <li>We don&apos;t accept payment from manufacturers to suppress, de-rank, or hide specific recalls.</li>
            <li>We don&apos;t store the VINs you look up. VIN lookups are passed through to NHTSA and not retained.</li>
            <li>We don&apos;t present owner complaints as defects. Complaints are self-reported and clearly labeled as such.</li>
            <li>We don&apos;t give individualized legal, mechanical, or insurance advice. See our <Link href="/disclaimer" className="text-brand hover:underline">disclaimer</Link>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Corrections policy</h2>
          <p>
            If you believe a page on RecallScanner is wrong — a missing recall, a stale status, a misclassified component, or an
            incorrect editorial claim — please <Link href="/contact" className="text-brand hover:underline">contact us</Link> with
            the page URL and a description of the problem. For campaign-level data, we&apos;ll verify against the live NHTSA API
            before making changes; if the issue is in our editorial layer, we&apos;ll fix it directly and note the correction in
            the page&apos;s revision history where appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Who runs this site</h2>
          <p>
            RecallScanner is built and maintained by a small, independent editorial team with a background in data engineering
            and automotive research. We are not funded by any automaker, law firm, insurance company, or dealership network. The
            site covers its operating costs through contextual advertising that is clearly labeled and does not influence which
            recalls are shown or how they&apos;re categorized.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">&larr; Back to Home</Link>
      </div>
    </div>
  );
}
