import { LabItem, LabItemSchema } from "./schemas";

export interface ValidationIssue {
  field: string;
  code: "MISSING_REQUIRED" | "INVALID_VALUE" | "SUSPICIOUS_RANGE" | "UNITS_MISMATCH" | "PROVENANCE_MISSING";
  message: string;
  severity: "ERROR" | "WARNING";
}

export interface ValidationResult {
  valid: boolean;
  score: number; // 0 - 100
  missing: string[];
  issues: ValidationIssue[];
  warnings: string[];
  cleanData?: LabItem;
}

const REQUIRED_LAB_FIELDS: (keyof LabItem)[] = [
  "test_name",
  "value",
  "unit",
  "reference_range",
];

// Plausible biological ranges for common lab tests to detect hallucinated or corrupted OCR
const PLAUSIBLE_BIOLOGICAL_LIMITS: Record<string, { min: number; max: number; units: string[] }> = {
  hemoglobin: { min: 2.0, max: 26.0, units: ["g/dL", "g/l", "gm/dl"] },
  wbc: { min: 0.1, max: 200.0, units: ["10^3/uL", "x10^3/uL", "/cumm", "K/uL", "10^9/L"] },
  white_blood_cells: { min: 0.1, max: 200.0, units: ["10^3/uL", "x10^3/uL", "/cumm", "K/uL"] },
  platelets: { min: 5.0, max: 2000.0, units: ["10^3/uL", "x10^3/uL", "K/uL", "lakhs/cumm"] },
  glucose: { min: 10.0, max: 1500.0, units: ["mg/dL", "mg/dl", "mmol/L"] },
  hba1c: { min: 3.0, max: 20.0, units: ["%", "percent"] },
  creatinine: { min: 0.1, max: 25.0, units: ["mg/dL", "mg/dl", "umol/L"] },
  cholesterol: { min: 30.0, max: 1000.0, units: ["mg/dL", "mg/dl", "mmol/L"] },
  potassium: { min: 1.0, max: 10.0, units: ["mEq/L", "mmol/L"] },
  sodium: { min: 80.0, max: 200.0, units: ["mEq/L", "mmol/L"] },
};

/**
 * Validates a single extracted lab item before it enters the presentation layer
 */
export function validateExtraction(data: Record<string, any>): ValidationResult {
  const issues: ValidationIssue[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required core fields
  for (const field of REQUIRED_LAB_FIELDS) {
    const val = data[field];
    if (val === undefined || val === null || String(val).trim() === "") {
      missing.push(field);
      issues.push({
        field,
        code: "MISSING_REQUIRED",
        message: `Required extraction field '${field}' is absent or empty.`,
        severity: "ERROR",
      });
    }
  }

  // Value numeric parsing & biological sanity check
  const numVal = parseFloat(String(data.value).replace(/[^0-9.-]/g, ""));
  if (isNaN(numVal) && String(data.value).toLowerCase() !== "negative" && String(data.value).toLowerCase() !== "positive") {
    issues.push({
      field: "value",
      code: "INVALID_VALUE",
      message: `Extracted value '${data.value}' is non-numeric and not a valid qualitative result.`,
      severity: "ERROR",
    });
  }

  // Provenance verification
  if (!data.provenance || !data.provenance.rawSnippet) {
    issues.push({
      field: "provenance",
      code: "PROVENANCE_MISSING",
      message: "No source bounding/text snippet provenance attached to this field.",
      severity: "WARNING",
    });
    warnings.push("Missing provenance metadata for field verification.");
  }

  // Biological plausibility inspection
  if (!isNaN(numVal) && data.test_name) {
    const normalizedName = String(data.test_name).toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [key, bounds] of Object.entries(PLAUSIBLE_BIOLOGICAL_LIMITS)) {
      if (normalizedName.includes(key)) {
        if (numVal < bounds.min || numVal > bounds.max) {
          issues.push({
            field: "value",
            code: "INVALID_VALUE",
            message: `Extracted value ${numVal} for ${data.test_name} violates biological plausibility (${bounds.min} - ${bounds.max} ${bounds.units.join("/")}). Possible OCR misread.`,
            severity: "WARNING",
          });
          warnings.push(`Extreme outlier detected for ${data.test_name}: ${numVal}. Flagged for clinician verification.`);
        }
        break;
      }
    }
  }

  // Calculate schema compliance score
  const errorCount = issues.filter((i) => i.severity === "ERROR").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;
  const penalty = errorCount * 25 + warningCount * 10;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  let cleanData: LabItem | undefined;
  if (errorCount === 0) {
    try {
      cleanData = LabItemSchema.parse({
        test_name: String(data.test_name || "").trim(),
        value: String(data.value || "").trim(),
        unit: String(data.unit || "").trim(),
        reference_range: data.reference_range ? String(data.reference_range).trim() : null,
        category: data.category || "General Panel",
        status: data.status || "NORMAL",
        confidence: data.confidence || score,
        confidenceBreakdown: data.confidenceBreakdown,
        provenance: data.provenance,
        reasoning: data.reasoning,
      });
    } catch {
      // Schema parse fallback
    }
  }

  return {
    valid: missing.length === 0 && errorCount === 0,
    score,
    missing,
    issues,
    warnings,
    cleanData,
  };
}

/**
 * Validates an entire batch of extracted lab results
 */
export function validateBatchExtractions(extractions: Record<string, any>[]): {
  total: number;
  validCount: number;
  invalidCount: number;
  overallScore: number;
  results: ValidationResult[];
} {
  const results = extractions.map(validateExtraction);
  const validCount = results.filter((r) => r.valid).length;
  const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);

  return {
    total: extractions.length,
    validCount,
    invalidCount: extractions.length - validCount,
    overallScore: extractions.length > 0 ? Math.round(totalScore / extractions.length) : 100,
    results,
  };
}
