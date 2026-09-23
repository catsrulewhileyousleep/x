import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { categories, snapshotAt, tools } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const alt = "AI Directory: open-source AI tools, carefully picked";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({
    title: "Open-source AI tools, carefully picked.",
    subtitle: "Each project reviewed by hand, with a transparent Health Score.",
    meta: [
      { label: `${tools.length} tools` },
      { label: `${categories.length} categories` },
      { label: `Data from ${formatDate(snapshotAt)}` },
    ],
  });
}
