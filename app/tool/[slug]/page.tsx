import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { HealthValue } from "@/components/health";
import { JsonLd } from "@/components/json-ld";
import { LinkedText } from "@/components/linked-text";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { ToolTable } from "@/components/tool-table";
import { Avatar } from "@/components/ui/avatar";
import { getTool, replacesFor, similarTools, snapshotAt, toRow, tools, type Tool } from "@/lib/data";
import { formatDate, formatNumber, siteName, siteUrl } from "@/lib/format";
import { licenseSuffix, metaDescription } from "@/lib/seo";
import { ui } from "@/lib/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

/** Search results show about 60 characters; drop the site suffix before cutting the tagline. */
function pageTitle(tool: Tool): Metadata["title"] {
  const base = `${tool.name} — ${tool.tagline}`;
  return base.length + ` | ${siteName}`.length <= 60 ? base : { absolute: base };
}

function pageDescription(tool: Tool) {
  return metaDescription(tool.description.join(" "), licenseSuffix(tool.license));
}

export async function generateMetadata({ params }: PageProps<"/tool/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  const path = `/tool/${tool.slug}`;
  return {
    title: pageTitle(tool),
    description: pageDescription(tool),
    alternates: { canonical: path },
    // Replaces the layout's openGraph (metadata merges shallowly), so repeat type and siteName.
    openGraph: { type: "website", siteName, url: path },
  };
}

// schema.org application categories that Google recognizes, by directory category.
const APP_CATEGORY: Record<string, string> = {
  "coding-agents": "DeveloperApplication",
  "local-llm": "DeveloperApplication",
  "agent-frameworks": "DeveloperApplication",
  "chat-interfaces": "UtilitiesApplication",
  "ai-search": "ReferenceApplication",
  "image-generation": "MultimediaApplication",
  "speech-to-text": "MultimediaApplication",
  "text-to-speech": "MultimediaApplication",
};

export default async function ToolPage({ params }: PageProps<"/tool/[slug]">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const h = tool.health;
  const replaces = replacesFor(tool);
  const elsewhere = tool.elsewhere.links.map((slug) => getTool(slug)!);
  // Tools already recommended in "Who it's for" are not listed a second time.
  const similar = similarTools(tool, 4, new Set(tool.elsewhere.links));
  const url = `${siteUrl}/tool/${tool.slug}`;
  // Google requires paid links to be qualified as sponsored.
  const rel = tool.sponsored ? "sponsored nofollow noopener" : "nofollow noopener";

  return (
    <article>
      <PageHeader
        compact
        crumbs={[
          { name: "Categories", href: "/category" },
          { name: tool.categoryName, href: `/category/${tool.category}` },
          { name: tool.name, href: `/tool/${tool.slug}` },
        ]}
        media={<Avatar src={tool.avatarUrl} name={tool.name} size={40} />}
        title={tool.name}
        lede={tool.tagline}
        actions={<>
          {tool.website && <ExternalButton href={tool.website} rel={rel} primary>Visit website</ExternalButton>}
          <ExternalButton href={tool.githubUrl} rel={rel} primary={!tool.website}>GitHub</ExternalButton>
        </>}
      />

      <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-hairline py-4 sm:grid-cols-4">
        <div className="min-w-0">
          <dt><Link href="/health-score" className={`${ui.label} hover:text-fg`}>Health</Link></dt>
          <dd className="mt-1"><HealthValue health={h} /></dd>
        </div>
        <Fact label="Stars"><span className="tabular-nums">{tool.stars == null ? "—" : formatNumber(tool.stars)}</span></Fact>
        <Fact label="License">{tool.license ?? "Unknown"}</Fact>
        <Fact label="Language">{tool.language ?? "—"}</Fact>
      </dl>
      {tool.licenseNote && <p className="mt-2 text-[12px] text-fg-muted">{tool.licenseNote}</p>}
      {tool.sponsored && <p className="mt-2 text-[12px]"><Link href="/sponsor" className={ui.link}>Sponsored listing</Link></p>}

      <div className="lg:grid lg:grid-cols-2 lg:gap-10">
        <Section title={`About ${tool.name}`} narrow compact>
          <div className={ui.prose}>
            {tool.description.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Section>
        <Section title="Who it’s for" narrow compact>
          <dl className="space-y-4 text-[15px] leading-relaxed text-pretty">
            <div>
              <dt className={ui.label}>Good fit</dt>
              <dd className="mt-0.5">{tool.fit}</dd>
            </div>
            <div>
              <dt className={ui.label}>Look elsewhere</dt>
              <dd className="mt-0.5"><LinkedText text={tool.elsewhere.text} links={elsewhere.map((t) => ({ name: t.name, href: `/tool/${t.slug}` }))} /></dd>
            </div>
          </dl>
        </Section>
      </div>

      {replaces.length > 0 && <Section title="Replaces" narrow compact>
        <ul className="space-y-3 text-[15px] leading-relaxed">
          {replaces.map((r) => <li key={r.slug}>
            <Link href={`/alternative-to/${r.slug}`} className={`font-medium ${ui.link}`}>{r.name}</Link>
            <p className="mt-0.5 text-pretty text-fg-muted">{r.why}</p>
          </li>)}
        </ul>
      </Section>}

      <details className="mt-10 block max-w-[65ch] border-t border-hairline pt-4 text-[13px]">
        <summary className="w-fit cursor-pointer text-fg-muted hover:text-fg">Repository details</summary>
        <div className="mt-4 space-y-4 text-pretty">
          <p>Last commit · <time dateTime={tool.lastCommitAt ?? undefined}>{formatDate(tool.lastCommitAt)}</time></p>
          {tool.githubTopics.length > 0 && <p><span className="font-medium">Topics</span> · {tool.githubTopics.join(" · ")}</p>}
          {tool.licenseDetails && <div>
            <p className="font-medium">{tool.licenseDetails.name}</p>
            {tool.licenseDetails.description && <p className="mt-1">{tool.licenseDetails.description}</p>}
            <dl className="mt-3 space-y-2">{(["permissions", "conditions", "limitations"] as const).map((key) =>
              tool.licenseDetails![key].length > 0 && <div key={key}>
                <dt className="font-medium">{key[0].toUpperCase() + key.slice(1)}</dt>
                <dd>{tool.licenseDetails![key].join(" · ")}</dd>
              </div>
            )}</dl>
            {tool.licenseDetails.url && <a href={tool.licenseDetails.url} target="_blank" rel="noopener noreferrer" className={`${ui.link} mt-3 inline-block`}>License guide</a>}
          </div>}
          <CopyButton text={`[![Health Score](${siteUrl}/badge/${tool.slug}.svg)](${url})`} label="Copy badge" hint="Markdown for a Health Score badge in your README" />
        </div>
      </details>

      {similar.length > 0 && (
        <Section title="Similar tools" compact>
          <ToolTable rows={similar.map((t) => toRow(t))} sortable={false} label="Similar tools" />
        </Section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": url,
              url,
              name: `${tool.name} — ${tool.tagline}`,
              description: pageDescription(tool),
              inLanguage: "en",
              dateModified: snapshotAt,
              isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: siteName, url: `${siteUrl}/` },
              primaryImageOfPage: { "@type": "ImageObject", url: `${url}/opengraph-image`, width: 1200, height: 630 },
              mainEntity: { "@id": `${url}#software` },
            },
            {
              // Both types: an installable app whose source is public, which is what gets a tool listed.
              "@type": ["SoftwareApplication", "SoftwareSourceCode"],
              "@id": `${url}#software`,
              name: tool.name,
              description: tool.description.join(" "),
              applicationCategory: APP_CATEGORY[tool.category] ?? "DeveloperApplication",
              applicationSubCategory: tool.categoryName,
              keywords: tool.tags.join(", "),
              ...(tool.license ? { license: `https://spdx.org/licenses/${tool.license}.html` } : {}),
              ...(tool.avatarUrl ? { image: tool.avatarUrl } : {}),
              url: tool.website ?? tool.githubUrl,
              codeRepository: tool.githubUrl,
              ...(tool.language ? { programmingLanguage: tool.language } : {}),
              ...(tool.createdAt ? { dateCreated: tool.createdAt } : {}),
              ...(tool.lastCommitAt ? { dateModified: tool.lastCommitAt } : {}),
              sameAs: [tool.githubUrl, ...(tool.website ? [tool.website] : [])],
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }}
      />
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={ui.label}>{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function ExternalButton({
  href,
  rel,
  primary,
  children,
}: {
  href: string;
  rel: string;
  primary?: boolean;
  children: string;
}) {
  return (
    <a
      href={href}
      rel={rel}
      className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-[background-color,scale] duration-100 ease-out active:scale-[0.96] ${
        primary ? "bg-fg text-canvas hover:bg-fg/90" : "border border-hairline text-fg hover:bg-surface"
      }`}
    >
      {children}
      <ArrowUpRight aria-hidden="true" strokeWidth={2} className="size-3.5" />
      <span className="sr-only">(opens external site)</span>
    </a>
  );
}
