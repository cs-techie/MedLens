/**
 * Security & Input Sanitization Utilities for MedLens AI
 * Protects against XSS, script injection, malformed payloads, and header pollution.
 */

/**
 * Escapes HTML characters to prevent XSS string injection.
 */
export function sanitizeString(str: string): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Strips HTML tags completely for plain text fields.
 */
export function stripHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Validates and limits length of generic input strings.
 */
export function validateInputLength(str: string, maxLen: number = 10000): boolean {
  if (typeof str !== "string") return false;
  return str.length > 0 && str.length <= maxLen;
}

/**
 * Validates numeric ranges to prevent NaN or unexpected type injections.
 */
export function sanitizeNumber(val: any, fallback: number = 0): number {
  const parsed = Number(val);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Sanitizes patient profile inputs before storing or processing.
 */
export function sanitizePatientInput<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string") {
      result[key as keyof T] = sanitizeString(val) as any;
    } else if (val && typeof val === "object" && "value" in val && typeof val.value === "string") {
      result[key as keyof T] = {
        ...val,
        value: sanitizeString(val.value),
      } as any;
    }
  }
  return result;
}
