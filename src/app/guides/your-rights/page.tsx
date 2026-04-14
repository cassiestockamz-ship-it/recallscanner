import type { Metadata } from "next";
import Link from "next/link";
import GuideShell from "@/components/GuideShell";

export const metadata: Metadata = {
  title: "Your Rights When a Vehicle Is Recalled",
  description:
    "A plain-English walkthrough of the consumer rights federal law gives you under an active vehicle safety recall. Covers free repairs, any authorized dealer, loaners, refunds, and the right to be notified.",
  alternates: { canonical: "https://www.recallscanner.com/guides/your-rights" },
};

export default function Page() {
  return (
    <GuideShell
      slug="your-rights"
      eyebrow="Rights"
      title="Your rights when a vehicle is recalled"
      lede="Federal law (specifically the National Traffic and Motor Vehicle Safety Act) gives you a surprising amount of protection when your car, truck, SUV, motorcycle, or piece of equipment is under an active recall. Here's what you're actually entitled to, and where the fine print is."
      readingTime="7 min read"
      updated="2026-04-14"
      related={[
        { slug: "how-recalls-work", eyebrow: "Primer", title: "How vehicle recalls actually work" },
        { slug: "what-to-do", eyebrow: "Action", title: "What to do if your car has an open recall" },
      ]}
    >
      <h2>1. The repair is free. Period.</h2>
      <p>
        This is the fundamental right, and it's non-negotiable. The manufacturer has to cover parts, labor, and any reasonable associated costs of a recall remedy. You should <strong>never be charged</strong> for a recall repair. It doesn't matter whether you're the original owner, how many miles are on the odometer, or whether your factory warranty has long since lapsed.
      </p>
      <p>
        If a dealer or independent shop tries to bill you for work related to a recall campaign, something is wrong. Either they've misidentified the problem, they're trying to bundle unrelated work into the same invoice, or in rare cases they're hoping you don't know the rules. Ask them to itemize exactly which line items are covered by the recall and which are not.
      </p>

      <h2>2. Any authorized dealer can do the work</h2>
      <p>
        You are <strong>not</strong> required to go back to the dealership where you originally purchased the vehicle. Any dealer that's authorized to service your vehicle's brand can perform the recall repair and file for reimbursement from the manufacturer. If you've moved cities, if you hate the dealer you bought from, or if the closest authorized dealer is simply more convenient, you can use that one instead.
      </p>
      <p>
        In practice, this matters more than it sounds. Some owners avoid getting recalls fixed because they assume they have to drive back to the far-away dealership where they originally bought the car. They don't. The fix is available wherever you are.
      </p>

      <h2>3. You may be entitled to a loaner, refund, or repurchase</h2>
      <p>
        If the parts needed to perform the remedy aren't available yet (which happens more often than you'd think on high-volume recalls like Takata airbags or Hyundai/Kia theta-engine campaigns), the manufacturer is generally required to provide transportation or a loaner vehicle while you wait.
      </p>
      <p>
        In rarer cases, a defect escalates further. If a campaign can't be repaired within a reasonable time, or if the repair doesn't actually fix the problem, federal law can require the automaker to:
      </p>
      <ul>
        <li><strong>Refund</strong> the purchase price of the vehicle, minus a depreciation allowance.</li>
        <li><strong>Repurchase</strong> the vehicle outright at a fair market value.</li>
        <li>Replace the vehicle with a comparable one.</li>
      </ul>
      <p>
        These remedies are rare, but they exist. They're the reason Do-Not-Drive campaigns sometimes escalate into full buybacks over multi-year periods.
      </p>

      <h2>4. You have the right to be notified</h2>
      <p>
        Manufacturers are required by law to notify registered owners of record when a recall is issued against their vehicle. That obligation runs on the manufacturer's timeline and uses the address they have on file, which is often the address the vehicle was originally registered at, not yours.
      </p>
      <p>
        If you bought the car used, if you've changed addresses, or if you were the second, third, or fourth owner, there's a real chance a recall notification has been lost along the way. That's not a failure on your part. It's a structural gap in the notification system.
      </p>
      <p>
        The backstop for this is a <Link href="/">live VIN lookup</Link>. It hits NHTSA's current recall database directly and tells you whether your specific vehicle has an open campaign, regardless of whether you ever received the mailed notice.
      </p>

      <h2>5. Unresolved recalls don't disappear</h2>
      <p>
        There is <strong>no statute of limitations</strong> on a recall remedy for passenger vehicles. A campaign from 2012 is still redeemable today if nobody ever brought the car in. The recall moves with the vehicle across every resale, even if the paperwork doesn't.
      </p>
      <p>
        This is the most important thing to know if you buy a used car. Always check the seller's VIN before handing over money, and insist that any open recalls be resolved before the sale closes. Dealers know this. Private sellers sometimes don't.
      </p>

      <h2>This is not legal advice</h2>
      <p>
        Everything on this page is a plain-language summary of federal consumer-protection rules. It's not a substitute for talking to a licensed attorney if something has gone wrong. If you believe a defect has actually caused harm, if an automaker is refusing a remedy you're entitled to, or if you're looking at a lemon-law claim in your state, please talk to a real lawyer. Most initial consultations in this area are free.
      </p>
      <p>
        You can also file a complaint directly with NHTSA at <a href="https://www.nhtsa.gov/report-a-safety-problem" target="_blank" rel="noopener noreferrer">nhtsa.gov/report-a-safety-problem</a>. That complaint becomes part of the public record and can, over time, trigger the investigations that open future recalls.
      </p>

      <div className="callout callout-brand">
        <div>
          <strong className="block mb-1">Bottom line</strong>
          The repair is free, any authorized dealer can do it, and the recall doesn't expire. If a dealer tries to charge you, push back. If you're not sure whether your VIN is affected, <Link href="/">check it on the home page</Link>.
        </div>
      </div>
    </GuideShell>
  );
}
