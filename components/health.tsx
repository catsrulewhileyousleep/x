import type { Health } from "@/lib/health";
import { healthLevel } from "@/lib/health";

const dot = { high: "bg-health-high", mid: "bg-health-mid", low: "bg-health-low" } as const;
const word = { high: "cao", mid: "trung bình", low: "thấp" } as const;

/** Dot + number. The number carries the meaning; the dot only speeds up scanning. */
export function HealthValue({ health }: { health: Health }) {
  if (health.status !== "scored") {
    return (
      <span className="text-fg-muted" title={health.reason}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Chưa đủ dữ liệu</span>
      </span>
    );
  }
  const level = healthLevel(health.score);
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dot[level]}`} />
      {health.score}
      <span className="sr-only">/100, mức {word[level]}</span>
    </span>
  );
}
