import { NextResponse } from "next/server";
import { generateSafeAISummary } from "@/lib/summaryEngine";
import { MedicalRecord } from "@/types/medlens";
import { sanitizePatientInput } from "@/lib/security";
import { reportCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    const identifier = rateLimiter.getIdentifier(request);
    const rateCheck = rateLimiter.check(identifier, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait before requesting another summary." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
            "X-RateLimit-Limit": rateCheck.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
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

    // Deterministic cache key based on sanitized patient demographics and lab results
    const summaryFingerprint = JSON.stringify({
      name: sanitizedRecord.patient.name?.value,
      age: sanitizedRecord.patient.age?.value,
      sex: sanitizedRecord.patient.sex?.value,
      symptoms: (sanitizedRecord.patient.symptoms || []).map((s) => s.value),
      conditions: (sanitizedRecord.patient.conditions || []).map((c) => c.value),
      medications: (sanitizedRecord.patient.medications || []).map((m) => m.value),
      allergies: (sanitizedRecord.patient.allergies || []).map((a) => a.value),
      labs: (sanitizedRecord.documents || []).flatMap((d) =>
        (d.extracted_results || []).map((r) => `${r.test_name}:${r.value}:${r.unit}:${r.reference_range?.raw_text || ""}`)
      ),
    });

    const cacheKey = await reportCache.computeHash(`summary:${summaryFingerprint}`);
    const cachedSummary = reportCache.get(cacheKey);
    if (cachedSummary) {
      return NextResponse.json(
        { success: true, summary: cachedSummary, cached: true },
        {
          headers: {
            "X-MedLens-Cache": "HIT",
            "Cache-Control": "private, no-cache",
          },
        }
      );
    }

    const summary = await generateSafeAISummary(sanitizedRecord);
    reportCache.set(cacheKey, summary);

    return NextResponse.json(
      { success: true, summary, cached: false },
      {
        headers: {
          "X-MedLens-Cache": "MISS",
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to generate summary.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
