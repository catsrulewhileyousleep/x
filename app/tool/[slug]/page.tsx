import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyButton } from "@/components/copy-button";
import { HealthValue } from "@/components/health";
import { JsonLd } from "@/components/json-ld";
import { ToolAvatar } from "@/components/tool-avatar";
import { ToolTable } from "@/components/tool-table";
import { getTool, replacesFor, similarTools, toRow, tools } from "@/lib/data";
import { formatDate, formatNumber, siteUrl } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tool/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — ${tool.tagline}`,
    description: tool.description[0],
    alternates: { canonical: `/tool/${tool.slug}` },
  };
}

const h2 = "text-[15px] font-medium";
const link = "underline decoration-fg-muted underline-offset-[0.2em] hover:decoration-fg";

export default async function ToolPage({ params }: PageProps<"/tool/[slug]">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const replaces = replacesFor(tool);
  const similar = similarTools(tool);
  const h = tool.health;

  return (
    <article>
      <Breadcrumbs
        items={[
          { name: "Categories", href: "/category" },
          { name: tool.categoryName, href: `/category/${tool.category}` },
          { name: tool.name, href: `/tool/${tool.slug}` },
        ]}
      />

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="mt-1">
            <ToolAvatar src={tool.avatarUrl} size={48} />
          </span>
          <div className="min-w-0">
            <h1 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
              {tool.name}
            </h1>
            <p className="mt-2 max-w-[55ch] text-[15px] text-pretty text-fg-muted">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {tool.website && (
            <ExternalButton href={tool.website} primary>
              Visit website
            </ExternalButton>
          )}
          <ExternalButton href={tool.githubUrl} primary={!tool.website}>
            GitHub
          </ExternalButton>
          <CopyButton
            text={`[![Health Score](${siteUrl}/badge/${tool.slug}.svg)](${siteUrl}/tool/${tool.slug})`}
            label="Copy badge"
          />
        </div>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-hairline py-5 sm:grid-cols-3 lg:grid-cols-6">
        <Meta label="Health Score">
          <HealthValue health={h} />
          <Note>
            {h.status === "scored" ? (
              <>
                <span className="block">Popularity {h.popularity}</span>
                <span className="block">Maintenance {h.maintenance}</span>
              </>
            ) : (
              h.reason
            )}
          </Note>
        </Meta>
        <Meta label="Stars">
          <span className="tabular-nums">{formatNumber(tool.stars ?? 0)}</span>
        </Meta>
        <Meta label="License">
          {tool.license ?? "Unknown"}
          {tool.licenseNote && <Note>{tool.licenseNote}</Note>}
        </Meta>
        <Meta label="Last commit">
          <span className="tabular-nums">{formatDate(tool.lastCommitAt)}</span>
        </Meta>
        <Meta label="Language">{tool.language ?? "—"}</Meta>
        <Meta label="Created">
          <span className="tabular-nums">{formatDate(tool.createdAt)}</span>
        </Meta>
      </dl>

      <div className="mt-12 max-w-[65ch] space-y-4 text-[15px] leading-relaxed text-pretty">
        {tool.description.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      {replaces.length > 0 && (
        <section aria-labelledby="replaces" className="mt-14 max-w-[65ch]">
          <h2 id="replaces" className={h2}>
            Replaces
          </h2>
          <ul className="mt-3 space-y-3">
            {replaces.map((r) => (
              <li key={r.slug}>
                <Link href={`/alternative-to/${r.slug}`} className={`font-medium ${link}`}>
                  {r.name}
                </Link>
                <p className="mt-0.5 text-pretty text-fg-muted">{r.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-14">
          <h2 id="similar" className={`mb-3 ${h2}`}>
            Similar tools
          </h2>
          <ToolTable rows={similar.map((t) => toRow(t))} sortable={false} label="Similar tools" />
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.name,
          description: tool.description.join(" "),
          url: `${siteUrl}/tool/${tool.slug}`,
          applicationCategory: "DeveloperApplication",
          ...(tool.license ? { license: `https://spdx.org/licenses/${tool.license}.html` } : {}),
          sameAs: [tool.githubUrl, ...(tool.website ? [tool.website] : [])],
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] text-fg-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-[13px] text-pretty text-fg-muted">{children}</span>;
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
