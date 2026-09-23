import { ui } from "@/lib/ui";

const idFor = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A titled block of a page. Every section uses the same heading, gap and spacing. */
export function Section({
  title,
  children,
  narrow = false,
}: {
  title: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  const id = idFor(title);
  return (
    <section aria-labelledby={id} className={`${ui.sectionGap} ${narrow ? "max-w-[65ch]" : ""}`}>
      <h2 id={id} className="scroll-mt-6 text-[15px] font-medium">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
