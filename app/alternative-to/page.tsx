import type { Metadata } from "next";
import { AlternativeList } from "@/components/alternative-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { alternatives } from "@/lib/data";

export const metadata: Metadata = {
  title: "Open-source alternatives",
  description: "Open-source replacements for closed AI products such as GitHub Copilot, Cursor, ChatGPT and ElevenLabs.",
  alternates: { canonical: "/alternative-to" },
};

export default function AlternativesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Alternatives", href: "/alternative-to" }]} />
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">
        Open-source alternatives
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted">
        Closed AI products, and the open-source tools that can replace them.
      </p>
      <div className="mt-12">
        <AlternativeList
          items={[...alternatives].sort((a, b) => a.name.localeCompare(b.name))}
          label="Alternatives"
          showCategory
        />
      </div>
    </>
  );
}
