# MedLens — AI Clinical Intelligence Pipeline
## Product Requirements Document (PRD), Technical Requirements Document (TRD) & System Architecture

---

# PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Overview

**Product Name:** MedLens
**One-liner:** An AI system that transforms fragmented medical documents into a structured, traceable patient record with evidence-backed extraction, automatic reference-range analysis, and safe, non-diagnostic AI summaries.

**Problem Statement:**
Patient medical information — history, prescriptions, lab reports, past records — is scattered across formats (PDFs, scans, printouts) and hard to review holistically. Clinicians and patients alike lose time reconciling this data manually, and existing AI tools often produce unstructured, unverifiable, or overconfident text summaries that risk being treated as medical advice.

**Solution Summary:**
MedLens ingests patient-provided details and uploaded medical reports, uses OCR + LLM extraction to convert reports into structured, reference-range-aware data, tags every field with its source (user vs. AI-extracted vs. AI-generated), links extracted values back to their exact location in the source document, and produces a safe, disclaimer-bound natural-language summary — without ever diagnosing or recommending treatment.

## 2. Goals & Non-Goals

**Goals**
- Convert unstructured medical reports into structured, machine-readable, human-reviewable records.
- Preserve full provenance for every data point (who/what produced it, and with what confidence).
- Derive Low/Normal/High status strictly from ranges stated in the source report — never invented.
- Provide evidence linking (value ↔ source document location) for trust and auditability.
- Generate a patient-friendly, non-diagnostic AI summary.
- Support review/edit of AI-extracted data by a human before it's treated as "confirmed."

**Non-Goals**
- No diagnosis, treatment planning, or medication dosage recommendations.
- No claim of clinical-grade accuracy — this is a decision-support and organization tool.
- No real-time integration with hospital EHR/EMR systems (out of scope for this build).
- No mobile-native app (web-first).

## 3. Target Users

| Persona | Need |
|---|---|
| Patient / caregiver | Understand their own scattered reports in plain language |
| General physician (non-specialist review) | Quickly see a structured, trend-aware snapshot instead of reading raw PDFs |
| Hackathon/demo judge | See clear, verifiable, safety-conscious AI system design |

## 4. Functional Requirements

### FR1 — Patient Information Intake
- Capture: name, age, sex, symptoms, existing conditions, allergies, current medications, other notes.
- Every field stored as an object: `{ value, source: "user", confidence: 100, timestamp }`.
- Editable at any time; edits are versioned, not silently overwritten.

### FR2 — Medical Report Processing
- Accept uploads: PDF, JPG, PNG (scanned or digital lab reports).
- OCR extracts raw text/layout; LLM parses into structured fields: test name, value, unit, reference range, date, observations.
- Each field tagged with a confidence score and page/location reference.

### FR3 — Structured Medical Record
- All data (user-provided + extracted) merged into one canonical patient record (JSON-backed), rendered as a dashboard — not a raw AI text blob.
- Sections: Patient Profile, Lab Results, Medications, Conditions/Allergies, Documents, Timeline.

### FR4 — Reference-Range Awareness
- Status (Low/Normal/High) computed only from the range stated in the source report.
- If no range is present in the source, status = "Range not provided" — never inferred or fabricated.
- Simple deterministic rule: `value < min → Low`, `value > max → High`, else `Normal`.

### FR5 — Source & Provenance
- Every field in the UI visibly tagged: **User-entered**, **AI-extracted (from document)**, or **AI-generated (summary/inference)**.
- Confidence percentage shown for all AI-derived fields.
- Human can confirm/edit/reject any AI-extracted field; state changes from "unverified" → "verified."

### FR6 — AI-Powered Summary
- Generates a short, plain-language overview of the record.
- Strictly constrained: no diagnosis, no treatment suggestion, no medication guidance.
- Must reference only report-backed findings and explicitly stated reference-range status.
- Every summary ends with a fixed disclaimer: *"This summary is informational and not a diagnosis."*

### FR7 — Evidence-Linked Extraction ("Show Source")
- Split-pane view: original document (left) vs. structured data (right).
- Clicking a structured field highlights/jumps to its source location (page number + bounding region).
- Shown alongside confidence score.

### FR8 — "Explain This Value" (micro-interaction)
- Clicking any lab value opens a popover: value, reference range (with citation to report), status, source page — explanation only, never diagnostic language.

### FR9 — Timeline
- Chronological view of all uploaded reports/events.
- Each entry expandable to: original document, extracted values, and a mini-summary for that specific report.

### FR10 — Knowledge Graph (Lite)
- Visual node-graph connecting Patient → Conditions → Symptoms → Lab Results → Medications, to surface relationships (e.g., a medication linked to a monitored lab value).
- For the hackathon build, this is a rendered relationship graph over the structured JSON — not a persisted graph database.

## 5. Non-Functional Requirements

- **Safety:** Hard-coded guardrails preventing diagnostic/prescriptive language in any AI-generated text (prompt constraints + output filtering).
- **Traceability:** No structured field may exist in the UI without a source tag.
- **Privacy:** Treat all uploaded data as sensitive (PHI-like); no third-party logging of raw document content beyond what's required for processing.
- **Reliability:** Extraction failures must degrade gracefully (flag "could not extract" rather than guessing).
- **Accessibility:** Legible typography, sufficient contrast, keyboard-navigable core flows.
- **Performance:** End-to-end (upload → structured dashboard) under ~15–20 seconds for a typical 1–2 page lab report in the demo environment.

## 6. Success Metrics (for demo/judging)

- 100% of displayed fields carry a visible source/provenance tag.
- 0 instances of diagnostic or prescriptive language in generated summaries (manually verified in demo script).
- Reference-range status always traceable to a value present in the source document.
- Evidence-link click-through works for at least the primary demo document.

## 7. Out of Scope (for the 4-hour build)

- Multi-user authentication/roles beyond a basic session.
- Real bounding-box OCR coordinate mapping (simulated is acceptable).
- Persisted graph database (Neo4j) — visual approximation only.
- Multi-language OCR/report support.

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| LLM hallucinates a reference range not in the document | Extraction prompt explicitly forbids inventing ranges; validation step checks range was present in OCR text before accepting |
| Summary drifts into diagnostic language | Constrained system prompt + post-generation keyword/pattern check (e.g., block "you have," "you should take," drug names as prescriptions) |
| OCR misreads a critical value | Confidence score surfaced; human-verification flag required before "confirmed" state |
| Judges perceive it as a diagnostic tool | Persistent disclaimer banner + fixed closing line on every summary |

---

# PART 2: TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 1. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (React) + Tailwind | Fast to build, server + client components, good for dashboard/split-pane UI |
| API layer | Next.js API routes (serverless functions) | No separate backend needed for a 4-hour build |
| OCR | Mistral OCR or equivalent vision OCR API | Extracts text/layout from scanned/PDF reports |
| Extraction LLM | GPT-5 Vision / equivalent multimodal LLM | Parses OCR output + raw image into structured JSON |
| Summary LLM | Same LLM, separate constrained prompt/call | Keeps extraction and summarization concerns isolated |
| Storage (session/demo) | In-memory / local JSON store, or lightweight DB (SQLite/Postgres) if time allows | Fast to stand up; persistence is a stretch goal |
| File storage | Local disk or object storage (S3-compatible) for uploaded PDFs/images | Needed for the "Show Source" split-pane feature |
| Visualization | Custom React components for dashboard, timeline, and knowledge-graph-lite (e.g., simple force-directed layout or static SVG relationship map) | No need for a full graph DB |

## 2. Data Model

### 2.1 Core Record Schema (conceptual)

```json
{
  "patient": {
    "name": { "value": "string", "source": "user", "confidence": 100 },
    "age": { "value": "number", "source": "user", "confidence": 100 },
    "sex": { "value": "string", "source": "user", "confidence": 100 },
    "symptoms": [{ "value": "string", "source": "user", "confidence": 100 }],
    "allergies": [{ "value": "string", "source": "user", "confidence": 100 }],
    "conditions": [{ "value": "string", "source": "user", "confidence": 100 }],
    "medications": [{ "value": "string", "source": "user", "confidence": 100 }]
  },
  "documents": [
    {
      "document_id": "doc_001",
      "filename": "cbc_report.pdf",
      "upload_date": "ISO-8601",
      "page_count": 1,
      "raw_ocr_text": "string",
      "extracted_results": [
        {
          "test_name": "Hemoglobin",
          "value": 11.2,
          "unit": "g/dL",
          "reference_range": { "min": 12, "max": 16, "raw_text": "12-16" },
          "status": "Low",
          "source": "ai_extracted",
          "confidence": 99,
          "page": 1,
          "bounding_box": { "x": 0, "y": 0, "w": 0, "h": 0 },
          "verified": false
        }
      ]
    }
  ],
  "ai_summary": {
    "text": "string",
    "source": "ai_generated",
    "generated_at": "ISO-8601",
    "based_on_documents": ["doc_001"]
  }
}
```

### 2.2 Provenance Enum
`source` ∈ { `user`, `ai_extracted`, `ai_generated` }
`verified` ∈ { `true`, `false` } — only meaningful for `ai_extracted` fields.

## 3. Processing Pipeline

**Step 1 — Intake**
- Form submission → validated → stored directly as `source: "user"` fields. No AI involved.

**Step 2 — Document Upload & OCR**
- File uploaded → sent to OCR service → returns raw text + (if available) layout/page coordinates.
- Store raw OCR text against the document record for later evidence-linking and auditability.

**Step 3 — Structured Extraction (LLM call #1)**
- Input: OCR text (+ original image if using a vision model) for a single document.
- System prompt constraints:
  - Extract only test name, value, unit, reference range, date, and observations *explicitly present* in the text.
  - If a reference range is not present for a value, set `reference_range: null` and `status: "Range not provided"`.
  - Do not compute or assume a "normal" range from general medical knowledge.
  - Output strict JSON matching the schema above — no prose, no markdown fences.
- Post-processing validation: confirm each extracted range/value actually appears in the raw OCR text (simple substring/fuzzy match) before accepting it as high-confidence.

**Step 4 — Reference-Range Status Computation (deterministic, non-LLM)**
```
if value < range.min: status = "Low"
elif value > range.max: status = "High"
elif range is null: status = "Range not provided"
else: status = "Normal"
```
This is computed in application code, not by the LLM, to guarantee determinism and eliminate hallucination risk for this specific judgment.

**Step 5 — Evidence Linking**
- Each extracted field carries `page` and (if available) `bounding_box`.
- If precise bounding boxes aren't available from OCR in the time available, approximate via matching the extracted value/text string to its nearest text block in the OCR layout output ("simulated highlighting" — acceptable per design, but should be labeled as best-effort/approximate rather than presented as pixel-exact).

**Step 6 — Human Verification**
- UI allows marking each `ai_extracted` field as verified/edited.
- Edited fields retain history: `{ original_ai_value, corrected_value, corrected_by, corrected_at }`.

**Step 7 — Summary Generation (LLM call #2, separate from extraction)**
- Input: the full structured record (not raw documents) — so the summary is grounded only in already-validated structured data.
- System prompt constraints (hard rules):
  - Summarize only what is present in the structured record.
  - Never state or imply a diagnosis.
  - Never recommend treatment, medication changes, or dosages.
  - Explicitly mention any Low/High status and note it is "relative to the report's stated reference range."
  - Must end with the fixed sentence: "This summary is informational and not a diagnosis."
- Output post-filter: regex/keyword check for disallowed patterns (e.g., "you have," "diagnosed with," "take X mg," "prescribe") — if matched, regenerate with a stricter prompt or fall back to a template-based summary.

**Step 8 — Knowledge Graph (Lite) Rendering**
- Build an in-memory graph object from the structured record: nodes = {Patient, Condition, Symptom, Medication, LabResult}; edges = simple rule-based associations (e.g., a medication node linked to a lab-result node it's commonly monitored against, driven by a small static lookup table rather than an LLM call, to keep this deterministic and fast).
- Rendered client-side as an SVG/force-directed graph component — no persisted graph database required.

**Step 9 — Timeline**
- Documents sorted by report date (extracted or upload date fallback).
- Each timeline node references its `document_id`, enabling drill-down into original doc + extracted values + per-document mini-summary.

## 4. API Surface (representative)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/patient` | POST/PUT | Create/update patient intake fields |
| `/api/documents/upload` | POST | Upload a report file, triggers OCR |
| `/api/documents/:id/extract` | POST | Run LLM extraction on OCR'd document |
| `/api/documents/:id/verify` | PATCH | Mark/edit an extracted field as human-verified |
| `/api/record/:patientId` | GET | Return the full merged structured record |
| `/api/record/:patientId/summary` | POST | Generate AI summary from current structured record |
| `/api/record/:patientId/graph` | GET | Return knowledge-graph-lite node/edge data |

## 5. Security & Privacy Considerations

- Treat uploaded documents and patient fields as sensitive data even in a demo: avoid logging raw content to third-party analytics.
- Scope API keys server-side only (never exposed to client).
- If persistence is added, encrypt data at rest where feasible and scope data per session/user.
- Clear, persistent non-diagnostic disclaimer in the UI (not just in the summary text).

## 6. Error Handling

- OCR failure → surface "Could not read document" state, allow manual re-upload; do not block the rest of the app.
- Extraction low-confidence (<70%) → visually flag field as "needs review" rather than silently displaying it as fact.
- Missing reference range → explicit "Range not provided" label, never blank or fabricated.
- Summary generation failure or guardrail violation → fall back to a deterministic template summary built directly from structured fields (no free-form LLM text) to guarantee the safety property always holds.

---

# PART 3: SYSTEM ARCHITECTURE

## 1. High-Level Component Diagram (text form)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                         │
│  ┌───────────────┐ ┌────────────────┐ ┌───────────────────────┐ │
│  │ Intake Form   │ │ Dashboard       │ │ Split-Pane Evidence   │ │
│  │ (patient data)│ │ (structured     │ │ Viewer (doc + data)   │ │
│  │               │ │  record)        │ │                       │ │
│  └───────┬───────┘ └────────┬────────┘ └───────────┬───────────┘ │
│          │                  │                       │             │
│  ┌───────┴──────────────────┴───────────────────────┴──────────┐ │
│  │      Timeline View   |   Knowledge Graph (Lite)   |          │ │
│  │      "Explain This Value" popover                            │ │
│  └────────────────────────────┬───────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                 │ REST calls
┌───────────────────────────────┴──────────────────────────────────┐
│                     API LAYER (Next.js API routes)                │
│  /api/patient   /api/documents/*   /api/record/*                  │
└───────┬─────────────────┬───────────────────┬─────────────────────┘
        │                 │                   │
        ▼                 ▼                   ▼
┌───────────────┐ ┌────────────────┐ ┌────────────────────────┐
│ Patient Store  │ │ OCR Service    │ │ LLM Service             │
│ (structured    │ │ (Mistral OCR / │ │ (extraction call +      │
│  JSON / DB)    │ │  Vision OCR)   │ │  separate summary call) │
└───────────────┘ └────────┬───────┘ └────────────┬────────────┘
                            │                      │
                            ▼                      ▼
                   ┌─────────────────┐   ┌──────────────────────┐
                   │ Raw OCR Text /   │   │ Deterministic Rules   │
                   │ File Storage     │   │ Engine (range status, │
                   │ (documents)      │   │ graph edges, output    │
                   │                  │   │ safety filter)         │
                   └─────────────────┘   └──────────────────────┘
```

## 2. Data Flow (Sequence)

1. **Intake:** User fills form → stored directly as `source: user` fields in Patient Store.
2. **Upload:** User uploads report → file saved to storage → OCR service returns raw text/layout.
3. **Extraction:** OCR text (+ image) sent to Extraction LLM → returns structured JSON candidate fields.
4. **Validation:** Backend cross-checks extracted values/ranges against raw OCR text; assigns confidence; rejects/flags unmatched fields.
5. **Status Computation:** Deterministic rules engine computes Low/Normal/High/"Range not provided" — never the LLM.
6. **Merge:** Extracted fields merged into the patient's structured record alongside user-provided fields, each retaining its `source` tag.
7. **Human Review (optional but recommended):** User verifies/edits flagged fields via dashboard.
8. **Summary:** On request, full structured record sent to Summary LLM (separate, more constrained prompt) → output passed through safety post-filter → stored as `source: ai_generated`.
9. **Presentation:** Dashboard renders sections (Profile, Labs, Timeline, Knowledge Graph); Evidence Viewer allows click-through from any structured field to its document source; "Explain This Value" popover reads directly from the structured record (no new LLM call needed at click-time — keeps it fast and deterministic).

## 3. Deployment View (hackathon-scale)

- Single Next.js app (frontend + API routes) deployed to a platform like Vercel, or run locally for the demo.
- File storage: local `/uploads` directory or a simple object storage bucket.
- Data persistence: in-memory store or SQLite for the duration of the demo; swappable for Postgres if time permits.
- External calls: OCR API and LLM API, both called server-side from API routes to keep API keys off the client.
- No separate microservices needed at this scale — the "pipeline" is a sequence of function calls within API route handlers, not distinct deployed services.

## 4. Why This Architecture Fits the Judging Criteria

| Requirement | How the architecture satisfies it |
|---|---|
| Structured record, not raw AI text | Canonical JSON record is the single source of truth; UI renders from it, not from LLM prose |
| Provenance | `source` field is mandatory on every schema node; enforced at the data-model level, not just UI styling |
| Reference-range awareness without invention | Status computed by a deterministic rules engine using only ranges present in OCR text — LLM is never the authority on "normal" |
| Evidence/traceability | `page` + `bounding_box` (or best-effort match) on every extracted field, surfaced via the split-pane viewer |
| Safety | Two isolated LLM calls (extraction vs. summary) with separate constrained prompts, plus a deterministic post-generation filter as a final safety net |
| Innovation | Knowledge-graph-lite and timeline built from the same structured record with no extra infrastructure cost |

---

*End of document.*
