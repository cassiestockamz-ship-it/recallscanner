import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehicle Recall Reports — Monthly Safety Updates",
  description:
    "Monthly vehicle recall reports summarizing the latest safety recalls, trends, and what you need to know. Powered by NHTSA data.",
  alternates: { canonical: "https://www.recallscanner.com/blog" },
};

// Blog post registry -- add new monthly reports here
const posts = [
  {
    slug: "march-2026-vehicle-recalls",
    title: "March 2026 Vehicle Recalls: What You Need to Know",
    date: "2026-03-29",
    excerpt:
      "76 recalls issued in 2026 so far, affecting Ford, Toyota, Hyundai, BMW, and more. Here are the most critical ones and what to do if your vehicle is affected.",
  },
];

export default function BlogIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Recall Reports</h1>
      <p className="text-slate-500 mb-8">
        Monthly summaries of vehicle safety recalls, trends, and what you need to know.
      </p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white border border-border rounded-lg p-6 hover:border-brand transition-colors"
          >
            <time className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
            <h2 className="text-lg font-bold text-slate-800 mt-1 mb-2">{post.title}</h2>
            <p className="text-sm text-slate-500">{post.excerpt}</p>
            <span className="text-sm text-brand font-medium mt-2 inline-block">Read report &rarr;</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-surface rounded-lg p-6 text-center">
        <h2 className="font-semibold text-lg mb-2">Check Your Vehicle Now</h2>
        <p className="text-sm text-slate-500 mb-4">Don't wait for a monthly report. Look up your vehicle instantly.</p>
        <Link href="/vin" className="text-brand font-medium hover:underline">Free VIN Lookup &rarr;</Link>
      </div>
    </div>
  );
}
