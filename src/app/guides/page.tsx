import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Scale, GitCompare, ListChecks, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Recall Guides",
  description:
    "Plain-English guides to vehicle recalls: how the system works, your consumer rights, what to do with an open campaign, and how RecallScanner compares to NHTSA.",
  alternates: { canonical: "https://www.recallscanner.com/guides" },
};

const GUIDES = [
  {
    slug: "how-recalls-work",
    eyebrow: "Primer",
    title: "How vehicle recalls actually work",
    teaser:
      "What triggers a recall, who pays for the repair, and why so many open campaigns linger for years on the road.",
    readingTime: "6 min",
    icon: BookOpen,
  },
  {
    slug: "your-rights",
    eyebrow: "Rights",
    title: "Your rights when a vehicle is recalled",
    teaser:
      "Free repairs, any authorized dealer, loaners, refunds, and the right to be notified. Here's what federal law actually guarantees you.",
    readingTime: "7 min",
    icon: Scale,
  },
  {
    slug: "vs-nhtsa",
    eyebrow: "Methodology",
    title: "RecallScanner vs NHTSA: why use both",
    teaser:
      "NHTSA is the source of truth. We're the severity layer and the fast front door. Here's when to use which.",
    readingTime: "5 min",
    icon: GitCompare,
  },
  {
    slug: "what-to-do",
    eyebrow: "Action",
    title: "What to do if your car has an open recall",
    teaser:
      "A five-step playbook from reading the campaign text to calling the dealer to handling Do-Not-Drive notices.",
    readingTime: "6 min",
    icon: ListChecks,
  },
];

export default function GuidesIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-10">
        <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-2">
          Plain-English reference
        </div>
        <h1 className="text-[36px] md:text-[48px] leading-[1.02] font-bold tracking-tight text-slate-900 mb-3">
          Recall guides
        </h1>
        <p className="text-slate-600 text-[16px] md:text-[17px] max-w-[60ch] leading-snug">
          Short, factual walkthroughs of how the vehicle recall system works in the U.S., what your rights are, and what to do if your car has an open campaign. Written in plain English, not legalese.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {GUIDES.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group relative rounded-2xl border border-[var(--color-border)] bg-white p-5 md:p-6 hover:border-[var(--color-brand)] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl grid place-items-center bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand)] group-hover:bg-[var(--color-brand)] group-hover:text-white transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 mb-1.5">
                    <span>{g.eyebrow}</span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} /> {g.readingTime}
                    </span>
                  </div>
                  <h2 className="font-bold text-slate-900 text-[17px] leading-snug mb-1.5 group-hover:text-[var(--color-brand)] transition-colors">
                    {g.title}
                  </h2>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">
                    {g.teaser}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read guide <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA strip */}
      <section className="mt-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8 text-center">
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
          Got a specific vehicle in mind?
        </div>
        <h2 className="text-[20px] md:text-[24px] font-bold text-slate-900 mb-2">
          Skip the reading and check your VIN.
        </h2>
        <p className="text-[14px] text-slate-500 mb-5 max-w-[48ch] mx-auto">
          Our VIN lookup hits NHTSA's live API and gives you a severity-scored verdict in seconds.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[var(--color-brand)] text-white font-semibold text-[14px] hover:bg-[#1635a1] transition-colors"
        >
          Go to VIN checker <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
