import { describe, it, expect } from "vitest";
import { validateExtraction, validateBatchExtractions } from "@/lib/validator";

describe("Medical Extraction Validator", () => {
  describe("Basic validation requirements", () => {
    it("passes valid complete lab item", () => {
      const validItem = {
        test_name: "Hemoglobin",
        value: "11.2",
        unit: "g/dL",
        reference_range: "12.0 - 15.5",
        provenance: {
          page: 1,
          line: 14,
          rawSnippet: "Hemoglobin 11.2 g/dL 12.0 - 15.5",
        },
      };

      const result = validateExtraction(validItem);
      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.cleanData?.test_name).toBe("Hemoglobin");
    });

    it("fails when required fields are missing", () => {
      const incompleteItem = {
        test_name: "WBC",
        value: "6.8",
        // missing unit and reference_range
      };

      const result = validateExtraction(incompleteItem);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("unit");
      expect(result.missing).toContain("reference_range");
      expect(result.score).toBeLessThan(80);
    });

    it("flags missing test_name as a critical error", () => {
      const noName = {
        value: "14.2",
        unit: "g/dL",
        reference_range: "12 - 16",
      };
      const result = validateExtraction(noName);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain("test_name");
      expect(result.issues.some((i) => i.field === "test_name" && i.severity === "ERROR")).toBe(true);
    });

    it("accepts valid qualitative values like 'negative' and 'positive'", () => {
      const qualitativeItem = {
        test_name: "Hepatitis B Surface Antigen",
        value: "Negative",
        unit: "qualitative",
        reference_range: "Negative",
        provenance: { page: 1, line: 5, rawSnippet: "HBsAg Negative" },
      };
      const result = validateExtraction(qualitativeItem);
      expect(result.valid).toBe(true);
      expect(result.cleanData?.value).toBe("Negative");
    });
  });

  describe("Malformed OCR strings and non-numeric value handling", () => {
    it("extracts numeric value from noisy OCR characters like ~ or $ or asterisks", () => {
      const noisyItem = {
        test_name: "Hemoglobin",
        value: "~14.2*",
        unit: "g/dL",
        reference_range: "12.0 - 16.0",
        provenance: { page: 1, line: 8, rawSnippet: "~14.2*" },
      };
      const result = validateExtraction(noisyItem);
      expect(result.valid).toBe(true);
      expect(result.cleanData?.value).toBe("~14.2*");
    });

    it("rejects non-numeric garbage text that is not a recognized qualitative result", () => {
      const garbageItem = {
        test_name: "Glucose",
        value: "unreadable_artifact_ocr",
        unit: "mg/dL",
        reference_range: "70 - 99",
      };
      const result = validateExtraction(garbageItem);
      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.code === "INVALID_VALUE")).toBe(true);
    });
  });

  describe("Biological plausibility checks across key clinical analytes", () => {
    it("detects extreme biologically implausible values as warnings", () => {
      const implausibleItem = {
        test_name: "Hemoglobin",
        value: "95.0", // absurd value > 26
        unit: "g/dL",
        reference_range: "12.0 - 15.5",
        provenance: { page: 1, line: 2, rawSnippet: "Hemoglobin 95.0 g/dL" },
      };

      const result = validateExtraction(implausibleItem);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(true);
    });

    it("flags glucose outlier outside 10 - 1500 mg/dL", () => {
      const extremeGlucose = {
        test_name: "Fasting Blood Glucose",
        value: "1850",
        unit: "mg/dL",
        reference_range: "70 - 100",
        provenance: { page: 1, line: 4, rawSnippet: "Glucose 1850 mg/dL" },
      };
      const result = validateExtraction(extremeGlucose);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(true);
    });

    it("flags potassium outlier outside 1.0 - 10.0 mEq/L", () => {
      const extremePotassium = {
        test_name: "Serum Potassium",
        value: "0.4",
        unit: "mEq/L",
        reference_range: "3.5 - 5.0",
        provenance: { page: 1, line: 6, rawSnippet: "Potassium 0.4 mEq/L" },
      };
      const result = validateExtraction(extremePotassium);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(true);
    });

    it("flags sodium outlier outside 80 - 200 mEq/L", () => {
      const extremeSodium = {
        test_name: "Serum Sodium",
        value: "225",
        unit: "mEq/L",
        reference_range: "135 - 145",
        provenance: { page: 1, line: 7, rawSnippet: "Sodium 225 mEq/L" },
      };
      const result = validateExtraction(extremeSodium);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(true);
    });

    it("flags platelets outlier outside 5.0 - 2000.0", () => {
      const extremePlatelets = {
        test_name: "Platelets Count",
        value: "3500",
        unit: "10^3/uL",
        reference_range: "150 - 450",
        provenance: { page: 1, line: 10, rawSnippet: "Platelets 3500" },
      };
      const result = validateExtraction(extremePlatelets);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(true);
    });

    it("passes physiologically plausible analyte values without outlier warnings", () => {
      const plausibleHb = {
        test_name: "Hemoglobin",
        value: "14.2",
        unit: "g/dL",
        reference_range: "13.0 - 17.0",
        provenance: { page: 1, line: 12, rawSnippet: "Hemoglobin 14.2" },
      };
      const result = validateExtraction(plausibleHb);
      expect(result.warnings.some((w) => w.includes("Extreme outlier"))).toBe(false);
    });
  });

  describe("Provenance and metadata integrity", () => {
    it("deducts score and issues warning when provenance is absent", () => {
      const noProvenance = {
        test_name: "Creatinine",
        value: "0.9",
        unit: "mg/dL",
        reference_range: "0.6 - 1.2",
      };
      const result = validateExtraction(noProvenance);
      expect(result.valid).toBe(true);
      expect(result.issues.some((i) => i.code === "PROVENANCE_MISSING")).toBe(true);
      expect(result.score).toBeLessThan(100);
    });
  });

  describe("Batch extractions validation", () => {
    it("validates a batch of extractions correctly", () => {
      const batch = [
        { test_name: "Hemoglobin", value: "12.0", unit: "g/dL", reference_range: "12-15" },
        { test_name: "WBC", value: "5.0", unit: "k/uL", reference_range: "4-10" },
      ];

      const report = validateBatchExtractions(batch);
      expect(report.total).toBe(2);
      expect(report.validCount).toBe(2);
      expect(report.overallScore).toBeGreaterThanOrEqual(80);
    });

    it("handles empty batch gracefully without division-by-zero", () => {
      const report = validateBatchExtractions([]);
      expect(report.total).toBe(0);
      expect(report.validCount).toBe(0);
      expect(report.invalidCount).toBe(0);
      expect(report.overallScore).toBe(100);
    });

    it("correctly partitions valid vs invalid items in mixed batch", () => {
      const mixedBatch = [
        { test_name: "Hemoglobin", value: "13.5", unit: "g/dL", reference_range: "12 - 16" },
        { test_name: "MissingUnit", value: "100", reference_range: "80 - 120" }, // missing unit
        { test_name: "GarbageValue", value: "NonsenseText", unit: "mg/dL", reference_range: "10 - 20" },
      ];
      const report = validateBatchExtractions(mixedBatch);
      expect(report.total).toBe(3);
      expect(report.validCount).toBe(1);
      expect(report.invalidCount).toBe(2);
      expect(report.overallScore).toBeLessThan(80);
    });
  });
});
