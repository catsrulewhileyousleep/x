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

/** Shortens text to `max` characters at a word boundary, for meta descriptions. */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export function formatDate(iso: string | null) {
  return iso ? date.format(new Date(iso)) : "—";
}

/** 3 → "3 days ago", 45 → "2 months ago". Ages are counted to the data snapshot, not read time. */
export function formatDaysAgo(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const siteName = "AI Directory";
export const repoSlug = "catsrulewhileyousleep/x";
export const repoUrl = `https://github.com/${repoSlug}`;
