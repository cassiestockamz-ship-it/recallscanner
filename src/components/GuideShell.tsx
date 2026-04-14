import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import VinChecker from "./VinChecker";

interface RelatedGuide {
  slug: string;
  title: string;
  eyebrow: string;
}

interface Props {
  slug: string;         // e.g. "how-recalls-work"
  eyebrow: string;      // "Primer"
  title: string;
  lede: string;
  readingTime: string;  // e.g. "6 min read"
  updated: string;      // ISO date
  related: RelatedGuide[];
  children: React.ReactNode;
}

/**
 * Shared chrome for every /guides/[slug] page. Handles breadcrumb,
 * header block, reading-time line, body container, a "check your VIN"
 * CTA footer, and the cross-linked related guides. Content gets
 * rendered as `children` inside an article-grade max-width wrapper.
 */
export default function GuideShell({
  slug,
  eyebrow,
  title,
  lede,
  readingTime,
  updated,
  related,
  children,
}: Props) {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: lede,
    image: "https://www.recallscanner.com/opengraph-image.png",
    datePublished: updated,
    dateModified: updated,
    author: {
      "@type": "Organization",
      name: "RecallScanner",
      url: "https://www.recallscanner.com",
    },
    publisher: {
      "@type": "Organization",
      name: "RecallScanner",
      url: "https://www.recallscanner.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.recallscanner.com/icon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.recallscanner.com/guides/${slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.recallscanner.com/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://www.recallscanner.com/guides" },
      { "@type": "ListItem", position: 3, name: title, item: `https://www.recallscanner.com/guides/${slug}` },
    ],
  };

  // Speakable spec — lets Google Assistant / Search Generative read the
  // guide's headline + lede paragraph out loud on voice surfaces.
  const speakableLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `https://www.recallscanner.com/guides/${slug}`,
    name: title,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable='guide-title']", "[data-speakable='guide-lede']"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        {/* Breadcrumb */}
        <nav className="text-[12px] text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-[var(--color-brand)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/guides" className="hover:text-[var(--color-brand)]">Guides</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-3">
            <span>{eyebrow}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock size={11} /> {readingTime}
            </span>
          </div>
          <h1
            className="text-[34px] md:text-[46px] leading-[1.04] font-bold tracking-tight text-slate-900 mb-4"
            data-speakable="guide-title"
          >
            {title}
          </h1>
          <p
            className="text-[17px] md:text-[19px] text-slate-600 leading-snug max-w-[60ch]"
            data-speakable="guide-lede"
          >
            {lede}
          </p>
        </header>

        {/* Body */}
        <div className="guide-prose">
          {children}
        </div>

        {/* VIN CTA */}
        <section className="mt-14 rounded-3xl border border-[var(--color-border)] bg-white p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">
            The backstop
          </div>
          <h2 className="text-[22px] font-bold text-slate-900 mb-2">
            Check your specific vehicle
          </h2>
          <p className="text-slate-600 text-[14px] mb-5 max-w-[52ch]">
            Whatever the campaign history looks like, a VIN lookup hits NHTSA's live API and tells you exactly which open recalls apply to your car right now.
          </p>
          <VinChecker compact />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[16px] font-bold text-slate-900 mb-4">Keep reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/guides/${r.slug}`}
                  className="group rounded-2xl border border-[var(--color-border)] bg-white p-4 hover:border-[var(--color-brand)] transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                    {r.eyebrow}
                  </div>
                  <div className="font-semibold text-slate-900 text-[15px] group-hover:text-[var(--color-brand)] transition-colors flex items-center justify-between gap-2">
                    <span>{r.title}</span>
                    <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-[var(--color-brand)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
