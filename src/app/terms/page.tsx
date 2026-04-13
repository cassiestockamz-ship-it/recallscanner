import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "RecallScanner terms of use. Rules for using our free vehicle recall lookup tool and website.",
  alternates: { canonical: "https://www.recallscanner.com/terms" },
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: {lastUpdated}</p>

      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <section>
          <p>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of <strong>RecallScanner</strong>
            {" "}(&quot;we&quot;, &quot;us&quot;, the &quot;Service&quot;), operated at
            {" "}<a href="https://www.recallscanner.com" className="text-brand hover:underline">www.recallscanner.com</a>. By using the
            Service, you agree to these Terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">1. What RecallScanner Is</h2>
          <p>
            RecallScanner is a free, independent reference tool that lets U.S. vehicle owners look up open safety recalls for
            passenger vehicles using data published by the National Highway Traffic Safety Administration (NHTSA). We present,
            categorize, and summarize publicly available NHTSA recall and complaint records. We are not a government agency, a
            vehicle manufacturer, an authorized dealer, or a legal or mechanical service provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">2. No Warranty on Accuracy or Completeness</h2>
          <p>
            We make reasonable efforts to keep recall and complaint information current and correct, but we provide the Service
            &quot;as is&quot; and without warranty of any kind. Recall status can change at any time, and there can be a delay
            between when NHTSA publishes an update and when it appears here. You must not rely on RecallScanner as the sole
            source of truth for a safety-critical decision. Always verify critical recall information directly against
            {" "}<a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">nhtsa.gov/recalls</a>
            {" "}and the manufacturer or authorized dealer for your vehicle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">3. Not Legal, Mechanical, or Professional Advice</h2>
          <p>
            Nothing published on RecallScanner constitutes legal, mechanical, insurance, or professional advice of any kind. The
            content is informational only. Consult a qualified mechanic, your vehicle&apos;s manufacturer or authorized dealer,
            your insurer, or a licensed attorney before making decisions based on what you read here.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Scrape, mirror, or republish substantial portions of the Service without our written permission.</li>
            <li>Interfere with the Service, its security, or any servers or networks connected to it.</li>
            <li>Use the Service to submit VINs you do not lawfully have the right to look up.</li>
            <li>Use the Service to harass, defame, or mislead any person or entity.</li>
            <li>Impersonate another person or misrepresent your affiliation with any party.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">5. Third-Party Links</h2>
          <p>
            The Service links out to third-party sites, including NHTSA, vehicle manufacturers, and news sources. We do not
            control those sites and are not responsible for their content, policies, or practices. Visiting an external link is
            at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">6. Intellectual Property</h2>
          <p>
            Original written content, layout, design, and original analysis on RecallScanner are ours and protected by copyright.
            Underlying NHTSA recall and complaint data is in the public domain. Trademarks, logos, and brand names mentioned on
            the Service are the property of their respective owners and are used here for descriptive, editorial, and fair-use
            purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, RecallScanner and its operators are not liable for any direct, indirect,
            incidental, consequential, special, or punitive damages arising from your use of the Service, reliance on its
            content, or inability to access it. This includes but is not limited to damages related to vehicle repairs, accidents,
            personal injury, property damage, lost data, lost profits, or lost time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">8. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be reflected in the &quot;Last updated&quot; date
            at the top of this page. Continued use of the Service after an update means you accept the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">9. Contact</h2>
          <p>
            Questions about these Terms can be sent to{" "}
            <a href="mailto:hello@recallscanner.com" className="text-brand hover:underline">hello@recallscanner.com</a>
            {" "}or via our <Link href="/contact" className="text-brand hover:underline">contact page</Link>.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">&larr; Back to Home</Link>
      </div>
    </div>
  );
}
