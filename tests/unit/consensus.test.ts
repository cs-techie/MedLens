import { describe, it, expect } from "vitest";
import { computeConsensusScore, formatConsensusRows } from "@/lib/consensus";

describe("Confidence Consensus Engine", () => {
  it("computes weighted formula correctly (OCR 40%, Schema 30%, Pattern 30%)", () => {
    // OCR: 96 * 0.4 = 38.4
    // Schema: 100 * 0.3 = 30
    // Pattern: 98 * 0.3 = 29.4
    // Total = 38.4 + 30 + 29.4 = 97.8 -> rounded 98
    const consensus = computeConsensusScore({
      ocrRawScore: 96,
      schemaValidationScore: 100,
      patternMatchScore: 98,
      hasDirectProvenance: true,
    });

    expect(consensus.ocr).toBe(96);
    expect(consensus.schema).toBe(100);
    expect(consensus.pattern).toBe(98);
    expect(consensus.final).toBe(98);
    expect(consensus.verdict).toBe("HIGH_CONFIDENCE");
  });

  it("downgrades pattern score and alerts when provenance is missing", () => {
    const consensus = computeConsensusScore({
      ocrRawScore: 90,
      schemaValidationScore: 100,
      patternMatchScore: 90,
      hasDirectProvenance: false,
    });

    expect(consensus.notes.some((n) => n.includes("provenance"))).toBe(true);
    expect(consensus.pattern).toBeLessThanOrEqual(65);
  });

  it("formats consensus breakdown table rows for UI", () => {
    const consensus = computeConsensusScore({
      ocrRawScore: 96,
      schemaValidationScore: 100,
      patternMatchScore: 98,
    });

    const rows = formatConsensusRows(consensus);
    expect(rows).toHaveLength(4);
    expect(rows[0].signal).toContain("OCR");
    expect(rows[3].isTotal).toBe(true);
    expect(rows[3].score).toBe(98);
  });
});
