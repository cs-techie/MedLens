import { describe, it, expect } from "vitest";
import { computeRangeStatus, parseRawReferenceRange } from "@/lib/rangeEngine";
import { ReferenceRange } from "@/types/medlens";

describe("Deterministic Range Engine - computeRangeStatus", () => {
  const standardRange: ReferenceRange = { min: 12.0, max: 15.5, raw_text: "12.0 - 15.5" };

  describe("Boundary values and floating point thresholds", () => {
    it("returns 'Normal' when value equals exact min threshold", () => {
      expect(computeRangeStatus(12.0, standardRange)).toBe("Normal");
      expect(computeRangeStatus("12.0", standardRange)).toBe("Normal");
    });

    it("returns 'Normal' when value equals exact max threshold", () => {
      expect(computeRangeStatus(15.5, standardRange)).toBe("Normal");
      expect(computeRangeStatus("15.5", standardRange)).toBe("Normal");
    });

    it("returns 'Low' when value is strictly below min by a fraction", () => {
      expect(computeRangeStatus(11.999, standardRange)).toBe("Low");
      expect(computeRangeStatus("11.99", standardRange)).toBe("Low");
    });

    it("returns 'High' when value is strictly above max by a fraction", () => {
      expect(computeRangeStatus(15.501, standardRange)).toBe("High");
      expect(computeRangeStatus("15.51", standardRange)).toBe("High");
    });

    it("returns 'Normal' for mid-range values", () => {
      expect(computeRangeStatus(13.7, standardRange)).toBe("Normal");
    });
  });

  describe("Single-sided bounds (upper bound only or lower bound only)", () => {
    const maxOnlyRange: ReferenceRange = { max: 200, raw_text: "< 200" };
    const minOnlyRange: ReferenceRange = { min: 50, raw_text: "> 50" };

    it("evaluates upper-bound-only correctly (<= max is Normal, > max is High)", () => {
      expect(computeRangeStatus(150, maxOnlyRange)).toBe("Normal");
      expect(computeRangeStatus(200, maxOnlyRange)).toBe("Normal");
      expect(computeRangeStatus(201, maxOnlyRange)).toBe("High");
    });

    it("evaluates lower-bound-only correctly (>= min is Normal, < min is Low)", () => {
      expect(computeRangeStatus(60, minOnlyRange)).toBe("Normal");
      expect(computeRangeStatus(50, minOnlyRange)).toBe("Normal");
      expect(computeRangeStatus(49.9, minOnlyRange)).toBe("Low");
    });
  });

  describe("Negative numerical ranges", () => {
    const negativeRange: ReferenceRange = { min: -3.0, max: 3.0, raw_text: "-3.0 to +3.0" };

    it("handles negative numbers and zero crossings correctly", () => {
      expect(computeRangeStatus(-2.5, negativeRange)).toBe("Normal");
      expect(computeRangeStatus(0, negativeRange)).toBe("Normal");
      expect(computeRangeStatus(-3.1, negativeRange)).toBe("Low");
      expect(computeRangeStatus(3.2, negativeRange)).toBe("High");
    });
  });

  describe("Malformed values, missing bounds, and zero-hallucination guardrails", () => {
    it("returns 'Range not provided' when range is null or undefined", () => {
      expect(computeRangeStatus(12.5, null)).toBe("Range not provided");
      expect(computeRangeStatus(12.5, undefined)).toBe("Range not provided");
    });

    it("returns 'Range not provided' when range has neither min nor max", () => {
      const qualitativeOnly: ReferenceRange = { raw_text: "Negative" };
      expect(computeRangeStatus(12.5, qualitativeOnly)).toBe("Range not provided");
    });

    it("returns 'Range not provided' when input value is non-numeric string or NaN", () => {
      expect(computeRangeStatus("NotANumber", standardRange)).toBe("Range not provided");
      expect(computeRangeStatus("", standardRange)).toBe("Range not provided");
      expect(computeRangeStatus(NaN, standardRange)).toBe("Range not provided");
    });
  });
});

describe("Deterministic Range Engine - parseRawReferenceRange", () => {
  describe("Standard and multi-dash delimiters", () => {
    it("parses standard hyphen range with decimals", () => {
      const parsed = parseRawReferenceRange("12.0 - 15.5");
      expect(parsed).toEqual({ min: 12.0, max: 15.5, raw_text: "12.0 - 15.5" });
    });

    it("parses integer range without spaces", () => {
      const parsed = parseRawReferenceRange("10-20");
      expect(parsed).toEqual({ min: 10, max: 20, raw_text: "10-20" });
    });

    it("parses en-dash (–) delimiter", () => {
      const parsed = parseRawReferenceRange("13.5 – 17.5");
      expect(parsed?.min).toBe(13.5);
      expect(parsed?.max).toBe(17.5);
    });

    it("parses em-dash (—) delimiter", () => {
      const parsed = parseRawReferenceRange("4.0 — 11.0");
      expect(parsed?.min).toBe(4.0);
      expect(parsed?.max).toBe(11.0);
    });
  });

  describe("Inequality operators", () => {
    it("parses less-than (<) pattern as max threshold", () => {
      const parsed = parseRawReferenceRange("< 200");
      expect(parsed).toEqual({ max: 200, raw_text: "< 200" });
    });

    it("parses less-than with decimal", () => {
      const parsed = parseRawReferenceRange("<0.5");
      expect(parsed).toEqual({ max: 0.5, raw_text: "<0.5" });
    });

    it("parses greater-than (>) pattern as min threshold", () => {
      const parsed = parseRawReferenceRange("> 50");
      expect(parsed).toEqual({ min: 50, raw_text: "> 50" });
    });

    it("parses greater-than with decimal", () => {
      const parsed = parseRawReferenceRange("> 10.2");
      expect(parsed).toEqual({ min: 10.2, raw_text: "> 10.2" });
    });
  });

  describe("Edge cases, empty inputs, and non-numeric labels", () => {
    it("returns null for null, undefined, or empty string", () => {
      expect(parseRawReferenceRange(null)).toBeNull();
      expect(parseRawReferenceRange(undefined)).toBeNull();
      expect(parseRawReferenceRange("")).toBeNull();
      expect(parseRawReferenceRange("   ")).toBeNull();
    });

    it("returns null for 'N/A' and 'None' regardless of case", () => {
      expect(parseRawReferenceRange("N/A")).toBeNull();
      expect(parseRawReferenceRange("n/a")).toBeNull();
      expect(parseRawReferenceRange("None")).toBeNull();
      expect(parseRawReferenceRange("NONE")).toBeNull();
    });

    it("returns raw_text wrapper without min/max for qualitative text", () => {
      const parsed = parseRawReferenceRange("Negative");
      expect(parsed).toEqual({ raw_text: "Negative" });
      expect(parsed?.min).toBeUndefined();
      expect(parsed?.max).toBeUndefined();
    });
  });

  describe("End-to-End Pipeline integration of parsed range to status", () => {
    it("parses '< 200' and correctly marks 215 as High", () => {
      const range = parseRawReferenceRange("< 200");
      expect(computeRangeStatus(215, range)).toBe("High");
      expect(computeRangeStatus(180, range)).toBe("Normal");
    });

    it("parses '> 50' and correctly marks 42 as Low", () => {
      const range = parseRawReferenceRange("> 50");
      expect(computeRangeStatus(42, range)).toBe("Low");
      expect(computeRangeStatus(55, range)).toBe("Normal");
    });
  });
});
