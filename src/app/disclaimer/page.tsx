import Link from "next/link";
import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/breadcrumb";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "RecallScanner disclaimer. Data accuracy, non-affiliation with NHTSA, and limits on our information.",
  alternates: { canonical: "https://www.recallscanner.com/disclaimer" },
};

export default function DisclaimerPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const ld = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Disclaimer", href: "/disclaimer" },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: {lastUpdated}</p>

      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Independence and non-affiliation</h2>
          <p>
            RecallScanner is an independent, privately operated information site. We are not affiliated with, endorsed by, or
            sponsored by the National Highway Traffic Safety Administration (NHTSA), the U.S. Department of Transportation, any
            other government agency, any vehicle manufacturer, or any authorized dealer or repair network. Any brand names,
            model names, or manufacturer logos that appear on this site are used for editorial and identification purposes only.
            All trademarks belong to their respective owners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Data source and accuracy</h2>
          <p>
            The recall campaign data, VIN decoding, and owner-complaint data you see on RecallScanner is sourced from NHTSA&apos;s
            publicly available APIs and refreshed daily by our automated ingestion pipeline. We do not alter, edit, or filter the
            underlying NHTSA records themselves. We reformat and categorize them so they&apos;re easier to read and search.
          </p>
          <p className="mt-2">
            While we work to keep the data current, the Service is provided <strong>as is</strong>. Recall status can change at
            any time, there can be a lag between when NHTSA publishes an update and when it appears here, and the completeness of
            any individual campaign record depends entirely on what the manufacturer and NHTSA published. RecallScanner makes no
            warranty, express or implied, that the information is accurate, complete, current, or fit for any particular purpose.
          </p>
          <p className="mt-2">
            For anything safety-critical (buying a used vehicle, deciding whether to drive a car with a suspected defect, or
            confirming a specific repair is covered), verify the information directly with{" "}
            <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              nhtsa.gov/recalls
            </a>{" "}and the vehicle&apos;s manufacturer or an authorized dealer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Not professional advice</h2>
          <p>
            RecallScanner publishes general information about vehicle safety recalls. Nothing on the site is legal advice,
            mechanical advice, insurance advice, or professional advice of any kind. We are not attorneys, technicians,
            adjusters, or regulators, and reading this site does not create a professional relationship of any kind. For
            individualized advice about your specific vehicle, speak to a licensed mechanic, your manufacturer or authorized
            dealer, your insurance provider, or a qualified attorney as appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Owner complaint data</h2>
          <p>
            The &quot;complaints&quot; data shown on model pages comes from NHTSA&apos;s public complaint database. These are
            self-reported incidents submitted by vehicle owners. NHTSA does not verify every complaint before publishing, and a
            complaint is not proof that a defect exists or that a vehicle is unsafe. We show complaint counts as context for
            recall data, not as a safety rating.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Editorial analysis</h2>
          <p>
            Some pages on RecallScanner include original editorial analysis: for example, most-common-recall-category summaries,
            month-over-month commentary, or plain-language explanations of what a recall means. Those sections represent our own
            interpretation of the underlying NHTSA dataset at the time of writing and are clearly separated from the raw campaign
            records. They are not pronouncements from NHTSA or any automaker.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Advertising and sponsored content</h2>
          <p>
            RecallScanner may display contextual advertising from third-party networks to help cover operating costs. Any ads
            shown are clearly labeled as such and are not an endorsement of the advertised product or service by RecallScanner.
            Ad placement does not influence which recalls are shown or how they are categorized. If and when we include affiliate
            links to physical products (for example, vehicle safety accessories), they will be disclosed in line with FTC
            guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Errors and corrections</h2>
          <p>
            If you believe a page on RecallScanner contains an error, an outdated record, or information that doesn&apos;t match
            the current NHTSA database, please <Link href="/contact" className="text-brand hover:underline">contact us</Link> with
            the page URL and what you believe is wrong. We review every correction request and update the page as needed once
            we&apos;ve confirmed the issue against the underlying NHTSA source.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">&larr; Back to Home</Link>
      </div>
    </div>
  );
}
