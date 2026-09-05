import { NextResponse } from "next/server";
import { generateSafeAISummary } from "@/lib/summaryEngine";
import { MedicalRecord } from "@/types/medlens";
import { sanitizePatientInput } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const record: MedicalRecord = await request.json();
    if (!record || !record.patient) {
      return NextResponse.json(
        { success: false, error: "Medical record is required." },
        { status: 400 }
      );
    }

    const sanitizedRecord: MedicalRecord = {
      ...record,
      patient: sanitizePatientInput(record.patient),
    };

    const summary = await generateSafeAISummary(sanitizedRecord);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to generate summary.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
