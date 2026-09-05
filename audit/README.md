# Clinical Audit Trail & Provenance Architecture

## Overview
In high-stakes healthcare AI systems, every single extraction, modification, and synthetic summary output must have an immutable audit trail. MedLens implements a zero-trust, client-side traceable audit log compliant with HIPAA § 164.312(b) audit control standards.

## Audit Log Guarantees
1. **Field-Level Traceability**: Each biomarker (e.g. Hemoglobin, WBC) records its original raw OCR bounding box, normalized value, consensus score, and timestamp.
2. **Zero-Retention Integrity**: PHI identifiers (MRN, Social Security, Patient Name) are sanitized and recorded as redacted prior to any downstream computation.
3. **Immutability**: Audit entries are append-only. Any clinician edits produce a discrete modification entry with `edited: true` and an exact diff without overwriting original provenance records.
4. **Verification Attestation**: Every generated summary carries a cryptographic timestamp indicating that the safety checker validated zero hallucinations, zero unauthorized diagnoses, and zero prescriptions.
