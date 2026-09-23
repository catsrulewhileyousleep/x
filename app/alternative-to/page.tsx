import type { Metadata } from "next";
import { AlternativeList } from "@/components/alternative-list";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/lib/ui";
import { alternatives } from "@/lib/data";

export const metadata: Metadata = {
  title: "Open-source alternatives",
  description: "Open-source replacements for closed AI products such as GitHub Copilot, Cursor, ChatGPT and ElevenLabs.",
  alternates: { canonical: "/alternative-to" },
};

export default function AlternativesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Alternatives", href: "/alternative-to" }]}
        title="Open-source alternatives"
        lede="Closed AI products, and the open-source tools that can replace them."
      />
      <div className={ui.headerGap}>
        <AlternativeList
          items={[...alternatives].sort((a, b) => a.name.localeCompare(b.name))}
          label="Alternatives"
          showCategory
        />
      </div>
    </>
  );
}
