import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HealthValue } from "@/components/health";
import { JsonLd } from "@/components/json-ld";
import { ToolAvatar } from "@/components/tool-avatar";
import { CopyBadge } from "@/components/copy-badge";
import { ToolTable } from "@/components/tool-table";
import { replacesFor, similarTools, snapshotAt, toRow, tools, getTool, type Tool } from "@/lib/data";
import { FRESH_DAYS, STALE_DAYS, WEIGHTS } from "@/lib/health";
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

export default async function ToolPage({ params }: PageProps<"/tool/[slug]">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const replaces = replacesFor(tool);
  const similar = similarTools(tool);

  return (
    <article>
      <Breadcrumbs
        items={[
          { name: tool.categoryName, href: `/category/${tool.category}` },
          { name: tool.name, href: `/tool/${tool.slug}` },
        ]}
      />

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="mt-1.5">
            <ToolAvatar src={tool.avatarUrl} size={40} />
          </span>
          <div>
            <h1 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">{tool.name}</h1>
            <p className="mt-2 max-w-[55ch] text-[15px] text-pretty text-fg-muted">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {tool.website && <ExternalButton href={tool.website} primary>Visit website</ExternalButton>}
          <ExternalButton href={tool.githubUrl} primary={!tool.website}>GitHub</ExternalButton>
          <CopyBadge markdown={`[![Health Score](${siteUrl}/badge/${tool.slug}.svg)](${siteUrl}/tool/${tool.slug})`} />
        </div>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-hairline py-4 sm:grid-cols-4">
        <Meta label="Health Score">
          <HealthValue health={tool.health} />
        </Meta>
        <Meta label="Stars">
          <span className="tabular-nums">{formatStars(tool.stars)}</span>
        </Meta>
        <Meta label="License">
          {tool.license ?? "Unknown"}
          {tool.licenseNote && <span className="mt-0.5 block text-[13px] text-fg-muted">{tool.licenseNote}</span>}
        </Meta>
        <Meta label="Last commit">
          <span className="tabular-nums">{formatDate(tool.lastCommitAt)}</span>
        </Meta>
      </dl>

      <div className="mt-10 max-w-[65ch] space-y-4 text-[15px] leading-relaxed text-pretty">
        {tool.description.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <HealthBreakdown tool={tool} />

      {replaces.length > 0 && (
        <section className="mt-14 max-w-[65ch]">
          <h2 className="text-[15px] font-medium">Alternative to</h2>
          <ul className="mt-3 space-y-3">
            {replaces.map((r) => (
              <li key={r.slug}>
                <Link href={`/alternative-to/${r.slug}`} className="font-medium underline decoration-fg-muted hover:decoration-fg">
                  {r.name}
                </Link>
                <p className="mt-0.5 text-fg-muted">{r.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-3 text-[15px] font-medium">Similar tools</h2>
          <ToolTable rows={similar.map((t) => toRow(t))} sortable={false} label="Similar tools" />
        </section>
      )}

      <footer className="mt-14 text-[13px] text-fg-muted">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
          <dt>Repo</dt>
          <dd>
            <a href={tool.githubUrl} rel="nofollow noopener" className="break-all text-fg hover:underline">
              {tool.githubUrl.replace("https://", "")}
            </a>
          </dd>
          <dt>Language</dt>
          <dd className="text-fg">{tool.language ?? "—"}</dd>
          <dt>Created</dt>
          <dd className="text-fg tabular-nums">{formatDate(tool.createdAt)}</dd>
          <dt>Data updated</dt>
          <dd className="text-fg tabular-nums">{formatDate(snapshotAt)}</dd>
        </dl>
      </footer>

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
    <details className="group mt-14 max-w-[65ch] border-y border-hairline">
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
          Popularity is stars on a log scale, relative to the most-starred repo in the dataset. Maintenance
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
