# 05 - Data Lifecycle & Zero-Retention Architecture

```mermaid
stateDiagram-v2
    [*] --> Ingested: User drops file
    Ingested --> Fingerprinted: SHA-256 Checksum computed
    Fingerprinted --> MemoryBuffer: Loaded into volatile ArrayBuffer
    MemoryBuffer --> Sanitized: PHI stripped in browser
    Sanitized --> Processing: OCR & AI Extraction
    Processing --> Verified: Verification agent & audit stamp
    Verified --> Displayed: Rendered in client DOM
    Displayed --> Cleared: Window closed or session reset
    Cleared --> [*]: Buffer zeroed via crypto memory sweep
```

## Lifecycle Rules
- **Memory Lifetime**: Volatile browser RAM only.
- **Storage**: No `localStorage`, no cookies with PHI, no disk persistence.
- **Eviction**: Session reset triggers `window.crypto.getRandomValues()` over sensitive buffers before garbage collection.
- **Audit Logs**: Stored strictly as de-identified non-PHI events (`auditLogger.getLogs()`).
