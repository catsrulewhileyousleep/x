import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { snapshotAt } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import {
  FORMULA_VERSION,
  FRESH_DAYS,
  MIN_REPO_AGE_DAYS,
  POPULARITY_CEILING,
  POPULARITY_FLOOR,
  STALE_DAYS,
  WEIGHTS,
} from "@/lib/health";

export const metadata: Metadata = {
  title: "How Health Score works",
  description: "The formula, weights, data sources and limits of Health Score.",
  alternates: { canonical: "/health-score" },
};

export default function HealthScorePage() {
  return (
    <article className="max-w-[65ch]">
      <Breadcrumbs items={[{ name: "Health Score", href: "/health-score" }]} />
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">
        How Health Score works
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-fg-muted">
        Health Score is a quick signal of how active a repo is, not a verdict on its quality. Version{" "}
        {FORMULA_VERSION} uses only two pieces of GitHub data that can be collected reliably.
      </p>

      <Section title="Formula">
        <table className="w-full text-left tabular-nums">
          <thead className="text-[13px] text-fg-muted">
            <tr className="border-b border-hairline">
              <th className="py-2 font-normal">Criterion</th>
              <th className="py-2 text-right font-normal">Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-hairline">
              <td className="py-2">Popularity</td>
              <td className="py-2 text-right">{WEIGHTS.popularity * 100}%</td>
            </tr>
            <tr>
              <td className="py-2">Maintenance</td>
              <td className="py-2 text-right">{WEIGHTS.maintenance * 100}%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-fg-muted">Score = 0.4 × Popularity + 0.6 × Maintenance, rounded to the nearest whole number.</p>
      </Section>

      <Section title="Popularity">
        <p>
          Stars on a log scale between two fixed anchors: {formatNumber(POPULARITY_FLOOR)} stars or fewer
          scores 0, {formatNumber(POPULARITY_CEILING)} or more scores 100. The log scale makes the gap
          between 2,000 and 20,000 stars count as much as the gap between 20,000 and 200,000.
        </p>
      </Section>

      <Section title="Maintenance">
        <p>
          Based on the latest commit on the default branch: 100 if it is within {FRESH_DAYS} days, falling
          linearly to 0 at {STALE_DAYS} days and staying at 0 after that. Days are counted up to when the data
          was fetched, not when you read the page.
        </p>
      </Section>

      <Section title="When a repo is not scored">
        <p>Pages show “Not enough data” instead of guessing a score when a repo:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-fg-muted">
          <li>is archived or no longer public,</li>
          <li>is less than {MIN_REPO_AGE_DAYS} days old,</li>
          <li>is missing its star count, creation date or commit date.</li>
        </ul>
      </Section>

      <Section title="What the score does not tell you">
        <p>
          Stars measure attention, not quality. A recent commit does not prove a project is well maintained.
          Criteria such as contributors, issues, pull requests or documentation will only be added once their
          source, time window and handling of missing data are clearly defined.
        </p>
      </Section>

      <Section title="Score bands">
        <ul className="space-y-1.5">
          <Level className="bg-health-high" label="70 and above" />
          <Level className="bg-health-mid" label="40 to 69" />
          <Level className="bg-health-low" label="Below 40" />
        </ul>
        <p className="mt-3 text-fg-muted">Color only helps you scan; the number is always shown next to it.</p>
      </Section>

      <Section title="Changes">
        <p>
          <span className="font-medium">Version 2.</span> Popularity used to be measured from zero stars
          against the most-starred repo in the dataset. Every listed repo landed between 66 and 100, so the
          score barely told tools apart. Fixed anchors spread the range and keep a tool’s score from changing
          just because another tool was added.
        </p>
      </Section>

      <Section title="Source and updates">
        <p>
          Data comes from the GitHub REST API, last fetched {formatDate(snapshotAt)}. This is formula version{" "}
          {FORMULA_VERSION}; any change to the formula bumps the version.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 text-[15px] leading-relaxed text-pretty">
      <h2 className="mb-3 font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Level({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${className}`} />
      {label}
    </li>
  );
}
