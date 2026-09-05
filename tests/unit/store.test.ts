import { describe, it, expect } from "vitest";
import { initialPatientProfile, initialDocuments, initialMedicalRecord } from "@/lib/store";

describe("Patient Intake & Document State Store (store.ts)", () => {
  it("exports initialPatientProfile with user provenance and default fields", () => {
    expect(initialPatientProfile.name.value).toBe("Alex Taylor");
    expect(initialPatientProfile.name.source).toBe("user");
    expect(initialPatientProfile.name.confidence).toBe(100);
    expect(initialPatientProfile.symptoms.length).toBeGreaterThan(0);
    expect(initialPatientProfile.conditions.length).toBeGreaterThan(0);
    expect(initialPatientProfile.medications.length).toBeGreaterThan(0);
  });

  it("exports initialDocuments with pre-extracted lab results and raw OCR text", () => {
    expect(initialDocuments).toHaveLength(1);
    const doc = initialDocuments[0];
    expect(doc.document_id).toBe("doc_demo_cbc");
    expect(doc.raw_ocr_text).toContain("METROPOLITAN CLINICAL LABORATORIES");
    expect(doc.extracted_results.length).toBeGreaterThan(0);

    const hb = doc.extracted_results.find((r) => r.test_name === "Hemoglobin");
    expect(hb).toBeDefined();
    expect(hb?.value).toBe(10.4);
    expect(hb?.status).toBe("Low");
    expect(hb?.bounding_box).toBeDefined();
  });

  it("exports initialMedicalRecord linking patient, documents, and safe AI summary", () => {
    expect(initialMedicalRecord.patient.name.value).toBe("Alex Taylor");
    expect(initialMedicalRecord.documents).toHaveLength(1);
    expect(initialMedicalRecord.ai_summary).toBeDefined();
    expect(initialMedicalRecord.ai_summary?.text).toContain("microcytic anemia");
    expect(initialMedicalRecord.ai_summary?.disclaimer).toContain("informational and not a diagnosis");
  });
});
