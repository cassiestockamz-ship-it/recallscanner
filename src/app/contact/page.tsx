import Link from "next/link";
import type { Metadata } from "next";
import { breadcrumbJsonLd } from "@/lib/breadcrumb";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact RecallScanner with questions, corrections, media inquiries, or feedback about our vehicle recall lookup tool.",
  alternates: { canonical: "https://www.recallscanner.com/contact" },
};

export default function ContactPage() {
  const ld = breadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-bold mb-4">Contact RecallScanner</h1>

      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <p>
          We read every message we get. Whether you&apos;ve spotted an error on a recall page, you have a question about how our
          data works, or you&apos;re a journalist or researcher who wants to talk to us, here&apos;s the best way to reach us.
        </p>

        <section className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-semibold text-slate-800 mb-2">General contact</h2>
          <p>
            Email us at{" "}
            <a href="mailto:hello@recallscanner.com" className="text-brand hover:underline font-medium">hello@recallscanner.com</a>.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            We typically respond within 2 to 3 business days. For urgent safety concerns about your own vehicle, please contact
            NHTSA or your manufacturer directly. We&apos;re an information publisher, not a safety response service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Data corrections</h2>
          <p>
            If a page on RecallScanner shows a recall that doesn&apos;t match what you see on the NHTSA website, please include
            the page URL and a short description of what looks wrong. We&apos;ll re-check the live NHTSA API and update the page
            if needed. See our <Link href="/methodology" className="text-brand hover:underline">methodology page</Link> for how
            our data pipeline works.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Privacy, legal, and takedown</h2>
          <p>
            For privacy questions, see our <Link href="/privacy" className="text-brand hover:underline">privacy policy</Link>. For
            legal notices, rights-holder inquiries, or takedown requests, email{" "}
            <a href="mailto:hello@recallscanner.com" className="text-brand hover:underline">hello@recallscanner.com</a>{" "}
            with &quot;Legal&quot; in the subject line and we&apos;ll route it appropriately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Press and media</h2>
          <p>
            For media inquiries, interview requests, or data-citation questions about our monthly recall reports, email us at{" "}
            <a href="mailto:hello@recallscanner.com" className="text-brand hover:underline">hello@recallscanner.com</a>{" "}
            with &quot;Press&quot; in the subject line. We&apos;re happy to share our methodology and to link back to source
            NHTSA campaigns for any quote.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">What RecallScanner can&apos;t do for you</h2>
          <p>
            RecallScanner is an information site. We can&apos;t schedule your recall repair, contact your dealer on your behalf,
            represent you in a claim, or give you legal or mechanical advice. For any of those, please contact your vehicle&apos;s
            authorized dealer or an appropriate licensed professional. See our{" "}
            <Link href="/disclaimer" className="text-brand hover:underline">disclaimer</Link> for the full list of things we are
            and aren&apos;t.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">&larr; Back to Home</Link>
      </div>
    </div>
  );
}
