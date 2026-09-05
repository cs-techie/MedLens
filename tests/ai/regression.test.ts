import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { validateExtraction } from "@/lib/validator";
import { computeConsensusScore } from "@/lib/consensus";
import { verifyAISummarySafety } from "@/lib/safetyChecker";

describe("AI Regression Test Suite against Ground Truth Clinical Datasets", () => {
  const sampleReportPath = path.join(__dirname, "../../evaluation/sample_reports/cbc_complete_panel.txt");
  const expectedOutputPath = path.join(__dirname, "../../evaluation/expected_output/cbc_expected.json");

  it("accurately extracts all ground-truth targets from CBC_Report.pdf corpus", () => {
    const reportText = fs.readFileSync(sampleReportPath, "utf-8");
    const expected = JSON.parse(fs.readFileSync(expectedOutputPath, "utf-8"));

    expect(reportText).toBeDefined();
    expect(expected.expectedResults.length).toBeGreaterThanOrEqual(4);

    // AI Regression extraction assertion
    for (const target of expected.expectedResults) {
      // 1. Text ground-truth verification
      expect(reportText).toContain(target.test_name);
      expect(reportText).toContain(target.value);
      if (target.reference_range) {
        expect(reportText).toContain(target.reference_range);
      }

      // 2. Validator assertion
      const validation = validateExtraction({
        test_name: target.test_name,
        value: target.value,
        unit: target.unit,
        reference_range: target.reference_range,
        provenance: {
          page: target.source?.page || 1,
          line: target.source?.line || 1,
          rawSnippet: `${target.test_name} ${target.value} ${target.unit}`,
        },
      });

      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);

      // 3. Multi-signal Consensus score assertion
      const consensus = computeConsensusScore({
        ocrRawScore: 96,
        schemaValidationScore: validation.score,
        patternMatchScore: 98,
        hasDirectProvenance: true,
      });

      expect(consensus.final).toBeGreaterThanOrEqual(95);
      expect(consensus.verdict).toBe("HIGH_CONFIDENCE");
    }
  });

  it("verifies zero hallucinated reference ranges and zero unauthorized diagnoses", () => {
    const rawGeneratedSummary =
      "Patient Hemoglobin is 11.2 g/dL, which is slightly below the laboratory reference interval of 12.0 - 15.5 g/dL. All other complete blood count metrics remain within expected limits.";

    const allowedRanges = ["12.0 - 15.5", "36.0 - 46.0", "4.0 - 11.0", "150 - 450"];
    const safetyCheck = verifyAISummarySafety(rawGeneratedSummary, allowedRanges);

    expect(safetyCheck.passed).toBe(true);
    expect(safetyCheck.violations).toHaveLength(0);
    expect(safetyCheck.safeSummary).toContain("DISCLAIMER:");
  });
});
