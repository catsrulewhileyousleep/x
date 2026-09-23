import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HubList } from "@/components/hub-list";
import { alternatives } from "@/lib/data";

export const metadata: Metadata = {
  title: "Open-source alternatives to popular AI products",
  description: "Open-source replacements for closed AI products such as GitHub Copilot, Cursor, ChatGPT and ElevenLabs.",
  alternates: { canonical: "/alternative-to" },
};

export default function AlternativesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Alternatives", href: "/alternative-to" }]} />
      <h1 className="mt-6 max-w-[22ch] text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
        Open-source alternatives to popular AI products
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted">
        Each page lists tools an editor has checked against the original, with one line on why each can
        replace it. A page is published only once there are at least three.
      </p>
      <HubList
        label="Alternatives"
        items={alternatives.map((a) => ({
          href: `/alternative-to/${a.slug}`,
          title: `${a.name} alternatives`,
          description: a.intro,
          count: a.tools.length,
          examples: a.tools.slice(0, 3).map((t) => t.name),
        }))}
      />
    </>
  );
}
