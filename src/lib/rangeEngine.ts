import { RangeStatus, ReferenceRange } from "@/types/medlens";

/**
 * Computes reference-range status strictly deterministically from the reported range.
 * Rules (FR4):
 * - If range is null or min/max missing and raw_text empty -> "Range not provided"
 * - If value < min -> "Low"
 * - If value > max -> "High"
 * - Else -> "Normal"
 *
 * CRITICAL SAFETY REQUIREMENT: Must NEVER invent normal ranges or use LLM medical knowledge.
 */
export function computeRangeStatus(
  val: number | string,
  range: ReferenceRange | null | undefined
): RangeStatus {
  // Convert string numerical values if possible
  const numVal = typeof val === "number" ? val : parseFloat(val);

  if (isNaN(numVal) || !range) {
    return "Range not provided";
  }

  const { min, max } = range;

  if (min !== undefined && min !== null && numVal < min) {
    return "Low";
  }

  if (max !== undefined && max !== null && numVal > max) {
    return "High";
  }

  if ((min !== undefined && min !== null) || (max !== undefined && max !== null)) {
    return "Normal";
  }

  return "Range not provided";
}

/**
 * Parses raw range string like "12.0 - 15.5", "15-150", "< 200", "> 50"
 */
export function parseRawReferenceRange(rawText: string | null | undefined): ReferenceRange | null {
  if (!rawText || typeof rawText !== "string") return null;

  const trimmed = rawText.trim();
  if (!trimmed || trimmed.toLowerCase() === "n/a" || trimmed.toLowerCase() === "none") {
    return null;
  }

  // Range pattern: min - max (e.g. 12.0 - 15.5 or 12-15)
  const dashMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/);
  if (dashMatch) {
    const min = parseFloat(dashMatch[1]);
    const max = parseFloat(dashMatch[2]);
    return { min, max, raw_text: trimmed };
  }

  // Less than pattern: < 200
  const ltMatch = trimmed.match(/<\s*(\d+(?:\.\d+)?)/);
  if (ltMatch) {
    const max = parseFloat(ltMatch[1]);
    return { max, raw_text: trimmed };
  }

  // Greater than pattern: > 50
  const gtMatch = trimmed.match(/>\s*(\d+(?:\.\d+)?)/);
  if (gtMatch) {
    const min = parseFloat(gtMatch[1]);
    return { min, raw_text: trimmed };
  }

  return { raw_text: trimmed };
}
