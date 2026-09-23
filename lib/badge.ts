import type { Health } from "./health.ts";
import { healthLevel } from "./health.ts";

// sRGB hex of the dark-theme health tokens; README renderers are not guaranteed to support oklch.
const FILL = { high: "#22c373", mid: "#eab532", low: "#e94646", none: "#868686" } as const;
// The label carries the site name: every embedded badge is also an ad for the directory.
const LABEL = "AI Directory";

// Verdana 11px advance widths, rounded to whole pixels. Per-character widths keep the
// pill fitted; a flat 7px-per-char estimate visibly misfits this label.
const NARROW: Record<string, number> = {
  " ": 4, ".": 4, ",": 4, ":": 4, ";": 4, "!": 4, "|": 4, "'": 3,
  i: 4, l: 4, j: 5, I: 5, t: 5, f: 5, r: 6,
  "-": 6, m: 10, w: 9, M: 11, W: 12,
  A: 8, B: 7, C: 8, D: 8, E: 7, F: 7, G: 9, H: 9, J: 6, K: 8, L: 6,
  N: 9, O: 10, P: 7, Q: 10, R: 8, S: 7, T: 7, U: 9, V: 8, X: 8, Y: 8, Z: 7,
};

function textWidth(text: string) {
  let w = 0;
  for (const ch of text) w += NARROW[ch] ?? 7;
  return w;
}

/** 6px of padding on each side of a segment. */
const PAD = 12;

function badgeValue(health: Health) {
  return health.status === "scored" ? String(health.score) : "n/a";
}

export function badgeWidth(health: Health) {
  return PAD + textWidth(LABEL) + PAD + textWidth(badgeValue(health));
}

export function badgeSvg(health: Health) {
  const value = badgeValue(health);
  const color = health.status === "scored" ? FILL[healthLevel(health.score)] : FILL.none;
  const w = badgeWidth(health);
  const lw = PAD + textWidth(LABEL);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${LABEL} health score: ${value}">
<title>${LABEL} health score: ${value}</title>
<clipPath id="r"><rect width="${w}" height="20" rx="3"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#141414"/><rect x="${lw}" width="${w - lw}" height="20" fill="${color}"/></g>
<g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
<text x="${lw / 2}" y="14" fill="#f8f8f8">${LABEL}</text>
<text x="${lw + (w - lw) / 2}" y="14" fill="#070707">${value}</text>
</g>
</svg>`;
}
