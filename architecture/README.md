# MedLens System Architecture

## Architecture Overview
MedLens is an enterprise-grade Clinical Pathology Extraction & Explainable Intelligence System built to convert complex, heterogeneous diagnostic reports into structured, verifiable, and explainable health insights.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MEDLENS ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│ 01 OCR & GRID │              │ 02 AI EXTRACT │              │ 03 RANGE DSL  │
│  Tesseract.js │ ───────────► │  Gemini Pro   │ ───────────► │  Medical DSL  │
│  Coordinates  │              │  Zod Schemas  │              │  Anti-Halluc. │
└───────────────┘              └───────────────┘              └───────────────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                     ┌───────────────────────────────────┐
                     │ 04 CONSENSUS & VERIFICATION GATE  │
                     │  Consensus: OCR 40% + Sch 30% + P 30%
                     │  Safety Agent: Zero-Diagnosis     │
                     └───────────────────────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │ 05 ZERO-RETENTION CLINICAL UI     │
                     │  Interactive Split-Screen Viewer  │
                     │  Biomarker Timeline & Graph       │
                     │  Immutable Audit Trail Generator  │
                     └───────────────────────────────────┘
```

## Architectural Documents
- [01_OCR_PIPELINE.md](file:///c:/Users/Administrator/.gemini/antigravity-ide/scratch/MedLens/architecture/01_OCR_PIPELINE.md): Document rasterization, noise filtering, coordinate bounding matrices, and OCR confidence extraction.
- [02_AI_EXTRACTION_PIPELINE.md](file:///c:/Users/Administrator/.gemini/antigravity-ide/scratch/MedLens/architecture/02_AI_EXTRACTION_PIPELINE.md): Structured multi-agent LLM prompts, runtime Zod validation, string distance provenance matching.
- [03_REFERENCE_RANGE_ENGINE.md](file:///c:/Users/Administrator/.gemini/antigravity-ide/scratch/MedLens/architecture/03_REFERENCE_RANGE_ENGINE.md): Medical DSL rules, anti-hallucination range policies, age/gender adjustment.
- [04_SECURITY_AND_PRIVACY_FLOW.md](file:///c:/Users/Administrator/.gemini/antigravity-ide/scratch/MedLens/architecture/04_SECURITY_AND_PRIVACY_FLOW.md): Client-side de-identification, verification agent gate, non-diagnostic boundaries.
- [05_DATA_LIFECYCLE_AND_ZERO_RETENTION.md](file:///c:/Users/Administrator/.gemini/antigravity-ide/scratch/MedLens/architecture/05_DATA_LIFECYCLE_AND_ZERO_RETENTION.md): Volatile memory lifecycle, SHA-256 fingerprinting, zero database persistence.
