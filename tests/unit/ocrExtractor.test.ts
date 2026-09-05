import { describe, it, expect } from "vitest";
import { processDocumentExtraction, DEMO_SAMPLE_REPORTS } from "@/lib/ocrExtractor";

describe("OCR & Pathology Extractor Engine (ocrExtractor.ts)", () => {
  it("provides preconfigured demo sample reports", () => {
    expect(DEMO_SAMPLE_REPORTS.length).toBeGreaterThan(0);
    const sample = DEMO_SAMPLE_REPORTS.find((s) => s.id === "sample_cbc_anemia");
    expect(sample).toBeDefined();
    expect(sample?.title).toContain("CBC");
    expect(sample?.results.length).toBeGreaterThan(0);
  });

  it("extracts structured lab results from raw pathology report text", () => {
    const rawText = `
METROPOLITAN LABS
Hemoglobin: 10.4 g/dL (12.0 - 15.5)
WBC: 6.8 K/uL (4.5 - 11.0)
Glucose: 95 mg/dL (70 - 99)
`;

    const docRecord = processDocumentExtraction("Test_Report.pdf", rawText);
    expect(docRecord.filename).toBe("Test_Report.pdf");
    expect(docRecord.document_id).toMatch(/^doc_/);
    expect(docRecord.extracted_results.length).toBeGreaterThan(0);

    const hb = docRecord.extracted_results.find((r) => r.test_name === "Hemoglobin");
    expect(hb).toBeDefined();
    expect(hb?.value).toBe(10.4);
    expect(hb?.status).toBe("Low");
  });

  it("processes report with pre-parsed results and maintains bounding box metadata", () => {
    const preParsedResults = [
      {
        test_name: "Serum Ferritin",
        value: 8.5,
        unit: "ng/mL",
        raw_range: "15.0 - 150.0",
        confidence: 99,
        page: 1,
        bounding_box: { x: 10, y: 38, w: 80, h: 4, text_snippet: "Serum Ferritin 8.5" },
        observations: "Low iron store pattern",
      },
    ];

    const docRecord = processDocumentExtraction(
      "Iron_Panel.pdf",
      "Raw report text body",
      preParsedResults
    );

    expect(docRecord.extracted_results).toHaveLength(1);
    const result = docRecord.extracted_results[0];
    expect(result.test_name).toBe("Serum Ferritin");
    expect(result.status).toBe("Low");
    expect(result.bounding_box?.text_snippet).toContain("Serum Ferritin 8.5");
    expect(result.observations).toBe("Low iron store pattern");
  });
});
