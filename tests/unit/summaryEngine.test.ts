import { describe, it, expect } from "vitest";
import {
  validateSummarySafety,
  generateDeterministicTemplateSummary,
  generateSafeAISummary,
  MANDATORY_DISCLAIMER_SENTENCE,
} from "@/lib/summaryEngine";
import { initialMedicalRecord } from "@/lib/store";

describe("Summary Engine & Fallback Generator (summaryEngine.ts)", () => {
  describe("validateSummarySafety", () => {
    it("returns true for safe summary ending with mandatory disclaimer", () => {
      const validText = `Hemoglobin measured low relative to stated range.\n\n${MANDATORY_DISCLAIMER_SENTENCE}`;
      expect(validateSummarySafety(validText)).toBe(true);
    });

    it("returns false if summary fails to end with mandatory disclaimer", () => {
      const missingDisclaimer = "Hemoglobin measured low relative to stated range.";
      expect(validateSummarySafety(missingDisclaimer)).toBe(false);
    });

    it("returns false if diagnostic phrase ('you have anemia') is present", () => {
      const diagnosticText = `Based on results, you have anemia.\n\n${MANDATORY_DISCLAIMER_SENTENCE}`;
      expect(validateSummarySafety(diagnosticText)).toBe(false);
    });

    it("returns false if prescription phrase ('you should take') is present", () => {
      const prescriptiveText = `You should take iron supplements daily.\n\n${MANDATORY_DISCLAIMER_SENTENCE}`;
      expect(validateSummarySafety(prescriptiveText)).toBe(false);
    });
  });

  describe("generateDeterministicTemplateSummary", () => {
    it("generates structured, non-diagnostic template summary grounded in record data", () => {
      const summary = generateDeterministicTemplateSummary(initialMedicalRecord);

      expect(summary.source).toBe("ai_generated");
      expect(summary.text).toContain("Eleanor Vance");
      expect(summary.text).toContain("Laboratory Findings Outside Reported Ranges");
      expect(summary.text).toContain("Hemoglobin");
      expect(summary.text).toContain("Serum Ferritin");
      expect(summary.text).toContain(MANDATORY_DISCLAIMER_SENTENCE);
      expect(summary.disclaimer).toBe(MANDATORY_DISCLAIMER_SENTENCE);
    });
  });

  describe("generateSafeAISummary", () => {
    it("returns valid safe AI summary object even when API key is unconfigured", async () => {
      const summary = await generateSafeAISummary(initialMedicalRecord);

      expect(summary.source).toBe("ai_generated");
      expect(summary.text).toContain(MANDATORY_DISCLAIMER_SENTENCE);
      expect(summary.based_on_documents).toContain("doc_demo_cbc");
    });
  });
});
