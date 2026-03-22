import { POPULAR_MAKES, makeSlug, modelSlug, getModelsForMake } from "@/lib/nhtsa";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.recallscanner.com";
  const now = "2026-03-22T00:00:00.000Z";

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

  // Fetch model pages for top brands (limit to avoid too many API calls at build)
  const topBrands = ["Ford", "Toyota", "Honda", "Chevrolet", "Hyundai", "Kia", "Nissan", "Jeep", "BMW", "Tesla", "Subaru", "GMC"];
  const modelPages: MetadataRoute.Sitemap = [];

  for (const brand of topBrands) {
    try {
      const models = await getModelsForMake(brand);
      for (const m of models.slice(0, 20)) {
        modelPages.push({
          url: `${base}/recalls/${makeSlug(brand)}/${modelSlug(m.model)}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.7,
        });
      }
    } catch {
      // Skip if API fails
    }
  }

  return [...staticPages, ...brandPages, ...modelPages];
}
