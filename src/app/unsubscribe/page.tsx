import Link from "next/link";
import type { Metadata } from "next";
import { validUnsubscribeToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe From Recall Alerts",
  description: "Stop RecallScanner recall alert emails.",
  robots: { index: false, follow: false },
};

type Params = { id?: string; t?: string; done?: string; invalid?: string; error?: string };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Params> }) {
  const { id, t, done, invalid, error } = await searchParams;
  const linkOk = validUnsubscribeToken(id, t);

  let body: React.ReactNode;
  if (done) {
    body = <p>You are unsubscribed. RecallScanner will not email you about recalls again.</p>;
  } else if (error) {
    body = (
      <p>
        Something went wrong and you are not unsubscribed yet. Please try the link again, or{" "}
        <Link href="/contact" className="text-blue-600 underline">contact us</Link> and we will remove you.
      </p>
    );
  } else if (linkOk) {
    body = (
      <form method="post" action="/api/unsubscribe" className="space-y-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="t" value={t} />
        <p>Press the button to stop recall alert emails for this address.</p>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Unsubscribe
        </button>
      </form>
    );
  } else if (invalid || id || t) {
    body = (
      <p>
        This unsubscribe link could not be checked. Use the link from your most recent RecallScanner email, or{" "}
        <Link href="/contact" className="text-blue-600 underline">contact us</Link> and we will remove you.
      </p>
    );
  } else {
    body = (
      <p>
        To stop recall alert emails, use the unsubscribe link at the bottom of any RecallScanner email. You can also{" "}
        <Link href="/contact" className="text-blue-600 underline">contact us</Link> and we will remove you.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Recall alert emails</h1>
      <div className="text-slate-700 leading-relaxed">{body}</div>
    </div>
  );
}
