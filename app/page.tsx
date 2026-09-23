import type { Metadata } from "next";
import { Directory } from "@/components/directory";
import { categories, snapshotAt, toRow, tools, toolsInCategory } from "@/lib/data";
import { repoUrl, siteName, siteUrl } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import { Hero } from "@/components/hero";
import { ui } from "@/lib/ui";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero count={tools.length} categories={categories.length} updated={snapshotAt} />

      <section id="tools" aria-label="Browse tools" tabIndex={-1} className={`${ui.headerGap} scroll-mt-6 rounded-lg`}>
        <Directory
          rows={tools.map((t) => toRow(t))}
          categories={categories
            .filter((c) => toolsInCategory(c.slug).length > 0)
            .map(({ slug, name }) => ({ slug, name }))}
          reportUrl={`${repoUrl}/issues`}
        />
      </section>
      <JsonLd
        data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, name: siteName, url: `${siteUrl}/` }}
      />
    </>
  );
}
