import type { MetadataRoute } from "next";
import { alternatives, indexableCategories, snapshotAt, tools } from "@/lib/data";
import { siteUrl } from "@/lib/format";

// Only indexable pages: noindex categories and unpublished alternatives are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(snapshotAt);
  const paths = [
    "/",
    "/health-score",
    ...indexableCategories.map((c) => `/category/${c.slug}`),
    ...alternatives.map((a) => `/alternative-to/${a.slug}`),
    ...tools.map((t) => `/tool/${t.slug}`),
  ];
  return paths.map((p) => ({ url: `${siteUrl}${p}`, lastModified }));
}
