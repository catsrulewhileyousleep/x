import { Directory } from "@/components/directory";
import { categories, toRow, tools, toolsInCategory } from "@/lib/data";
import { repoUrl, siteName, siteUrl } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <h1 className="max-w-[16ch] text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[3.5rem]">
        Open-source AI tools, carefully picked.
      </h1>
      <p className="mt-5 max-w-[60ch] text-[15px] text-pretty text-fg-muted">
        {tools.length} projects, each reviewed by hand and scored on stars and commit activity.
      </p>

      <div className="mt-12">
        <Directory
          rows={tools.map((t) => toRow(t))}
          categories={categories
            .filter((c) => toolsInCategory(c.slug).length > 0)
            .map(({ slug, name }) => ({ slug, name }))}
          contributeUrl={`${repoUrl}/issues`}
        />
      </div>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: `${siteUrl}/` }} />
    </>
  );
}
