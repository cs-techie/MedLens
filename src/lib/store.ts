import { MedicalRecord, PatientProfile, DocumentRecord, ProvenanceField } from "@/types/medlens";

function createDefaultField<T>(value: T): ProvenanceField<T> {
  return {
    value,
    source: "user",
    confidence: 100,
    timestamp: new Date().toISOString(),
  };
}

export const initialPatientProfile: PatientProfile = {
  name: createDefaultField("Alex Taylor"),
  age: createDefaultField(42),
  sex: createDefaultField("Female"),
  symptoms: [
    createDefaultField("Persistent Fatigue"),
    createDefaultField("Mild Shortness of Breath"),
  ],
  allergies: [
    createDefaultField("Penicillin"),
  ],
  conditions: [
    createDefaultField("Iron Deficiency Anemia (suspected)"),
    createDefaultField("Hypothyroidism"),
  ],
  medications: [
    createDefaultField("Levothyroxine 50mcg daily"),
    createDefaultField("Ferrous Sulfate 325mg daily"),
  ],
  notes: createDefaultField("Patient presented for routine follow-up with complaints of fatigue over the past 3 months."),
};

export const initialDocuments: DocumentRecord[] = [
  {
    document_id: "doc_demo_cbc",
    filename: "CBC_Comprehensive_Lab_Report_2026.pdf",
    upload_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    page_count: 1,
    raw_ocr_text: `METROPOLITAN CLINICAL LABORATORIES
PATIENT: Alex Taylor | AGE: 42 | SEX: F | DATE: 2026-09-02

COMPLETE BLOOD COUNT (CBC) WITH DIFFERENTIAL

TEST NAME                 RESULT      UNITS      REFERENCE RANGE    FLAGS
-------------------------------------------------------------------------
Hemoglobin                10.4 *      g/dL       12.0 - 15.5        LOW
Hematocrit                31.2 *      %          37.0 - 48.0        LOW
Red Blood Cell (RBC)      3.85 *      M/uL       4.20 - 5.40        LOW
White Blood Cell (WBC)    6.8         K/uL       4.5 - 11.0         NORMAL
Platelets                 245         K/uL       150 - 450          NORMAL
Serum Ferritin            8.5 *       ng/mL      15.0 - 150.0       LOW
Thyroid Stimulating (TSH) 2.45        mIU/L      0.40 - 4.50        NORMAL
Vitamin D (25-OH)         32.0        ng/mL      30.0 - 100.0       NORMAL
Serum Iron                42 *        ug/dL      60 - 170           LOW
Total Iron Binding (TIBC) 465 *       ug/dL      250 - 425          HIGH

Notes: Low ferritin and serum iron with elevated TIBC pattern consistent with iron deficiency.`,
    extracted_results: [
      {
        id: "lab_01",
        test_name: "Hemoglobin",
        value: 10.4,
        numeric_value: 10.4,
        unit: "g/dL",
        reference_range: { min: 12.0, max: 15.5, raw_text: "12.0 - 15.5" },
        status: "Low",
        source: "ai_extracted",
        confidence: 98,
        page: 1,
        bounding_box: { x: 10, y: 22, w: 80, h: 4, text_snippet: "Hemoglobin 10.4 g/dL (12.0 - 15.5)" },
        verified: false,
      },
      {
        id: "lab_02",
        test_name: "Hematocrit",
        value: 31.2,
        numeric_value: 31.2,
        unit: "%",
        reference_range: { min: 37.0, max: 48.0, raw_text: "37.0 - 48.0" },
        status: "Low",
        source: "ai_extracted",
        confidence: 96,
        page: 1,
        bounding_box: { x: 10, y: 26, w: 80, h: 4, text_snippet: "Hematocrit 31.2 % (37.0 - 48.0)" },
        verified: false,
      },
      {
        id: "lab_03",
        test_name: "Serum Ferritin",
        value: 8.5,
        numeric_value: 8.5,
        unit: "ng/mL",
        reference_range: { min: 15.0, max: 150.0, raw_text: "15.0 - 150.0" },
        status: "Low",
        source: "ai_extracted",
        confidence: 99,
        page: 1,
        bounding_box: { x: 10, y: 38, w: 80, h: 4, text_snippet: "Serum Ferritin 8.5 ng/mL (15.0 - 150.0)" },
        verified: true,
      },
      {
        id: "lab_04",
        test_name: "Total Iron Binding Capacity (TIBC)",
        value: 465,
        numeric_value: 465,
        unit: "ug/dL",
        reference_range: { min: 250, max: 425, raw_text: "250 - 425" },
        status: "High",
        source: "ai_extracted",
        confidence: 95,
        page: 1,
        bounding_box: { x: 10, y: 50, w: 80, h: 4, text_snippet: "Total Iron Binding (TIBC) 465 ug/dL (250 - 425)" },
        verified: false,
      },
      {
        id: "lab_05",
        test_name: "TSH (Thyroid Stimulating Hormone)",
        value: 2.45,
        numeric_value: 2.45,
        unit: "mIU/L",
        reference_range: { min: 0.40, max: 4.50, raw_text: "0.40 - 4.50" },
        status: "Normal",
        source: "ai_extracted",
        confidence: 99,
        page: 1,
        bounding_box: { x: 10, y: 42, w: 80, h: 4, text_snippet: "Thyroid Stimulating (TSH) 2.45 mIU/L (0.40 - 4.50)" },
        verified: true,
      }
    ],
    mini_summary: "Complete Blood Count & Iron Panel showing microcytic anemia pattern with low serum ferritin (8.5 ng/mL) and elevated TIBC (465 ug/dL)."
  }
];

export const emptyPatientProfile: PatientProfile = {
  name: createDefaultField(""),
  age: createDefaultField(0),
  sex: createDefaultField("Female"),
  symptoms: [],
  allergies: [],
  conditions: [],
  medications: [],
  notes: createDefaultField(""),
};

export const emptyMedicalRecord: MedicalRecord = {
  patient: emptyPatientProfile,
  documents: [],
  ai_summary: null,
};


export const initialMedicalRecord: MedicalRecord = {
  patient: initialPatientProfile,
  documents: initialDocuments,
  ai_summary: {
    text: "The patient record presents findings consistent with mild microcytic anemia relative to reported lab ranges. Serum ferritin is lower than the document's reference interval (8.5 ng/mL vs. 15.0-150.0 ng/mL), accompanied by decreased Hemoglobin (10.4 g/dL) and elevated TIBC (465 ug/dL). Thyroid-stimulating hormone (TSH) remains within stated normal parameters. Active medications include oral iron supplementation and Levothyroxine.",
    source: "ai_generated",
    generated_at: new Date().toISOString(),
    based_on_documents: ["doc_demo_cbc"],
    disclaimer: "This summary is informational and not a diagnosis."
  }
};

