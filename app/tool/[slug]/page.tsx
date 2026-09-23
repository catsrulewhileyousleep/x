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
import { ToolAvatar } from "@/components/tool-avatar";
import { ToolTable } from "@/components/tool-table";
import { getTool, replacesFor, similarTools, snapshotAt, toRow, tools, type Tool } from "@/lib/data";
import { clip, formatDate, formatNumber, siteName, siteUrl } from "@/lib/format";
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

export async function generateMetadata({ params }: PageProps<"/tool/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  return {
    title: pageTitle(tool),
    description: clip(tool.description[0], 155),
    alternates: { canonical: `/tool/${tool.slug}` },
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

  return (
    <article>
      <PageHeader
        crumbs={[
          { name: "Categories", href: "/category" },
          { name: tool.categoryName, href: `/category/${tool.category}` },
          { name: tool.name, href: `/tool/${tool.slug}` },
        ]}
        media={<ToolAvatar src={tool.avatarUrl} size={48} />}
        title={tool.name}
        lede={tool.tagline}
        actions={
          <>
            {tool.website && (
              <ExternalButton href={tool.website} primary>
                Visit website
              </ExternalButton>
            )}
            <ExternalButton href={tool.githubUrl} primary={!tool.website}>
              GitHub
            </ExternalButton>
            <CopyButton text={`[![Health Score](${siteUrl}/badge/${tool.slug}.svg)](${url})`} label="Copy badge" />
          </>
        }
      />

      <dl className={`${ui.headerGap} grid grid-cols-2 gap-x-6 gap-y-5 border-y border-hairline py-5 sm:grid-cols-3 lg:grid-cols-6`}>
        <Fact label="Health" wide>
          <span className="flex flex-wrap items-baseline gap-x-3">
            <HealthValue health={h} />
            <span className={ui.label}>
              {h.status === "scored" ? `Popularity ${h.popularity} · Maintenance ${h.maintenance}` : h.reason}
            </span>
          </span>
        </Fact>
        <Fact label="Stars">
          <span className="tabular-nums">{tool.stars == null ? "—" : formatNumber(tool.stars)}</span>
        </Fact>
        <Fact label="License">
          {tool.license ?? "Unknown"}
          {tool.licenseNote && <span className={`mt-1 block text-pretty ${ui.label}`}>{tool.licenseNote}</span>}
        </Fact>
        <Fact label="Language">{tool.language ?? "—"}</Fact>
        <Fact label="Last commit">
          <time dateTime={tool.lastCommitAt ?? undefined} className="tabular-nums">
            {formatDate(tool.lastCommitAt)}
          </time>
        </Fact>
      </dl>

      <Section title={`About ${tool.name}`} narrow>
        <div className={ui.prose}>
          {tool.description.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Section>

      <Section title="Who it’s for" narrow>
        <dl className="space-y-4 text-[15px] leading-relaxed text-pretty">
          <div>
            <dt className={ui.label}>Good fit</dt>
            <dd className="mt-0.5">{tool.fit}</dd>
          </div>
          <div>
            <dt className={ui.label}>Look elsewhere</dt>
            <dd className="mt-0.5">
              <LinkedText
                text={tool.elsewhere.text}
                links={elsewhere.map((t) => ({ name: t.name, href: `/tool/${t.slug}` }))}
              />
            </dd>
          </div>
        </dl>
      </Section>

      {replaces.length > 0 && (
        <Section title="Replaces" narrow>
          <ul className="space-y-3 text-[15px] leading-relaxed">
            {replaces.map((r) => (
              <li key={r.slug}>
                <Link href={`/alternative-to/${r.slug}`} className={`font-medium ${ui.link}`}>
                  {r.name}
                </Link>
                <p className="mt-0.5 text-pretty text-fg-muted">{r.why}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {similar.length > 0 && (
        <Section title="Similar tools">
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
              description: clip(tool.description[0], 155),
              dateModified: snapshotAt,
              isPartOf: { "@type": "WebSite", name: siteName, url: `${siteUrl}/` },
              primaryImageOfPage: `${url}/opengraph-image`,
              mainEntity: { "@id": `${url}#software` },
            },
            {
              "@type": "SoftwareApplication",
              "@id": `${url}#software`,
              name: tool.name,
              description: tool.description.join(" "),
              applicationCategory: APP_CATEGORY[tool.category] ?? "DeveloperApplication",
              applicationSubCategory: tool.categoryName,
              ...(tool.license ? { license: `https://spdx.org/licenses/${tool.license}.html` } : {}),
              ...(tool.avatarUrl ? { image: tool.avatarUrl } : {}),
              url: tool.website ?? tool.githubUrl,
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

function Fact({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`min-w-0 ${wide ? "col-span-2" : ""}`}>
      <dt className={ui.label}>{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function ExternalButton({ href, primary, children }: { href: string; primary?: boolean; children: string }) {
  return (
    <a
      href={href}
      rel="nofollow noopener"
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-medium transition-[background-color,scale] duration-100 ease-out active:scale-[0.96] ${
        primary ? "bg-fg text-canvas hover:bg-fg/90" : "border border-hairline text-fg hover:bg-surface"
      }`}
    >
      {children}
      <ArrowUpRight aria-hidden="true" strokeWidth={2} className="size-3.5" />
      <span className="sr-only">(opens external site)</span>
    </a>
  );
}
