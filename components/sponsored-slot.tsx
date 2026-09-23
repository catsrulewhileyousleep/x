import Link from "next/link";

/**
 * House ad that marks the sponsored slot at the top of a category list. It links to
 * /sponsor and is never a tool row: no score, no fake data, clearly a placeholder.
 */
export function SponsoredSlotRow({ categoryName }: { categoryName?: string }) {
  const where = categoryName ? `the top of ${categoryName}` : "the top of its category";
  return (
    <>
      <div className="flex min-w-0 gap-3">
        {/* Placeholder where a sponsor's logo would sit. */}
        <span
          aria-hidden="true"
          className="mt-px inline-flex size-5 shrink-0 rounded-[5px] border border-dashed border-hairline"
        />
        <div className="min-w-0">
          <Link href="/sponsor" className="font-medium text-fg outline-none after:absolute after:inset-0">
            Your tool here
          </Link>
          <span className="ml-2 text-[12px] text-fg-muted">
            Sponsored<span className="sr-only"> slot</span>
          </span>
          <p className="mt-0.5 text-[13px] text-pretty text-fg-muted">
            This slot is pinned to {where} and labeled. It is never scored and never skips review.
          </p>
        </div>
      </div>
      <span aria-hidden="true" className="justify-self-end pt-px tabular-nums text-fg-muted">
        —
      </span>
      <span aria-hidden="true" className="hidden justify-self-end pt-px text-fg-muted sm:block">
        —
      </span>
      <span aria-hidden="true" className="hidden truncate pt-px text-fg-muted sm:block">
        —
      </span>
    </>
  );
}
