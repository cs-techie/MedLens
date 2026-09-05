import { PipelineStage } from "./schemas";

export type StageId = 1 | 2 | 3 | 4 | 5;

export interface PipelineExecutionSnapshot {
  pipelineId: string;
  reportName: string;
  contentHash: string;
  currentStageId: StageId;
  stages: PipelineStage[];
  stageData: {
    rawUpload?: { fileName: string; fileSize: number; mimeType: string };
    ocrOutput?: { textLength: number; snippetCount: number; rawTextSample: string };
    structuredExtraction?: { testCount: number; results: any[] };
    validationResults?: { validCount: number; consensusAverage: number; passesMedicalDSL: boolean };
    finalSummary?: { text: string; safetyPassed: boolean; verifiedTimestamp: string };
  };
  totalDurationMs: number;
  isReplaying: boolean;
}

export const DEFAULT_PIPELINE_STAGES: Omit<PipelineStage, "status" | "timestamp">[] = [
  {
    id: 1,
    name: "Upload & Fingerprint",
    description: "File ingestion, SHA-256 content hashing, and client-side zero-retention staging",
  },
  {
    id: 2,
    name: "OCR & Text Normalization",
    description: "High-fidelity text recognition, tabular grid alignment, and coordinate bounding",
  },
  {
    id: 3,
    name: "AI Extraction & Provenance",
    description: "Multi-agent LLM structured field extraction with direct text anchor binding",
  },
  {
    id: 4,
    name: "Medical DSL Validation",
    description: "Consensus scoring (OCR 40% + Schema 30% + Pattern 30%) and emergency threshold checks",
  },
  {
    id: 5,
    name: "AI Self-Check & Summary",
    description: "Post-generation verification agent ensuring zero diagnostic/treatment hallucinations",
  },
];

export class ReplayablePipelineManager {
  private snapshot: PipelineExecutionSnapshot;
  private listeners: ((snapshot: PipelineExecutionSnapshot) => void)[] = [];

  constructor(reportName: string = "Diagnostic_Report.pdf", contentHash: string = "sha256_mock_001") {
    this.snapshot = {
      pipelineId: "pipe_" + Date.now().toString(36),
      reportName,
      contentHash,
      currentStageId: 1,
      stages: DEFAULT_PIPELINE_STAGES.map((s) => ({
        ...s,
        status: "PENDING",
        timestamp: new Date().toISOString(),
      })),
      stageData: {},
      totalDurationMs: 0,
      isReplaying: false,
    };
  }

  getSnapshot(): PipelineExecutionSnapshot {
    return { ...this.snapshot };
  }

  subscribe(listener: (snapshot: PipelineExecutionSnapshot) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getSnapshot()));
  }

  setStageStatus(
    stageId: StageId,
    status: PipelineStage["status"],
    data?: any,
    durationMs?: number
  ) {
    const stage = this.snapshot.stages.find((s) => s.id === stageId);
    if (stage) {
      stage.status = status;
      stage.timestamp = new Date().toISOString();
      if (durationMs !== undefined) stage.durationMs = durationMs;
      this.snapshot.currentStageId = stageId;

      if (data) {
        if (stageId === 1) this.snapshot.stageData.rawUpload = data;
        if (stageId === 2) this.snapshot.stageData.ocrOutput = data;
        if (stageId === 3) this.snapshot.stageData.structuredExtraction = data;
        if (stageId === 4) this.snapshot.stageData.validationResults = data;
        if (stageId === 5) this.snapshot.stageData.finalSummary = data;
      }

      this.snapshot.totalDurationMs = this.snapshot.stages.reduce(
        (sum, s) => sum + (s.durationMs || 0),
        0
      );
      this.notify();
    }
  }

  /**
   * Replays the pipeline up to a designated stage
   */
  async replayToStage(targetStageId: StageId, delayBetweenStagesMs: number = 300): Promise<void> {
    this.snapshot.isReplaying = true;
    this.notify();

    for (let id = 1; id <= 5; id++) {
      const stageId = id as StageId;
      const stage = this.snapshot.stages.find((s) => s.id === stageId);
      if (!stage) continue;

      if (stageId <= targetStageId) {
        stage.status = "PROCESSING";
        this.snapshot.currentStageId = stageId;
        this.notify();
        await new Promise((r) => setTimeout(r, delayBetweenStagesMs));
        stage.status = "COMPLETED";
      } else {
        stage.status = "PENDING";
      }
      this.notify();
    }

    this.snapshot.isReplaying = false;
    this.notify();
  }
}
