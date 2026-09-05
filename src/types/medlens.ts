export type ProvenanceSource = "user" | "ai_extracted" | "ai_generated";

export interface ProvenanceField<T> {
  value: T;
  source: ProvenanceSource;
  confidence: number; // 0 to 100
  timestamp: string;
}

export interface PatientProfile {
  name: ProvenanceField<string>;
  age: ProvenanceField<number | null>;
  sex: ProvenanceField<string>;
  symptoms: ProvenanceField<string>[];
  allergies: ProvenanceField<string>[];
  conditions: ProvenanceField<string>[];
  medications: ProvenanceField<string>[];
  notes: ProvenanceField<string>;
}

export type RangeStatus = "Low" | "Normal" | "High" | "Range not provided";

export interface ReferenceRange {
  min?: number;
  max?: number;
  raw_text: string;
}

export interface BoundingBox {
  x: number; // percentage or px coordinate
  y: number;
  w: number;
  h: number;
  text_snippet?: string;
}

export interface EditHistoryItem {
  original_value: number | string;
  corrected_value: number | string;
  corrected_at: string;
  corrected_by: string;
}

export interface ExtractedLabResult {
  id: string;
  test_name: string;
  value: number | string;
  numeric_value?: number;
  unit: string;
  reference_range: ReferenceRange | null;
  status: RangeStatus;
  source: ProvenanceSource; // "ai_extracted"
  confidence: number; // 0 to 100
  page: number;
  bounding_box?: BoundingBox;
  verified: boolean;
  edit_history?: EditHistoryItem[];
  observations?: string;
}

export interface DocumentRecord {
  document_id: string;
  filename: string;
  file_url?: string;
  upload_date: string;
  page_count: number;
  raw_ocr_text: string;
  extracted_results: ExtractedLabResult[];
  mini_summary?: string;
}

export interface AISummary {
  text: string;
  source: "ai_generated";
  generated_at: string;
  based_on_documents: string[];
  disclaimer: string;
}

export interface MedicalRecord {
  patient: PatientProfile;
  documents: DocumentRecord[];
  ai_summary: AISummary | null;
}
