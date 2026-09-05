import { ConfidenceSignals } from "./schemas";

export interface ConsensusInput {
  ocrRawScore?: number; // Raw OCR engine character recognition confidence (0-100)
  schemaValidationScore?: number; // Schema & field completeness score (0-100)
  patternMatchScore?: number; // Regex pattern conformity (e.g. valid unit, standard range format) (0-100)
  hasDirectProvenance?: boolean;
  isAmbiguousUnit?: boolean;
}

export interface ConsensusBreakdown {
  ocr: number;
  schema: number;
  pattern: number;
  final: number;
  weights: {
    ocr: number;
    schema: number;
    pattern: number;
  };
  verdict: "HIGH_CONFIDENCE" | "REQUIRES_REVIEW" | "UNRELIABLE";
  notes: string[];
}

const OCR_WEIGHT = 0.4;
const SCHEMA_WEIGHT = 0.3;
const PATTERN_WEIGHT = 0.3;

/**
 * Calculates a multi-signal consensus score for an extracted medical field.
 * Combines character-level OCR reliability, schema integrity, and syntactic medical regex patterns.
 */
export function computeConsensusScore(input: ConsensusInput): ConsensusBreakdown {
  const ocr = Math.round(Math.max(0, Math.min(100, input.ocrRawScore ?? 95)));
  const schema = Math.round(Math.max(0, Math.min(100, input.schemaValidationScore ?? 100)));
  
  // Calculate pattern score based on heuristics if not explicitly given
  let pattern = input.patternMatchScore ?? 98;
  const notes: string[] = [];

  if (input.hasDirectProvenance === false) {
    pattern = Math.max(50, pattern - 25);
    notes.push("Direct snippet provenance was missing or unanchored.");
  }

  if (input.isAmbiguousUnit) {
    pattern = Math.max(60, pattern - 15);
    notes.push("Unit is non-standard or clinically ambiguous.");
  }

  pattern = Math.round(Math.max(0, Math.min(100, pattern)));

  // Formula: OCRConfidence * 0.4 + SchemaConfidence * 0.3 + PatternConfidence * 0.3
  const final = Math.round(
    ocr * OCR_WEIGHT + schema * SCHEMA_WEIGHT + pattern * PATTERN_WEIGHT
  );

  let verdict: ConsensusBreakdown["verdict"] = "HIGH_CONFIDENCE";
  if (final < 70) {
    verdict = "UNRELIABLE";
    notes.push("Final confidence score is critically low. Flagged for human review.");
  } else if (final < 90) {
    verdict = "REQUIRES_REVIEW";
    notes.push("Borderline confidence signal. Recommended secondary clinician verification.");
  }

  return {
    ocr,
    schema,
    pattern,
    final,
    weights: {
      ocr: OCR_WEIGHT,
      schema: SCHEMA_WEIGHT,
      pattern: PATTERN_WEIGHT,
    },
    verdict,
    notes,
  };
}

/**
 * Formats consensus breakdown for UI presentation tables
 */
export function formatConsensusRows(consensus: ConfidenceSignals | ConsensusBreakdown) {
  return [
    { signal: "OCR Character Fidelity", weight: "40%", score: consensus.ocr },
    { signal: "Schema Structural Match", weight: "30%", score: consensus.schema },
    { signal: "Medical Pattern Syntax", weight: "30%", score: consensus.pattern },
    { signal: "Final Consensus Score", weight: "100%", score: consensus.final, isTotal: true },
  ];
}
