import type { Health } from "@/lib/health";
import { healthLevel } from "@/lib/health";

// sRGB hex of the dark-theme health tokens; README renderers are not guaranteed to support oklch.
const FILL = { high: "#22c373", mid: "#eab532", low: "#e94646", none: "#868686" } as const;
const LABEL = "health";
const LABEL_WIDTH = 50;

export function badgeValue(health: Health) {
  return health.status === "scored" ? String(health.score) : "n/a";
}

// Fixed-width estimate at 11px Verdana, the de facto badge font.
export function badgeWidth(health: Health) {
  return LABEL_WIDTH + 12 + badgeValue(health).length * 7;
}

export function badgeSvg(health: Health) {
  const value = badgeValue(health);
  const color = health.status === "scored" ? FILL[healthLevel(health.score)] : FILL.none;
  const w = badgeWidth(health);
  const vw = w - LABEL_WIDTH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${LABEL}: ${value}">
<title>${LABEL}: ${value}</title>
<clipPath id="r"><rect width="${w}" height="20" rx="3"/></clipPath>
<g clip-path="url(#r)"><rect width="${LABEL_WIDTH}" height="20" fill="#141414"/><rect x="${LABEL_WIDTH}" width="${vw}" height="20" fill="${color}"/></g>
<g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
<text x="${LABEL_WIDTH / 2}" y="14" fill="#f8f8f8">${LABEL}</text>
<text x="${LABEL_WIDTH + vw / 2}" y="14" fill="#070707">${value}</text>
</g>
</svg>`;
}
