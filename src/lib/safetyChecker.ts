/**
 * AI Self-Check Pipeline & Safety Verification Agent
 * Operates as a post-generation verification gate to ensure summaries never contain:
 * 1. Definitive medical diagnoses (e.g., "You have leukemia", "Patient is diabetic")
 * 2. Unprescribed clinical treatment advice or medication adjustments (e.g., "Take 500mg metformin")
 * 3. Hallucinated or synthetic reference ranges not grounded in the source lab report
 */

export interface SafetyViolation {
  category: "UNAUTHORIZED_DIAGNOSIS" | "TREATMENT_PRESCRIPTION" | "INVENTED_RANGE" | "UNVERIFIED_CLAIM";
  matchedSnippet: string;
  reason: string;
  remediation: string;
}

export interface SafetyCheckReport {
  passed: boolean;
  score: number; // 0 - 100
  violations: SafetyViolation[];
  safeSummary: string;
  disclaimerAppended: boolean;
}

// Prohibited diagnostic assertions that violate clinician prerogative
const DIAGNOSTIC_TRIGGERS: RegExp[] = [
  /\b(you have|patient has|patient is diagnosed with|this confirms|you are suffering from)\s+(diabetes|anemia|cancer|leukemia|infection|kidney failure|hepatitis|cirrhosis|thyroid disorder)/i,
  /\b(diagnostic of|positive confirmation of)\b/i,
];

// Prohibited treatment/prescription directives
const TREATMENT_TRIGGERS: RegExp[] = [
  /\b(take|start taking|prescribe|administer|dosage of|stop taking)\s+\d+\s*(mg|mcg|ml|g|tablets?|capsules?)/i,
  /\b(you need to take|you must consume|inject|increase your dosage)/i,
];

const MANDATORY_CLINICAL_DISCLAIMER = 
  "DISCLAIMER: MedLens provides clinical analysis and patient-friendly lab context for educational use only. It is not a diagnostic tool and does not provide prescriptive medical advice. Please review these findings with your licensed healthcare provider.";

/**
 * Executes a 3-stage post-processing verification check across generated AI summaries
 */
export function verifyAISummarySafety(
  summaryText: string,
  allowedReferenceRanges: string[] = []
): SafetyCheckReport {
  const violations: SafetyViolation[] = [];
  let cleaned = summaryText;

  // 1. Diagnostic assertion check
  for (const regex of DIAGNOSTIC_TRIGGERS) {
    const match = cleaned.match(regex);
    if (match) {
      violations.push({
        category: "UNAUTHORIZED_DIAGNOSIS",
        matchedSnippet: match[0],
        reason: "Summary attempts to assign a definitive clinical diagnosis, violating non-diagnostic boundary.",
        remediation: "Rephrase from definitive diagnosis to descriptive lab observation.",
      });
      cleaned = cleaned.replace(regex, "lab values suggest patterns often correlated with");
    }
  }

  // 2. Treatment/Prescription check
  for (const regex of TREATMENT_TRIGGERS) {
    const match = cleaned.match(regex);
    if (match) {
      violations.push({
        category: "TREATMENT_PRESCRIPTION",
        matchedSnippet: match[0],
        reason: "Summary issues medication dosing or direct treatment commands.",
        remediation: "Remove prescriptive dosage directive and recommend physician consultation.",
      });
      cleaned = cleaned.replace(regex, "consult your physician regarding therapeutic options");
    }
  }

  // 3. Hallucinated Reference Range Detection
  // Check if summary references numbers as "normal ranges" that don't appear in allowed ranges
  const rangeMentions = cleaned.match(/\b\d+(\.\d+)?\s*-\s*\d+(\.\d+)?\b/g) || [];
  for (const range of rangeMentions) {
    if (allowedReferenceRanges.length > 0) {
      const isGrounded = allowedReferenceRanges.some((ar) => ar.includes(range.trim()) || range.includes(ar.trim()));
      if (!isGrounded) {
        violations.push({
          category: "INVENTED_RANGE",
          matchedSnippet: range,
          reason: `Reference range '${range}' does not match any reference range from the source laboratory document.`,
          remediation: "Strictly anchor reference ranges to report text or flag as ungrounded.",
        });
      }
    }
  }

  // Ensure mandatory clinical disclaimer is present
  let disclaimerAppended = false;
  if (!cleaned.includes("DISCLAIMER:") && !cleaned.includes("educational use only")) {
    cleaned = `${cleaned}\n\n${MANDATORY_CLINICAL_DISCLAIMER}`;
    disclaimerAppended = true;
  }

  const penalty = violations.length * 35;
  const score = Math.max(0, 100 - penalty);

  return {
    passed: violations.length === 0,
    score,
    violations,
    safeSummary: cleaned,
    disclaimerAppended,
  };
}
