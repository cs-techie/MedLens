import { describe, it, expect } from "vitest";
import { ReplayablePipelineManager } from "@/lib/pipeline";
import { validateExtraction } from "@/lib/validator";
import { computeConsensusScore } from "@/lib/consensus";
import { verifyAISummarySafety } from "@/lib/safetyChecker";

describe("Replayable Pipeline Integration", () => {
  it("progresses across all 5 stages and supports snapshot replay", async () => {
    const pipeline = new ReplayablePipelineManager("Sample_CBC.pdf", "sha256_mock_001");

    // Stage 1: Upload
    pipeline.setStageStatus(1, "COMPLETED", { fileName: "Sample_CBC.pdf", fileSize: 245000 }, 35);
    expect(pipeline.getSnapshot().stages[0].status).toBe("COMPLETED");

    // Stage 2: OCR
    pipeline.setStageStatus(2, "COMPLETED", { textLength: 1200, snippetCount: 14 }, 850);
    expect(pipeline.getSnapshot().stages[1].status).toBe("COMPLETED");

    // Stage 3: AI Extraction
    const extractionResult = {
      test_name: "Hemoglobin",
      value: "11.2",
      unit: "g/dL",
      reference_range: "12.0 - 15.5",
      provenance: { page: 1, line: 14, rawSnippet: "Hemoglobin 11.2 g/dL [12.0 - 15.5]" },
    };
    pipeline.setStageStatus(3, "COMPLETED", { testCount: 1, results: [extractionResult] }, 620);
    expect(pipeline.getSnapshot().stages[2].status).toBe("COMPLETED");

    // Stage 4: Validation & Consensus
    const val = validateExtraction(extractionResult);
    const con = computeConsensusScore({
      ocrRawScore: 96,
      schemaValidationScore: val.score,
      patternMatchScore: 98,
      hasDirectProvenance: true,
    });
    pipeline.setStageStatus(
      4,
      "COMPLETED",
      { validCount: 1, consensusAverage: con.final, passesMedicalDSL: true },
      15
    );
    expect(pipeline.getSnapshot().stages[3].status).toBe("COMPLETED");

    // Stage 5: Safety Verification & Summary
    const safety = verifyAISummarySafety("Hemoglobin is 11.2 g/dL.", ["12.0 - 15.5"]);
    pipeline.setStageStatus(
      5,
      "COMPLETED",
      { text: safety.safeSummary, safetyPassed: safety.passed, verifiedTimestamp: new Date().toISOString() },
      20
    );
    expect(pipeline.getSnapshot().stages[4].status).toBe("COMPLETED");

    const fullSnapshot = pipeline.getSnapshot();
    expect(fullSnapshot.totalDurationMs).toBeGreaterThan(0);
    expect(fullSnapshot.stageData.validationResults?.consensusAverage).toBe(98);

    // Replay to stage 2
    await pipeline.replayToStage(2, 10);
    const replayedSnapshot = pipeline.getSnapshot();
    expect(replayedSnapshot.stages[0].status).toBe("COMPLETED");
    expect(replayedSnapshot.stages[1].status).toBe("COMPLETED");
    expect(replayedSnapshot.stages[2].status).toBe("PENDING");
  });
});
