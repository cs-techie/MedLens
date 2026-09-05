import { z } from "zod";

/**
 * Zod Schemas for Medical Data Validation & Type Safety
 * Guarantees strict type compliance at runtime for all extracted lab entities.
 */

export const LabProvenanceSchema = z.object({
  page: z.number().int().positive().default(1),
  line: z.number().int().positive().default(1),
  rawSnippet: z.string().min(1),
  boundingBox: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export const ConfidenceSignalsSchema = z.object({
  ocr: z.number().min(0).max(100),
  schema: z.number().min(0).max(100),
  pattern: z.number().min(0).max(100),
  final: z.number().min(0).max(100),
  verdict: z.enum(["HIGH_CONFIDENCE", "REQUIRES_REVIEW", "UNRELIABLE"]),
});

export const LabItemSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
  value: z.union([z.string(), z.number()]).transform((val) => String(val)),
  unit: z.string().default(""),
  reference_range: z.string().nullable().default(null),
  category: z.string().default("General Panel"),
  status: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL", "UNKNOWN"]).default("NORMAL"),
  confidence: z.number().min(0).max(100).default(95),
  confidenceBreakdown: ConfidenceSignalsSchema.optional(),
  provenance: LabProvenanceSchema.optional(),
  reasoning: z.string().optional(),
});

export const LabReportExtractionSchema = z.object({
  patient: z.object({
    name: z.string().default("De-identified Patient"),
    age: z.union([z.string(), z.number()]).default("Unknown"),
    gender: z.string().default("Unknown"),
    id: z.string().optional(),
  }),
  metadata: z.object({
    reportDate: z.string().default(""),
    laboratory: z.string().default("Clinical Pathology Lab"),
    reportType: z.string().default("Comprehensive Metabolic & Hematology Panel"),
    contentHash: z.string().optional(),
  }),
  results: z.array(LabItemSchema),
});

export const PipelineStageSchema = z.object({
  id: z.number().int().min(1).max(5),
  name: z.string(),
  description: z.string(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  durationMs: z.number().nonnegative().optional(),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const AuditEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.enum([
    "DOCUMENT_UPLOADED",
    "DE_IDENTIFICATION_APPLIED",
    "OCR_EXTRACTED",
    "VALIDATION_PASSED",
    "RANGE_BOUNDED",
    "VERIFICATION_CHECKED",
    "REPORT_VIEWED",
    "EXPORT_REQUESTED",
    "CACHE_HIT",
  ]),
  field: z.string().optional(),
  previousValue: z.any().optional(),
  newValue: z.any().optional(),
  actor: z.string().default("MedLens_Verification_Agent"),
  verified: z.boolean().default(true),
});

export type LabProvenance = z.infer<typeof LabProvenanceSchema>;
export type ConfidenceSignals = z.infer<typeof ConfidenceSignalsSchema>;
export type LabItem = z.infer<typeof LabItemSchema>;
export type LabReportExtraction = z.infer<typeof LabReportExtractionSchema>;
export type PipelineStage = z.infer<typeof PipelineStageSchema>;
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
