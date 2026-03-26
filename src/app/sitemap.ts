import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import { getAllModels } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.recallscanner.com";
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/recalls`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/vin`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/most-recalled`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  const brandPages: MetadataRoute.Sitemap = POPULAR_MAKES.map((make) => ({
    url: `${base}/recalls/${makeSlug(make)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Single Supabase query for all models -- no NHTSA API calls at build
  const allModels = await getAllModels();
  const modelPages: MetadataRoute.Sitemap = allModels.map((m) => ({
    url: `${base}/recalls/${m.make_slug}/${m.model_slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...modelPages];
}
