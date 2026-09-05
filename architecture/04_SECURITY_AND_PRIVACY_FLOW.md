# 04 - Security, Privacy & Verification Agent Flow

```mermaid
flowchart TD
    A[Patient Document] --> B[Client-Side Regex De-identification]
    B --> C[Zero-Retention In-Memory Staging]
    C --> D[Ephemeral AI Session Call]
    D --> E[Generated Summary Candidate]
    E --> F[Verification Agent Gate]
    F --> G{Violations Detected?}
    G -- Yes: Diagnostic Assertions --> H[Sanitize to Descriptive Language]
    G -- Yes: Prescription Directives --> I[Strip Dosage & Insert Provider Ref]
    G -- Yes: Hallucinated Ranges --> J[Discard Range & Restore Report Grounding]
    G -- No --> K[Append Clinical Safety Disclaimer]
    H --> K
    I --> K
    J --> K
    K --> L[Audit Trail Event Stamped]
    L --> M[Presentation Layer]
```

## Security Guarantees
1. **Client-Side Sanitization**: Names, MRNs, SSNs, phone numbers, and addresses are stripped in browser memory before any outbound API call.
2. **Zero-Retention**: No patient data or uploaded PDFs are stored on server disks or persistent databases.
3. **Verification Agent**: Ensures generated text never oversteps clinician boundaries by offering direct diagnoses or medications.
