import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "RecallScanner privacy policy. We do not collect or store personal information.",
  alternates: { canonical: "https://www.recallscanner.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>

      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Information We Collect</h2>
          <p>
            RecallScanner does not collect, store, or share any personally identifiable information.
            When you enter a VIN, it is sent directly to the NHTSA API for lookup and is not stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Cookies and Analytics</h2>
          <p>
            We may use basic analytics tools to understand how visitors use our site (page views, popular pages).
            These tools may use cookies. No personal data is collected through these tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Third-Party Services</h2>
          <p>
            RecallScanner uses the NHTSA API to retrieve recall data. When you perform a VIN lookup,
            your request is processed through NHTSA&apos;s public API. We encourage you to review{" "}
            <a href="https://www.nhtsa.gov/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              NHTSA&apos;s privacy policy
            </a>{" "}
            for information about how they handle data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Advertising</h2>
          <p>
            We may display advertisements on our site. Ad networks may use cookies to serve relevant ads.
            You can manage your ad preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Contact</h2>
          <p>
            If you have questions about this privacy policy, please contact us through our website.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href="/" className="text-brand hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
