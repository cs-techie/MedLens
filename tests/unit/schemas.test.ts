import { describe, it, expect } from "vitest";
import {
  LabItemSchema,
  LabReportExtractionSchema,
  PipelineStageSchema,
  AuditEntrySchema,
  ConfidenceSignalsSchema,
} from "@/lib/schemas";

describe("Medical Zod Validation Schemas (schemas.ts)", () => {
  describe("LabItemSchema", () => {
    it("parses valid lab item and applies string conversion to numeric values", () => {
      const parsed = LabItemSchema.parse({
        test_name: "Hemoglobin",
        value: 12.5,
        unit: "g/dL",
        reference_range: "12.0 - 15.5",
        status: "NORMAL",
      });

      expect(parsed.test_name).toBe("Hemoglobin");
      expect(parsed.value).toBe("12.5");
      expect(parsed.unit).toBe("g/dL");
      expect(parsed.status).toBe("NORMAL");
    });

    it("throws ZodError on empty test_name or invalid status enum", () => {
      expect(() =>
        LabItemSchema.parse({
          test_name: "",
          value: "12.5",
        })
      ).toThrow();

      expect(() =>
        LabItemSchema.parse({
          test_name: "WBC",
          value: "5.0",
          status: "INVALID_ENUM_VALUE" as any,
        })
      ).toThrow();
    });
  });

  describe("ConfidenceSignalsSchema", () => {
    it("validates multi-signal confidence scores and verdict enum", () => {
      const validSignals = ConfidenceSignalsSchema.parse({
        ocr: 95,
        schema: 100,
        pattern: 90,
        final: 95,
        verdict: "HIGH_CONFIDENCE",
      });

      expect(validSignals.verdict).toBe("HIGH_CONFIDENCE");
    });

    it("rejects confidence scores outside 0-100 bounds", () => {
      expect(() =>
        ConfidenceSignalsSchema.parse({
          ocr: 150,
          schema: 100,
          pattern: 90,
          final: 95,
          verdict: "HIGH_CONFIDENCE",
        })
      ).toThrow();
    });
  });

  describe("LabReportExtractionSchema", () => {
    it("parses full extraction payload with patient metadata and lab array", () => {
      const payload = LabReportExtractionSchema.parse({
        patient: { name: "Alex Taylor", age: 42, gender: "Female" },
        metadata: { reportType: "CBC Panel" },
        results: [
          {
            test_name: "Platelets",
            value: "250",
            unit: "K/uL",
            reference_range: "150 - 450",
          },
        ],
      });

      expect(payload.patient.name).toBe("Alex Taylor");
      expect(payload.results).toHaveLength(1);
    });
  });

  describe("PipelineStageSchema & AuditEntrySchema", () => {
    it("validates pipeline stage status and ID range", () => {
      const stage = PipelineStageSchema.parse({
        id: 1,
        name: "Tabular OCR Parsing",
        description: "Rasterizing and deskewing document",
        status: "COMPLETED",
        durationMs: 120,
        timestamp: new Date().toISOString(),
      });

      expect(stage.id).toBe(1);
      expect(stage.status).toBe("COMPLETED");
    });

    it("validates audit entry action enums", () => {
      const entry = AuditEntrySchema.parse({
        id: "aud_123",
        timestamp: new Date().toISOString(),
        action: "DE_IDENTIFICATION_APPLIED",
        field: "PatientName",
      });

      expect(entry.action).toBe("DE_IDENTIFICATION_APPLIED");
    });
  });
});
