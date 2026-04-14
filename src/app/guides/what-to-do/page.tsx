import type { Metadata } from "next";
import Link from "next/link";
import GuideShell from "@/components/GuideShell";

export const metadata: Metadata = {
  title: "What to Do If Your Car Has an Open Recall",
  description:
    "A step-by-step playbook for what to do the moment you find out your vehicle has an open safety recall, from reading the campaign text to calling the dealer to handling Do-Not-Drive notices.",
  alternates: { canonical: "https://www.recallscanner.com/guides/what-to-do" },
};

const HOW_TO_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "What to do if your car has an open recall",
  description:
    "A five-step playbook for handling an open vehicle safety recall, from reading the NHTSA campaign text to calling an authorized dealer and dealing with Do-Not-Drive notices.",
  image: "https://www.recallscanner.com/opengraph-image.png",
  totalTime: "P1W",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: 0 },
  supply: [
    { "@type": "HowToSupply", name: "Your 17-character VIN" },
    { "@type": "HowToSupply", name: "The NHTSA campaign number from your recall card" },
  ],
  tool: [
    { "@type": "HowToTool", name: "Phone" },
    { "@type": "HowToTool", name: "Vehicle registration" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Read the campaign text carefully",
      text: "Every NHTSA recall campaign has three fields you should read before calling the dealer: Summary (what the defect is), Consequence (what can go wrong), and Remedy (what the dealer will do to fix it).",
      url: "https://www.recallscanner.com/guides/what-to-do#step-1",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Decide whether it is safe to drive",
      text: "Most recalls are not Do-Not-Drive orders, but airbag, brake, steering, and fuel-system defects should be handled the same week. Do-Not-Drive advisories mean park the car immediately and call for a loaner.",
      url: "https://www.recallscanner.com/guides/what-to-do#step-2",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Call any authorized dealer",
      text: "You do not need the dealership you purchased from. Any dealer authorized to service your brand can perform the recall repair and bill the manufacturer. Have your VIN and the NHTSA campaign number ready.",
      url: "https://www.recallscanner.com/guides/what-to-do#step-3",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Ask about a loaner if parts are backordered",
      text: "On high-volume recalls, parts can be backordered for weeks or months. You may be entitled to a loaner vehicle while you wait, especially for safety-critical or Do-Not-Drive campaigns.",
      url: "https://www.recallscanner.com/guides/what-to-do#step-4",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Keep the paperwork",
      text: "Save the invoice or recall completion record from the dealer. It matters at resale time and is useful if the defect resurfaces. If you sell the car, pass the record to the buyer along with the title.",
      url: "https://www.recallscanner.com/guides/what-to-do#step-5",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOW_TO_LD) }}
      />
      <GuideShell
      slug="what-to-do"
      eyebrow="Action"
      title="What to do if your car has an open recall"
      lede="You ran your VIN and the verdict came back ACTION NEEDED. Here's exactly what to do next, in the order to do it. Most recall repairs take less than two hours in the bay, cost you nothing, and can be scheduled at whichever authorized dealer is convenient."
      readingTime="6 min read"
      updated="2026-04-14"
      related={[
        { slug: "your-rights", eyebrow: "Rights", title: "Your rights when a vehicle is recalled" },
        { slug: "how-recalls-work", eyebrow: "Primer", title: "How vehicle recalls actually work" },
      ]}
    >
      <h2 id="step-1">Step 1. Read the campaign text carefully</h2>
      <p>
        Every NHTSA recall campaign has three fields you should actually read before you pick up the phone: <strong>Summary</strong>, <strong>Consequence</strong>, and <strong>Remedy</strong>.
      </p>
      <ul>
        <li><strong>Summary</strong> describes the defect and the scope of affected vehicles.</li>
        <li><strong>Consequence</strong> tells you what happens if the defect triggers: what can go wrong, how bad, and under what driving conditions.</li>
        <li><strong>Remedy</strong> spells out exactly what the dealer will do to fix it and how long the repair takes.</li>
      </ul>
      <p>
        Our <Link href="/">VIN results page</Link> shows all three on every recall card. Tap "Show details" to expand. Read them before you book the appointment so you can ask informed questions at the dealer.
      </p>

      <h2 id="step-2">Step 2. Decide whether it's safe to drive in the meantime</h2>
      <p>
        Most recalls are <em>not</em> Do-Not-Drive orders. The overwhelming majority are things the dealer will fix at your next convenient service visit, and you can keep driving normally until then. The Consequence field will usually make the urgency clear.
      </p>
      <p>
        A few specific situations call for more caution:
      </p>
      <ul>
        <li><strong>DO NOT DRIVE advisories.</strong> NHTSA uses this exact phrase for a reason. If you see it, park the car immediately and don't drive it anywhere, not even to the dealer. Call the manufacturer's customer service line and ask about a loaner or tow.</li>
        <li><strong>PARK OUTSIDE advisories.</strong> These are fire-risk recalls where the defect can ignite while the car is parked. You can drive the car, but don't park it in a garage or near any structure until the remedy is performed.</li>
        <li><strong>Airbag, brake, and steering defects</strong> flagged with "serious injury" or "loss of control" language. These aren't always DO NOT DRIVE, but they should move to the top of your week, not the bottom.</li>
      </ul>
      <p>
        If you're genuinely unsure, call the manufacturer's customer service line before your next drive. They have a legal obligation to answer recall questions, they're familiar with the specific campaign, and the call is free.
      </p>

      <h2 id="step-3">Step 3. Call any authorized dealer</h2>
      <p>
        You don't need the dealership you bought from. Any dealer that's authorized to service your vehicle's brand can perform a recall repair and file for reimbursement from the manufacturer. Pick whichever is closest, has the best service department, or has the shortest wait for service appointments.
      </p>
      <p>
        When you call, have three things ready:
      </p>
      <ol>
        <li>Your <strong>17-character VIN</strong>, exactly as it appears on the registration.</li>
        <li>The <strong>NHTSA Campaign Number</strong> from our recall card (looks like <span className="font-mono">23V-456</span>).</li>
        <li>A rough sense of your availability over the next week or two.</li>
      </ol>
      <p>
        A good opening line: <em>"Hi, I'm calling about an open safety recall on my [year] [make] [model]. NHTSA Campaign Number is [number]. I'd like to schedule the repair."</em> The service advisor will confirm parts availability and book an appointment. If you want to copy a campaign number, every recall card on our site has a copy-to-clipboard button on the campaign number itself.
      </p>

      <h2 id="step-4">Step 4. Ask about a loaner if parts are backordered</h2>
      <p>
        On high-volume recalls, parts can be backordered for weeks or months. Takata airbag campaigns famously ran for years before every affected vehicle got a fixed inflator. If the dealer tells you the parts aren't available and the defect is significant, you may be entitled to a <strong>loaner vehicle</strong> while you wait.
      </p>
      <p>
        Ask explicitly: <em>"Since the parts aren't available yet and this is a [safety-critical / Do-Not-Drive] recall, can you provide a loaner until the remedy is complete?"</em> Some manufacturers provide loaners automatically. Others wait for you to ask. The worst they can say is no.
      </p>

      <h2 id="step-5">Step 5. Keep the paperwork</h2>
      <p>
        When the repair is complete, the dealer will give you an invoice or a recall completion record showing the campaign number and the work performed. <strong>Keep this</strong>. It matters at resale time (you can show a future buyer that the recall has been addressed) and it's useful if anything related to the same defect surfaces again later.
      </p>
      <p>
        If you sell the car, give the paperwork to the buyer along with the title. You're not legally required to, but you just saved them a phone call, and you've removed the recall's history from a VIN that otherwise might still show up as affected in some third-party databases for a few weeks.
      </p>

      <h2>Special case: Do-Not-Drive notices</h2>
      <p>
        Do-Not-Drive recalls are the rarest and most serious category. NHTSA reserves the exact phrase for defects where the <strong>next drive</strong> is the risk: a faulty Takata inflator that could rupture on any deployment, a fuel-pump failure that could stall you on the highway, a steering defect that could detach while cornering.
      </p>
      <p>
        If you have one:
      </p>
      <ol>
        <li>Stop driving the vehicle. This is not an overreaction; NHTSA does not use the phrase casually.</li>
        <li>Call the manufacturer's customer service line. They're required to arrange transport to and from the dealer at no cost.</li>
        <li>Ask about loaner vehicles, rental reimbursement, or alternative transportation during the wait.</li>
        <li>If the manufacturer refuses to help, file a complaint with NHTSA at <a href="https://www.nhtsa.gov/report-a-safety-problem" target="_blank" rel="noopener noreferrer">nhtsa.gov/report-a-safety-problem</a>.</li>
      </ol>

      <div className="callout callout-brand">
        <div>
          <strong className="block mb-1">Bottom line</strong>
          Read the campaign text, decide whether it's safe to drive, call any authorized dealer with the campaign number, and ask about a loaner if parts aren't ready. None of this should cost you anything, and none of it should take more than a week to get on the calendar. Start by <Link href="/">running your VIN</Link>.
        </div>
      </div>
      </GuideShell>
    </>
  );
}
