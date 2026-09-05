# 02 - AI Extraction Pipeline & Provenance Architecture

```mermaid
flowchart TD
    A[Normalized OCR Stream] --> B[Client-Side PHI Sanitizer]
    B --> C[De-identified Prompt Assembler]
    C --> D[Gemini 1.5 Pro / Flash Model]
    D --> E[JSON Schema Constrained Response]
    E --> F[Zod LabReportExtractionSchema Validator]
    F --> G[Provenance String Distance Matcher]
    G --> H[Medical DSL Range Binder]
    H --> I[Consensus Engine Synthesis]
```

## Guarantees
- **Type Compliance**: Every response is verified against runtime Zod schemas (`LabReportExtractionSchema`). Any malformed response is caught and rejected before UI delivery.
- **Strict Anchor Matching**: LLM extracted items are reverse-matched against the original OCR line array to guarantee 100% provenance coverage.
- **Explainability Payload**: Each biomarker output contains an explainability object detailing why a result is categorized as normal, elevated, or deficient.
