import type { Metadata } from "next";
import { Directory } from "@/components/directory";
import { categories, toRow, tools, toolsInCategory } from "@/lib/data";
import { repoUrl, siteName, siteUrl } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/lib/ui";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <PageHeader
        hero
        title="Open-source AI tools, carefully picked."
        lede={`${tools.length} tools, each reviewed by hand and scored on stars and commit activity.`}
      />

      <div className={ui.headerGap}>
        <Directory
          rows={tools.map((t) => toRow(t))}
          categories={categories
            .filter((c) => toolsInCategory(c.slug).length > 0)
            .map(({ slug, name }) => ({ slug, name }))}
          reportUrl={`${repoUrl}/issues`}
        />
      </div>
      <JsonLd
        data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, name: siteName, url: `${siteUrl}/` }}
      />
    </>
  );
}
