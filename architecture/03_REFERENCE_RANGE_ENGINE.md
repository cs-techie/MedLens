# 03 - Reference Range Engine & Medical DSL

```mermaid
flowchart TD
    A[Extracted Lab Item] --> B{Report Range Present?}
    B -- Yes --> C[Parse Numerical Min-Max from Report Text]
    B -- No --> D{Medical DSL Policy}
    D -- 'reference-range-only' --> E[Set Range to null & Flag Missing]
    D -- 'allow-standard-fallback' --> F[Query Age/Gender Standard Baseline]
    C --> G[Evaluate Outlier Status: LOW / NORMAL / HIGH / CRITICAL]
    F --> G
    E --> G
    G --> H[Critical Emergency Threshold Inspection]
    H --> I[Generate Clinical Context Card]
```

## Anti-Hallucination Protocol
Traditional medical LLM wrappers frequently hallucinate reference ranges when absent from a lab report. MedLens enforces the `Medical DSL`:
- If an assay is flagged `reference-range-only` (such as Hemoglobin, WBC, Platelets), MedLens **forbids** AI extrapolation.
- Ranges are strictly anchored to lab text. If missing, the status is explicitly marked as `UNKNOWN / RANGE_UNSPECIFIED` rather than fabricating synthetic boundaries.
