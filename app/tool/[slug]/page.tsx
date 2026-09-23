import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CopyButton } from "@/components/copy-button";
import { HealthValue } from "@/components/health";
import { JsonLd } from "@/components/json-ld";
import { ToolAvatar } from "@/components/tool-avatar";
import { ToolTable } from "@/components/tool-table";
import {
  categoryNeighbours,
  getTool,
  replacesFor,
  similarTools,
  snapshotAt,
  toRow,
  tools,
  type Tool,
} from "@/lib/data";
import { badgeValue, badgeWidth } from "@/lib/badge";
import { FRESH_DAYS, POPULARITY_CEILING, POPULARITY_FLOOR, STALE_DAYS, WEIGHTS } from "@/lib/health";
import { formatDate, formatNumber, formatStars, siteUrl } from "@/lib/format";

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
  const neighbours = categoryNeighbours(tool);
  const badgeMarkdown = `[![Health Score](${siteUrl}/badge/${tool.slug}.svg)](${siteUrl}/tool/${tool.slug})`;

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
        <div className="flex shrink-0 gap-2">
          {tool.website && (
            <ExternalButton href={tool.website} primary>
              Visit website
            </ExternalButton>
          )}
          <ExternalButton href={tool.githubUrl} primary={!tool.website}>
            GitHub
          </ExternalButton>
        </div>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-hairline py-4 sm:grid-cols-4">
        <Meta label="Health Score">
          <HealthValue health={tool.health} />
        </Meta>
        <Meta label="Stars">
          <span className="tabular-nums">{formatStars(tool.stars)}</span>
        </Meta>
        <Meta label="License">{tool.license ?? "Unknown"}</Meta>
        <Meta label="Last commit">
          <span className="tabular-nums">{formatDate(tool.lastCommitAt)}</span>
        </Meta>
      </dl>

      <div className="mt-12 grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-[65ch] space-y-14">
          <div className="space-y-4 text-[15px] leading-relaxed text-pretty">
            {tool.description.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          {replaces.length > 0 && (
            <section aria-labelledby="replaces">
              <h2 id="replaces" className={h2}>
                Alternative to
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

          <HealthBreakdown tool={tool} />
        </div>

        <aside className="min-w-0 space-y-10 text-[13px] lg:sticky lg:top-8 lg:self-start">
          <section aria-labelledby="details">
            <h2 id="details" className={h2}>
              Details
            </h2>
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
              <dt className="text-fg-muted">Category</dt>
              <dd>
                <Link href={`/category/${tool.category}`} className={link}>
                  {tool.categoryName}
                </Link>
              </dd>
              <dt className="text-fg-muted">Language</dt>
              <dd>{tool.language ?? "—"}</dd>
              <dt className="text-fg-muted">License</dt>
              <dd>
                {tool.license ?? "Unknown"}
                {tool.licenseNote && <span className="mt-0.5 block text-pretty text-fg-muted">{tool.licenseNote}</span>}
              </dd>
              <dt className="text-fg-muted">Created</dt>
              <dd className="tabular-nums">{formatDate(tool.createdAt)}</dd>
              <dt className="text-fg-muted">Tags</dt>
              <dd>{tool.tags.join(", ")}</dd>
              <dt className="text-fg-muted">Repository</dt>
              <dd className="truncate">
                <a href={tool.githubUrl} rel="nofollow noopener" className={link} title={tool.githubUrl}>
                  {tool.githubUrl.replace("https://github.com/", "")}
                </a>
              </dd>
            </dl>
            <p className="mt-3 text-fg-muted">Data from GitHub, {formatDate(snapshotAt)}.</p>
          </section>

          <section aria-labelledby="embed">
            <h2 id="embed" className={h2}>
              Embed the badge
            </h2>
            <p className="mt-1 text-pretty text-fg-muted">Show this score in your README. It updates with the data.</p>
            <Image
              src={`/badge/${tool.slug}.svg`}
              alt={`Health ${badgeValue(tool.health)}`}
              width={badgeWidth(tool.health)}
              height={20}
              unoptimized
              className="mt-3"
            />
            <code className="mt-3 block overflow-x-auto rounded-lg border border-hairline bg-surface px-3 py-2 text-xs whitespace-nowrap text-fg-muted">
              {badgeMarkdown}
            </code>
            <div className="mt-2">
              <CopyButton text={badgeMarkdown} label="Copy Markdown" />
            </div>
          </section>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-16">
          <h2 id="similar" className={`mb-3 ${h2}`}>
            Similar tools
          </h2>
          <ToolTable rows={similar.map((t) => toRow(t))} sortable={false} label="Similar tools" />
        </section>
      )}

      {neighbours && (
        <nav aria-label={`More in ${tool.categoryName}`} className="mt-16 grid grid-cols-2 gap-4">
          <Neighbour tool={neighbours.prev} dir="prev" category={tool.categoryName} />
          <Neighbour tool={neighbours.next} dir="next" category={tool.categoryName} />
        </nav>
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

function Neighbour({ tool, dir, category }: { tool: Tool; dir: "prev" | "next"; category: string }) {
  const next = dir === "next";
  const Icon = next ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className={`group flex flex-col gap-1 rounded-lg border border-hairline px-4 py-3 transition-[background-color] duration-100 ease-out hover:bg-surface ${next ? "items-end text-right" : ""}`}
    >
      <span className="inline-flex items-center gap-1 text-[13px] text-fg-muted">
        {!next && <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5" />}
        {next ? "Next" : "Previous"} in {category}
        {next && <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5" />}
      </span>
      <span className="font-medium">{tool.name}</span>
    </Link>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-fg-muted">{label}</dt>
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

function HealthBreakdown({ tool }: { tool: Tool }) {
  const h = tool.health;
  return (
    <details className="group border-y border-hairline">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 font-medium [&::-webkit-details-marker]:hidden">
        How this Health Score is calculated
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.75}
          className="size-4 shrink-0 text-fg-muted group-open:rotate-180 motion-safe:transition-[rotate] motion-safe:duration-150"
        />
      </summary>
      <div className="pb-5 text-fg-muted">
        {h.status === "scored" ? (
          <table className="w-full text-left tabular-nums">
            <thead className="text-[13px]">
              <tr className="border-b border-hairline">
                <th className="py-2 font-normal">Criterion</th>
                <th className="py-2 font-normal">Input</th>
                <th className="py-2 text-right font-normal">Weight</th>
                <th className="py-2 text-right font-normal">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-hairline">
                <td className="py-2 text-fg">Popularity</td>
                <td className="py-2">{tool.stars != null ? `${formatNumber(tool.stars)} stars` : "—"}</td>
                <td className="py-2 text-right">{WEIGHTS.popularity * 100}%</td>
                <td className="py-2 text-right text-fg">{h.popularity}</td>
              </tr>
              <tr className="border-b border-hairline">
                <td className="py-2 text-fg">Maintenance</td>
                <td className="py-2">{h.daysSinceCommit} {h.daysSinceCommit === 1 ? "day" : "days"} since last commit</td>
                <td className="py-2 text-right">{WEIGHTS.maintenance * 100}%</td>
                <td className="py-2 text-right text-fg">{h.maintenance}</td>
              </tr>
              <tr>
                <td className="pt-2 font-medium text-fg" colSpan={3}>
                  Total
                </td>
                <td className="pt-2 text-right font-medium text-fg">{h.score}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Not enough data to score: {h.reason}</p>
        )}
        <p className="mt-4 text-[13px] text-pretty">
          Popularity is stars on a log scale, from 0 at {formatNumber(POPULARITY_FLOOR)} to 100 at{" "}
          {formatNumber(POPULARITY_CEILING)}. Maintenance
          is 100 when the last commit is within {FRESH_DAYS} days and falls to 0 at {STALE_DAYS} days.
          Calculated on {formatDate(snapshotAt)}.{" "}
          <Link href="/health-score" className="text-fg underline decoration-fg-muted hover:decoration-fg">
            Full method
          </Link>
        </p>
      </div>
    </details>
  );
}
