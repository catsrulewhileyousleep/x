import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[60ch]">
      <h1 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">Page not found</h1>
      <p className="mt-4 text-[15px] text-fg-muted">
        The link may have changed, or the tool has not been published yet.{" "}
        <Link href="/" className="text-fg underline decoration-fg-muted hover:decoration-fg">
          Back to all tools
        </Link>
      </p>
    </div>
  );
}
