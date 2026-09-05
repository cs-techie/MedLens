import { describe, it, expect } from "vitest";
import { verifyAISummarySafety } from "@/lib/safetyChecker";

describe("AI Safety Verification Agent (safetyChecker)", () => {
  it("passes safe, descriptive, disclaimer-bound summary", () => {
    const safeInput =
      "Hemoglobin is 10.4 g/dL, which is below the reported reference interval of 12.0 - 15.5 g/dL. All other values remain within standard parameters.\n\nDISCLAIMER: MedLens provides clinical analysis and patient-friendly lab context for educational use only. It is not a diagnostic tool and does not provide prescriptive medical advice. Please review these findings with your licensed healthcare provider.";

    const report = verifyAISummarySafety(safeInput, ["12.0 - 15.5"]);
    expect(report.passed).toBe(true);
    expect(report.score).toBe(100);
    expect(report.violations).toHaveLength(0);
    expect(report.disclaimerAppended).toBe(false);
  });

  it("intercepts unauthorized diagnostic claims ('you have leukemia') and rephrases them", () => {
    const diagnosticInput = "Based on your blood work, you have leukemia and should seek immediate help.";
    const report = verifyAISummarySafety(diagnosticInput);

    expect(report.passed).toBe(false);
    expect(report.score).toBeLessThan(100);
    expect(report.violations.some((v) => v.category === "UNAUTHORIZED_DIAGNOSIS")).toBe(true);
    expect(report.safeSummary).not.toContain("you have leukemia");
    expect(report.safeSummary).toContain("lab values suggest patterns often correlated with");
  });

  it("intercepts unauthorized treatment directives ('take 500mg metformin') and rephrases them", () => {
    const treatmentInput = "You should take 500mg metformin daily for your glucose levels.";
    const report = verifyAISummarySafety(treatmentInput);

    expect(report.passed).toBe(false);
    expect(report.violations.some((v) => v.category === "TREATMENT_PRESCRIPTION")).toBe(true);
    expect(report.safeSummary).not.toContain("take 500mg metformin");
    expect(report.safeSummary).toContain("consult your physician regarding therapeutic options");
  });

  it("detects invented/hallucinated reference ranges not grounded in allowed report ranges", () => {
    const hallucinatedInput = "Your WBC count was measured against a range of 1.0 - 2.5 K/uL.";
    const allowedRanges = ["4.5 - 11.0"]; // 1.0 - 2.5 is not in allowed ranges

    const report = verifyAISummarySafety(hallucinatedInput, allowedRanges);
    expect(report.violations.some((v) => v.category === "INVENTED_RANGE")).toBe(true);
  });

  it("appends mandatory clinical disclaimer automatically if missing", () => {
    const textWithoutDisclaimer = "Hemoglobin is 11.0 g/dL.";
    const report = verifyAISummarySafety(textWithoutDisclaimer);

    expect(report.disclaimerAppended).toBe(true);
    expect(report.safeSummary).toContain("DISCLAIMER: MedLens provides clinical analysis");
  });
});
