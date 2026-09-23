// Health Score v1. Pure and dependency-free so it can be tested with `node --test`.

export const FORMULA_VERSION = "1";
export const WEIGHTS = { popularity: 0.4, maintenance: 0.6 } as const;
export const FRESH_DAYS = 30;
export const STALE_DAYS = 365;
export const MIN_REPO_AGE_DAYS = 90;

const DAY = 86_400_000;

export type HealthInput = {
  stars: number | null;
  lastCommitAt: string | null;
  createdAt: string | null;
  archived: boolean;
  isPrivate: boolean;
};

export type Health =
  | {
      status: "scored";
      score: number;
      popularity: number;
      maintenance: number;
      daysSinceCommit: number;
    }
  | { status: "insufficient"; reason: string };

export function popularityScore(stars: number, maxStars: number): number {
  if (maxStars <= 0) return 0;
  return (100 * Math.log10(1 + stars)) / Math.log10(1 + maxStars);
}

export function maintenanceScore(daysSinceCommit: number): number {
  if (daysSinceCommit <= FRESH_DAYS) return 100;
  if (daysSinceCommit >= STALE_DAYS) return 0;
  return (100 * (STALE_DAYS - daysSinceCommit)) / (STALE_DAYS - FRESH_DAYS);
}

/** Days are measured against the snapshot time, not "now", so a page never drifts from its data. */
export function computeHealth(input: HealthInput, maxStars: number, snapshotAt: string): Health {
  if (input.isPrivate) return { status: "insufficient", reason: "Repo không còn công khai." };
  if (input.archived) return { status: "insufficient", reason: "Repo đã được lưu trữ (archived)." };
  if (input.stars == null || !input.lastCommitAt || !input.createdAt) {
    return { status: "insufficient", reason: "Thiếu dữ liệu GitHub." };
  }

  const now = Date.parse(snapshotAt);
  if ((now - Date.parse(input.createdAt)) / DAY < MIN_REPO_AGE_DAYS) {
    return { status: "insufficient", reason: `Repo mới hơn ${MIN_REPO_AGE_DAYS} ngày.` };
  }

  const daysSinceCommit = Math.max(0, Math.floor((now - Date.parse(input.lastCommitAt)) / DAY));
  const popularity = popularityScore(input.stars, maxStars);
  const maintenance = maintenanceScore(daysSinceCommit);
  return {
    status: "scored",
    score: Math.round(WEIGHTS.popularity * popularity + WEIGHTS.maintenance * maintenance),
    popularity: Math.round(popularity),
    maintenance: Math.round(maintenance),
    daysSinceCommit,
  };
}

export type HealthLevel = "high" | "mid" | "low";

export function healthLevel(score: number): HealthLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}
