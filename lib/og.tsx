import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteName } from "@/lib/format";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Read once at module scope; images are generated at build time.
const fonts = Promise.all(
  [400, 600].map(async (weight) => ({
    name: "Inter Tight",
    data: await readFile(join(process.cwd(), `assets/fonts/InterTight-${weight}.ttf`)),
    weight: weight as 400 | 600,
    style: "normal" as const,
  })),
);

// sRGB equivalents of the dark tokens; Satori does not parse oklch().
const C = { bg: "#070707", fg: "#f8f8f8", muted: "#868686", hairline: "#262626" };
export const ogHealth = { high: "#22c373", mid: "#eab532", low: "#e94646" } as const;

export type OgMeta = { label: string; dot?: string };

/** One layout for every page: title, subtitle, a row of facts. Nothing decorative. */
export async function ogImage({ eyebrow, title, subtitle, meta = [] }: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: OgMeta[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: C.bg,
          color: C.fg,
          fontFamily: "Inter Tight",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: C.muted }}>
          <span style={{ color: C.fg, fontWeight: 600, letterSpacing: "-0.01em" }}>{siteName}</span>
          {eyebrow && <span>{eyebrow}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 28 ? 72 : 104,
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 34, lineHeight: 1.3, color: C.muted, maxWidth: 960 }}>{subtitle}</div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            paddingTop: 28,
            borderTop: `1px solid ${C.hairline}`,
            fontSize: 28,
            minHeight: 62,
          }}
        >
          {meta.map((m) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {m.dot && <div style={{ width: 14, height: 14, borderRadius: 7, background: m.dot }} />}
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...ogSize, fonts: await fonts },
  );
}
