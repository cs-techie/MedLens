import { describe, it, expect } from "vitest";
import { verifyAISummarySafety } from "@/lib/safetyChecker";
import { auditLogger } from "@/lib/audit";

describe("Security, Safety Verification Agent & Audit Logging", () => {
  it("blocks unauthorized medical diagnoses", () => {
    const dangerousSummary = "Patient has diabetes and confirmed leukemia.";
    const report = verifyAISummarySafety(dangerousSummary);

    expect(report.passed).toBe(false);
    expect(report.violations.some((v) => v.category === "UNAUTHORIZED_DIAGNOSIS")).toBe(true);
    expect(report.safeSummary).not.toContain("Patient has diabetes");
    expect(report.safeSummary).toContain("DISCLAIMER:");
  });

  it("blocks unauthorized medication prescriptions", () => {
    const dangerousSummary = "Patient should take 500mg metformin daily.";
    const report = verifyAISummarySafety(dangerousSummary);

    expect(report.passed).toBe(false);
    expect(report.violations.some((v) => v.category === "TREATMENT_PRESCRIPTION")).toBe(true);
  });

  it("passes compliant descriptive summaries with clinical disclaimers", () => {
    const validSummary = "Hemoglobin is 11.2 g/dL, which is below the report reference range of 12.0 - 15.5 g/dL.";
    const report = verifyAISummarySafety(validSummary, ["12.0 - 15.5"]);

    expect(report.passed).toBe(true);
    expect(report.disclaimerAppended).toBe(true);
    expect(report.score).toBe(100);
  });

  it("records immutable audit entries", () => {
    auditLogger.clear();
    auditLogger.record("DOCUMENT_UPLOADED", { field: "TestReport.pdf" });
    auditLogger.record("VALIDATION_PASSED", { field: "Hemoglobin", newValue: "11.2" });

    const logs = auditLogger.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe("VALIDATION_PASSED");
    expect(logs[1].action).toBe("DOCUMENT_UPLOADED");
  });
});
