import type { MetadataRoute } from "next";
import { alternatives, indexableCategories, snapshotAt, tools } from "@/lib/data";
import { siteUrl } from "@/lib/format";

// Only indexable pages: noindex categories and unpublished alternatives are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(snapshotAt);
  const paths = [
    "/",
    "/health-score",
    "/sponsor",
    "/category",
    "/alternative-to",
    ...indexableCategories.map((c) => `/category/${c.slug}`),
    ...alternatives.map((a) => `/alternative-to/${a.slug}`),
  ];
  return [
    ...paths.map((p) => ({ url: `${siteUrl}${p}`, lastModified })),
    ...tools.map((t) => ({
      url: `${siteUrl}/tool/${t.slug}`,
      lastModified,
      images: [`${siteUrl}/tool/${t.slug}/opengraph-image`],
    })),
  ];
}
