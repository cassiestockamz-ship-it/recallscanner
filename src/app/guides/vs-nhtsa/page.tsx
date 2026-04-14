import type { Metadata } from "next";
import Link from "next/link";
import GuideShell from "@/components/GuideShell";

export const metadata: Metadata = {
  title: "RecallScanner vs NHTSA: Why Use Both",
  description:
    "NHTSA is the authoritative source for vehicle recall data. RecallScanner sits on top of it with a severity score, plain-English hooks, and a faster VIN lookup. Here's how to decide which to use when.",
  alternates: { canonical: "https://www.recallscanner.com/guides/vs-nhtsa" },
};

export default function Page() {
  return (
    <GuideShell
      slug="vs-nhtsa"
      eyebrow="Methodology"
      title="RecallScanner vs NHTSA: why use both"
      lede="We'll be honest: if you only use one recall tool, use NHTSA's. They're the source of truth. RecallScanner exists because NHTSA's official site is optimized for regulators and litigators, not for someone standing in their driveway trying to figure out if their car is safe to drive to work tomorrow."
      readingTime="5 min read"
      updated="2026-04-14"
      related={[
        { slug: "how-recalls-work", eyebrow: "Primer", title: "How vehicle recalls actually work" },
        { slug: "what-to-do", eyebrow: "Action", title: "What to do if your car has an open recall" },
      ]}
    >
      <h2>NHTSA is the source of truth</h2>
      <p>
        The National Highway Traffic Safety Administration runs the official U.S. recall program. Every recall campaign in existence has a NHTSA Campaign Number, and every defect investigation, complaint, and crash report is part of NHTSA's public database. When it comes to <em>whether a recall exists</em>, NHTSA is authoritative. Nobody else is.
      </p>
      <p>
        We recommend using NHTSA's own tools any time you're about to make a significant decision: buying a used car, handing over keys, starting a long road trip. Their site is at <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer">nhtsa.gov/recalls</a>, and the VIN lookup is at <a href="https://vinrcl.safercar.gov/vin/" target="_blank" rel="noopener noreferrer">vinrcl.safercar.gov/vin</a>.
      </p>
      <p>
        Our recall data is sourced <strong>from</strong> NHTSA. We don't make up campaigns, we don't delete campaigns, and we don't charge for them. What we do is pre-fetch NHTSA's data daily into our own database and render it faster, with more context, on a faster site.
      </p>

      <h2>What RecallScanner adds on top</h2>
      <p>
        We built RecallScanner because there's a gap NHTSA structurally can't fill: <strong>a severity read</strong>. Government sites don't rank risks. They publish facts equally and leave interpretation to the user. That's appropriate for a regulator. It would be weird if NHTSA told you "this recall is scarier than that one." But it's frustrating for someone who just wants to know whether their car is safe.
      </p>
      <p>
        Four things we do that NHTSA doesn't:
      </p>

      <h3>1. Severity-scored verdicts</h3>
      <p>
        Every recall in our database gets a <strong>RecallScore</strong> from 0 to 100, derived from the consequence language, the category of the defect (airbag vs. lighting, for instance), and whether the underlying complaints mention fire, crash, injury, or death. Every vehicle you VIN-check gets a one-screen verdict: <strong>ALL CLEAR</strong>, <strong>WATCH</strong>, or <strong>ACTION NEEDED</strong>. You can see exactly how it's computed in our <Link href="/methodology">methodology</Link>.
      </p>

      <h3>2. Plain-English hooks</h3>
      <p>
        NHTSA's defect language is written by lawyers and engineers. It reads like: "The front passenger air bag module may contain an improperly manufactured inflator that may result in the propellant being degraded by environmental moisture over time." We rewrite that into: "An inflator rupture can cause metal fragments striking the vehicle occupants resulting in serious injury." Same fact. Different audience.
      </p>

      <h3>3. Full model history on one page</h3>
      <p>
        NHTSA's site shows recall campaigns individually, one at a time. We pre-assemble every campaign in a model's history into a single page with year filtering, severity bucketing, and a search-within-page input. For a vehicle like the Ford F-150, which has dozens of historical campaigns, that's the difference between reading 48 separate pages and scrolling one.
      </p>

      <h3>4. A faster front door</h3>
      <p>
        NHTSA's VIN lookup tool is a standard government form on a separate subdomain. Ours is a VIN input with a live decoder strip that identifies your vehicle as you type, then gives you a verdict in under a second. Both reach the same underlying data. One of them feels like a consumer product.
      </p>

      <h2>When to use which</h2>
      <p>
        We genuinely mean this:
      </p>
      <ul>
        <li><strong>Quick check on your daily driver.</strong> Use RecallScanner. The verdict card is faster.</li>
        <li><strong>Buying a used car.</strong> Use both. Start with RecallScanner for the severity read, then double-check the VIN at <a href="https://vinrcl.safercar.gov/vin/" target="_blank" rel="noopener noreferrer">vinrcl.safercar.gov</a> as a sanity test before any money changes hands.</li>
        <li><strong>Filing a complaint about a defect.</strong> Go straight to NHTSA. Complaints filed at <a href="https://www.nhtsa.gov/report-a-safety-problem" target="_blank" rel="noopener noreferrer">nhtsa.gov/report-a-safety-problem</a> become part of the public record and can trigger future investigations.</li>
        <li><strong>Looking for the raw legal text of a campaign.</strong> Our recall cards link directly to the NHTSA campaign page via the NHTSA Campaign Number. Every card has an "NHTSA ↗" link in the corner.</li>
      </ul>

      <h2>What we won't do</h2>
      <p>
        We won't charge for VIN lookups. We won't require signup. We won't store the VINs you check. We won't sell your data. We won't invent recalls that NHTSA hasn't published. We won't tell you a car is dangerous when NHTSA says it's fine. Our reputation is downstream of NHTSA's, and if we ever diverged from their record we'd lose every user we have and deserve to.
      </p>

      <div className="callout callout-brand">
        <div>
          <strong className="block mb-1">Bottom line</strong>
          NHTSA is the source of truth. RecallScanner is the severity layer and the fast front door. Use ours for speed and plain English, use theirs when you need the raw legal record. They're complementary, not competitive.
        </div>
      </div>
    </GuideShell>
  );
}
