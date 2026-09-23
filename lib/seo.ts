import { clip } from "./format.ts";

/**
 * Meta description that ends on a full sentence instead of a mid-sentence "…", with an optional
 * suffix (e.g. the license) appended only when it still fits. Snippets show about 155 characters.
 */
export function metaDescription(text: string, suffix?: string, max = 155) {
  const sentences = text.trim().split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  // A first sentence that is too long is cut at its first clause (":" or ";") before resorting to "…".
  const clause = sentences[0].split(/[:;]\s/)[0].replace(/[,.\s]+$/, "");
  if (!out) out = clause.length < sentences[0].length && clause.length < max ? `${clause}.` : clip(text, max);
  return suffix && out.length + 1 + suffix.length <= max ? `${out} ${suffix}` : out;
}

/** Short license line for descriptions; empty when the license is unknown. */
export function licenseSuffix(license: string | null) {
  return license ? `Open source, ${license} license.` : undefined;
}
