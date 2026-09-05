import { describe, it, expect } from "vitest";
import { validateExtraction, validateBatchExtractions } from "@/lib/validator";

describe("Medical Extraction Validator", () => {
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
});
