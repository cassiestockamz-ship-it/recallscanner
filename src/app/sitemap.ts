import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.recallscanner.com";
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/recalls`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const brandPages: MetadataRoute.Sitemap = POPULAR_MAKES.map((make) => ({
    url: `${base}/recalls/${makeSlug(make)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...brandPages];
}
