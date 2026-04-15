/**
 * BreadcrumbList JSON-LD helper. Every page that emits a breadcrumb nav
 * should also emit this schema — Google renders the trail in SERP
 * results instead of the raw URL path.
 *
 * Usage (server component):
 *
 *   import { breadcrumbJsonLd } from "@/lib/breadcrumb";
 *   const ld = breadcrumbJsonLd([
 *     { name: "Home", href: "/" },
 *     { name: "Guides", href: "/guides" },
 *     { name: "How recalls work", href: "/guides/how-recalls-work" },
 *   ]);
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
 *   />
 */

const BASE = "https://www.recallscanner.com";

export interface BreadcrumbItem {
  name: string;
  /** Path relative to the site root, e.g. `/guides` */
  href: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href === "/" ? `${BASE}/` : `${BASE}${item.href}`,
    })),
  };
}
