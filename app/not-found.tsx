import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/lib/ui";

export default function NotFound() {
  return (
    <PageHeader
      title="Page not found"
      lede={
        <>
          The link may have changed, or the tool has not been published yet.{" "}
          <Link href="/" className={ui.link}>
            Back to all tools
          </Link>
        </>
      }
    />
  );
}
