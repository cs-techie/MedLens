import { NextResponse } from "next/server";
import { processDocumentExtraction, DEMO_SAMPLE_REPORTS } from "@/lib/ocrExtractor";
import { sanitizeString, validateInputLength } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, rawText, sampleId } = body;

    // Handle sample document selection
    if (sampleId && typeof sampleId === "string") {
      const sanitizedSampleId = sanitizeString(sampleId);
      const sample = DEMO_SAMPLE_REPORTS.find((s) => s.id === sanitizedSampleId);
      if (sample) {
        const docRecord = processDocumentExtraction(
          sample.filename,
          sample.rawText,
          sample.results
        );
        return NextResponse.json({
          success: true,
          document: docRecord,
        });
      }
    }

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json(
        { success: false, error: "Raw report text or document is required." },
        { status: 400 }
      );
    }

    if (!validateInputLength(rawText, 50000)) {
      return NextResponse.json(
        { success: false, error: "Uploaded text exceeds the 50KB size limit." },
        { status: 400 }
      );
    }

    const sanitizedFilename = sanitizeString(filename || "Uploaded_Medical_Report.pdf");
    const sanitizedText = sanitizeString(rawText);

    const docRecord = processDocumentExtraction(
      sanitizedFilename,
      sanitizedText
    );

    return NextResponse.json({
      success: true,
      document: docRecord,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Document extraction failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
