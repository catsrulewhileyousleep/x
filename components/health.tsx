import type { Health } from "@/lib/health";
import { healthLevel } from "@/lib/health";

const dot = { high: "bg-health-high", mid: "bg-health-mid", low: "bg-health-low" } as const;
const word = { high: "high", mid: "medium", low: "low" } as const;

/** Dot + number. The number carries the meaning; the dot only speeds up scanning. */
export function HealthValue({ health }: { health: Health }) {
  if (health.status !== "scored") {
    return (
      <span className="text-fg-muted" title={health.reason}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Not enough data</span>
      </span>
    );
  }
  const level = healthLevel(health.score);
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dot[level]}`} />
      {/* Fixed three-digit width keeps dots in one vertical line down a column. */}
      <span className="min-w-[3ch] text-right">{health.score}</span>
      <span className="sr-only"> out of 100, {word[level]}</span>
    </span>
  );
}
