import { ExtractedLabResult, DocumentRecord } from "@/types/medlens";
import { computeRangeStatus, parseRawReferenceRange } from "./rangeEngine";

export interface DemoSampleReport {
  id: string;
  title: string;
  description: string;
  filename: string;
  rawText: string;
  results: Array<{
    test_name: string;
    value: number | string;
    unit: string;
    raw_range: string;
    confidence: number;
    page: number;
    bounding_box: { x: number; y: number; w: number; h: number; text_snippet?: string };
    observations?: string;
  }>;
}

export const DEMO_SAMPLE_REPORTS: DemoSampleReport[] = [
  {
    id: "sample_cbc_anemia",
    title: "CBC Anemia & Iron Panel (PDF Scan)",
    description: "Sample lab report for a patient with persistent fatigue showing low hemoglobin & ferritin.",
    filename: "CBC_Comprehensive_Iron_Panel_2026.pdf",
    rawText: `METROPOLITAN CLINICAL LABORATORIES
PATIENT: Eleanor Vance | AGE: 42 | SEX: F | DATE: 2026-09-02

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
Total Iron Binding (TIBC) 465 *       ug/dL      250 - 425          HIGH`,
    results: [
      {
        test_name: "Hemoglobin",
        value: 10.4,
        unit: "g/dL",
        raw_range: "12.0 - 15.5",
        confidence: 98,
        page: 1,
        bounding_box: { x: 10, y: 22, w: 80, h: 4, text_snippet: "Hemoglobin 10.4 g/dL (12.0 - 15.5)" },
        observations: "Microcytic pattern detected"
      },
      {
        test_name: "Hematocrit",
        value: 31.2,
        unit: "%",
        raw_range: "37.0 - 48.0",
        confidence: 96,
        page: 1,
        bounding_box: { x: 10, y: 26, w: 80, h: 4, text_snippet: "Hematocrit 31.2 % (37.0 - 48.0)" }
      },
      {
        test_name: "Serum Ferritin",
        value: 8.5,
        unit: "ng/mL",
        raw_range: "15.0 - 150.0",
        confidence: 99,
        page: 1,
        bounding_box: { x: 10, y: 38, w: 80, h: 4, text_snippet: "Serum Ferritin 8.5 ng/mL (15.0 - 150.0)" },
        observations: "Severely depleted iron stores"
      },
      {
        test_name: "Total Iron Binding Capacity (TIBC)",
        value: 465,
        unit: "ug/dL",
        raw_range: "250 - 425",
        confidence: 95,
        page: 1,
        bounding_box: { x: 10, y: 50, w: 80, h: 4, text_snippet: "Total Iron Binding (TIBC) 465 ug/dL (250 - 425)" }
      },
      {
        test_name: "Serum Iron",
        value: 42,
        unit: "ug/dL",
        raw_range: "60 - 170",
        confidence: 94,
        page: 1,
        bounding_box: { x: 10, y: 46, w: 80, h: 4, text_snippet: "Serum Iron 42 ug/dL (60 - 170)" }
      },
      {
        test_name: "TSH (Thyroid Stimulating Hormone)",
        value: 2.45,
        unit: "mIU/L",
        raw_range: "0.40 - 4.50",
        confidence: 99,
        page: 1,
        bounding_box: { x: 10, y: 42, w: 80, h: 4, text_snippet: "Thyroid Stimulating (TSH) 2.45 mIU/L (0.40 - 4.50)" }
      }
    ]
  },
  {
    id: "sample_metabolic_lipid",
    title: "Comprehensive Metabolic & Lipid Panel",
    description: "Routine checkup report showing elevated fast glucose & cholesterol with missing range for Vitamin B12.",
    filename: "Metabolic_Lipid_Panel_2026.pdf",
    rawText: `CENTRAL METROPOLITAN HOSPITAL LABS
DATE: 2026-08-15

COMPREHENSIVE METABOLIC & LIPID PROFILE

Fasting Glucose: 118 mg/dL (70 - 99 mg/dL) [HIGH]
HbA1c: 6.1 % (4.0 - 5.6 %) [HIGH]
Serum Creatinine: 0.9 mg/dL (0.6 - 1.2 mg/dL) [NORMAL]
Blood Urea Nitrogen (BUN): 16 mg/dL (7 - 20 mg/dL) [NORMAL]
Total Cholesterol: 228 mg/dL (< 200 mg/dL) [HIGH]
LDL Cholesterol: 142 mg/dL (< 100 mg/dL) [HIGH]
HDL Cholesterol: 52 mg/dL (> 40 mg/dL) [NORMAL]
Triglycerides: 168 mg/dL (< 150 mg/dL) [HIGH]
Vitamin B12: 450 pg/mL (Range not provided) [N/A]`,
    results: [
      {
        test_name: "Fasting Glucose",
        value: 118,
        unit: "mg/dL",
        raw_range: "70 - 99",
        confidence: 97,
        page: 1,
        bounding_box: { x: 10, y: 18, w: 80, h: 4, text_snippet: "Fasting Glucose: 118 mg/dL (70 - 99 mg/dL)" }
      },
      {
        test_name: "HbA1c (Glycated Hemoglobin)",
        value: 6.1,
        unit: "%",
        raw_range: "4.0 - 5.6",
        confidence: 96,
        page: 1,
        bounding_box: { x: 10, y: 22, w: 80, h: 4, text_snippet: "HbA1c: 6.1 % (4.0 - 5.6 %)" }
      },
      {
        test_name: "Total Cholesterol",
        value: 228,
        unit: "mg/dL",
        raw_range: "< 200",
        confidence: 98,
        page: 1,
        bounding_box: { x: 10, y: 34, w: 80, h: 4, text_snippet: "Total Cholesterol: 228 mg/dL (< 200 mg/dL)" }
      },
      {
        test_name: "LDL Cholesterol",
        value: 142,
        unit: "mg/dL",
        raw_range: "< 100",
        confidence: 95,
        page: 1,
        bounding_box: { x: 10, y: 38, w: 80, h: 4, text_snippet: "LDL Cholesterol: 142 mg/dL (< 100 mg/dL)" }
      },
      {
        test_name: "Vitamin B12",
        value: 450,
        unit: "pg/mL",
        raw_range: "",
        confidence: 92,
        page: 1,
        bounding_box: { x: 10, y: 50, w: 80, h: 4, text_snippet: "Vitamin B12: 450 pg/mL (Range not provided)" }
      }
    ]
  }
];

export function processDocumentExtraction(
  filename: string,
  rawText: string,
  preparsedResults?: DemoSampleReport["results"]
): DocumentRecord {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let extractedResults: ExtractedLabResult[] = [];

  if (preparsedResults && preparsedResults.length > 0) {
    extractedResults = preparsedResults.map((item, idx) => {
      const parsedRange = parseRawReferenceRange(item.raw_range);
      const numVal = typeof item.value === "number" ? item.value : parseFloat(item.value);
      const status = computeRangeStatus(item.value, parsedRange);

      return {
        id: `${docId}_lab_${idx + 1}`,
        test_name: item.test_name,
        value: item.value,
        numeric_value: isNaN(numVal) ? undefined : numVal,
        unit: item.unit,
        reference_range: parsedRange,
        status,
        source: "ai_extracted",
        confidence: item.confidence,
        page: item.page,
        bounding_box: item.bounding_box,
        verified: false,
        observations: item.observations,
      };
    });
  } else {
    // Basic regex line-by-line fallback parser for custom pasted report text
    const lines = rawText.split("\n");
    let count = 0;
    for (const line of lines) {
      const match = line.match(/([A-Za-z0-9\s()-]+)[:\t]+(\d+(?:\.\d+)?)\s*([A-Za-z/%uLmgdL]+)?(?:\s*\(([0-9.\s\-<>]+)\))?/);
      if (match) {
        count++;
        const testName = match[1].trim();
        const valStr = match[2];
        const numVal = parseFloat(valStr);
        const unit = match[3] || "";
        const rawRangeStr = match[4] || "";

        const parsedRange = parseRawReferenceRange(rawRangeStr);
        const status = computeRangeStatus(numVal, parsedRange);

        extractedResults.push({
          id: `${docId}_lab_${count}`,
          test_name: testName,
          value: numVal,
          numeric_value: numVal,
          unit,
          reference_range: parsedRange,
          status,
          source: "ai_extracted",
          confidence: 88, // Default confidence for regex extraction
          page: 1,
          bounding_box: { x: 10, y: 15 + count * 5, w: 80, h: 4, text_snippet: line.trim() },
          verified: false,
        });
      }
    }
  }

  return {
    document_id: docId,
    filename,
    upload_date: new Date().toISOString(),
    page_count: 1,
    raw_ocr_text: rawText,
    extracted_results: extractedResults,
    mini_summary: `Extracted ${extractedResults.length} lab test fields from ${filename}.`
  };
}
