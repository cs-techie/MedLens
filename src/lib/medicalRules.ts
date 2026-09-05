/**
 * Medical DSL (Domain Specific Language) & Extraction Rules
 * Defines authoritative extraction constraints, critical emergency boundaries,
 * and canonical unit mappings across clinical lab assays.
 */

export type ExtractionPolicy = "reference-range-only" | "allow-standard-fallback" | "qualitative-only";

export interface MedicalTestRule {
  canonicalName: string;
  category: "Hematology" | "Metabolic" | "Lipid" | "Electrolytes" | "Renal" | "Hepatic" | "Coagulation" | "Urinalysis";
  policy: ExtractionPolicy;
  primaryUnit: string;
  allowedUnits: string[];
  criticalAlertRange?: {
    low?: number;
    high?: number;
  };
  ageAdjusted?: boolean;
  genderAdjusted?: boolean;
  clinicalSignificance: string;
}

export const MEDICAL_RULES: Record<string, MedicalTestRule> = {
  hemoglobin: {
    canonicalName: "Hemoglobin",
    category: "Hematology",
    policy: "reference-range-only",
    primaryUnit: "g/dL",
    allowedUnits: ["g/dL", "g/L", "gm/dl", "g/dl"],
    criticalAlertRange: { low: 7.0, high: 20.0 },
    genderAdjusted: true,
    clinicalSignificance: "Oxygen-carrying protein in red blood cells. Severe lows indicate critical anemia; highs indicate polycythemia.",
  },
  wbc: {
    canonicalName: "White Blood Cells (WBC)",
    category: "Hematology",
    policy: "reference-range-only",
    primaryUnit: "10^3/uL",
    allowedUnits: ["10^3/uL", "x10^3/uL", "K/uL", "/cumm", "10^9/L", "/mcL"],
    criticalAlertRange: { low: 2.0, high: 30.0 },
    clinicalSignificance: "Primary immune system cells. Lows indicate leukopenia/bone marrow suppression; highs indicate infection or leukemoid reaction.",
  },
  platelets: {
    canonicalName: "Platelet Count",
    category: "Hematology",
    policy: "reference-range-only",
    primaryUnit: "10^3/uL",
    allowedUnits: ["10^3/uL", "x10^3/uL", "K/uL", "lakhs/cumm", "10^9/L", "/mcL"],
    criticalAlertRange: { low: 50.0, high: 1000.0 },
    clinicalSignificance: "Platelets are critical for hemostasis. Counts <50k present significant bleeding risk.",
  },
  glucose: {
    canonicalName: "Fasting Blood Glucose",
    category: "Metabolic",
    policy: "reference-range-only",
    primaryUnit: "mg/dL",
    allowedUnits: ["mg/dL", "mg/dl", "mmol/L"],
    criticalAlertRange: { low: 54.0, high: 400.0 },
    clinicalSignificance: "Major energy source for cells. Extreme lows risk neuroglycopenic coma; highs indicate acute hyperglycemia.",
  },
  creatinine: {
    canonicalName: "Serum Creatinine",
    category: "Renal",
    policy: "reference-range-only",
    primaryUnit: "mg/dL",
    allowedUnits: ["mg/dL", "mg/dl", "umol/L"],
    criticalAlertRange: { high: 4.0 },
    genderAdjusted: true,
    clinicalSignificance: "End-product of muscle catabolism excreted by kidneys. Highs signify acute kidney injury or chronic renal impairment.",
  },
  potassium: {
    canonicalName: "Potassium (K+)",
    category: "Electrolytes",
    policy: "reference-range-only",
    primaryUnit: "mEq/L",
    allowedUnits: ["mEq/L", "mmol/L"],
    criticalAlertRange: { low: 2.8, high: 6.2 },
    clinicalSignificance: "Critical cardiac intracellular cation. Hypokalemia or hyperkalemia can trigger fatal ventricular arrhythmias.",
  },
  sodium: {
    canonicalName: "Sodium (Na+)",
    category: "Electrolytes",
    policy: "reference-range-only",
    primaryUnit: "mEq/L",
    allowedUnits: ["mEq/L", "mmol/L"],
    criticalAlertRange: { low: 120.0, high: 160.0 },
    clinicalSignificance: "Primary extracellular osmole. Rapid shifts cause cerebral edema or osmotic demyelination.",
  },
  alt: {
    canonicalName: "Alanine Aminotransferase (ALT)",
    category: "Hepatic",
    policy: "reference-range-only",
    primaryUnit: "U/L",
    allowedUnits: ["U/L", "IU/L"],
    criticalAlertRange: { high: 500.0 },
    clinicalSignificance: "Liver intracellular enzyme. Elevations mark hepatocellular injury, viral hepatitis, or drug hepatotoxicity.",
  },
  ast: {
    canonicalName: "Aspartate Aminotransferase (AST)",
    category: "Hepatic",
    policy: "reference-range-only",
    primaryUnit: "U/L",
    allowedUnits: ["U/L", "IU/L"],
    criticalAlertRange: { high: 500.0 },
    clinicalSignificance: "Enzyme present in liver and myocardium. Highs mark acute tissue damage or myositis.",
  },
  tsh: {
    canonicalName: "Thyroid Stimulating Hormone (TSH)",
    category: "Metabolic",
    policy: "reference-range-only",
    primaryUnit: "uIU/mL",
    allowedUnits: ["uIU/mL", "mIU/L", "uU/mL"],
    criticalAlertRange: { low: 0.01, high: 20.0 },
    clinicalSignificance: "Anterior pituitary regulator of thyroid hormone production. Outliers indicate hyper- or hypothyroidism.",
  },
};

/**
 * Resolves an extracted test name to its canonical Medical DSL rule
 */
export function resolveMedicalRule(testName: string): MedicalTestRule | null {
  if (!testName) return null;
  const clean = testName.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  for (const [key, rule] of Object.entries(MEDICAL_RULES)) {
    const ruleKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const canonicalKey = rule.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean === ruleKey || clean.includes(ruleKey) || clean === canonicalKey || canonicalKey.includes(clean)) {
      return rule;
    }
  }

  // Alias checks
  if (clean.includes("hb") || clean.includes("haemoglobin")) return MEDICAL_RULES.hemoglobin;
  if (clean.includes("leukocyte") || clean.includes("tlc")) return MEDICAL_RULES.wbc;
  if (clean.includes("plt") || clean.includes("thrombocyte")) return MEDICAL_RULES.platelets;
  if (clean.includes("sugar") || clean.includes("fbs") || clean.includes("rbs")) return MEDICAL_RULES.glucose;
  if (clean.includes("creat")) return MEDICAL_RULES.creatinine;
  if (clean.includes("potas")) return MEDICAL_RULES.potassium;
  if (clean.includes("sod")) return MEDICAL_RULES.sodium;

  return null;
}

/**
 * Evaluates whether an extracted value violates critical emergency boundaries
 */
export function evaluateCriticalAlert(testName: string, numericValue: number): { isCritical: boolean; alertMessage?: string } {
  const rule = resolveMedicalRule(testName);
  if (!rule || !rule.criticalAlertRange) {
    return { isCritical: false };
  }

  const { low, high } = rule.criticalAlertRange;
  if (low !== undefined && numericValue < low) {
    return {
      isCritical: true,
      alertMessage: `CRITICAL ALERT: ${rule.canonicalName} (${numericValue} ${rule.primaryUnit}) is below emergency threshold (${low}). Immediate medical attention required.`,
    };
  }
  if (high !== undefined && numericValue > high) {
    return {
      isCritical: true,
      alertMessage: `CRITICAL ALERT: ${rule.canonicalName} (${numericValue} ${rule.primaryUnit}) exceeds emergency threshold (${high}). Immediate clinical evaluation advised.`,
    };
  }

  return { isCritical: false };
}
