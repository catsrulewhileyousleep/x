const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** 69097 → "69.1k" */
export function formatStars(n: number | null) {
  return n == null ? "—" : compact.format(n).toLowerCase();
}

export function formatNumber(n: number) {
  return full.format(n);
}

export function formatDate(iso: string | null) {
  return iso ? date.format(new Date(iso)) : "—";
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const siteName = "AI Directory";
export const repoUrl = "https://github.com/catsrulewhileyousleep/x";
export const submitUrl = `${repoUrl}/issues/new?template=submit-tool.yml`;
