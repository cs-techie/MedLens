import { NextResponse } from "next/server";
import { processDocumentExtraction, DEMO_SAMPLE_REPORTS } from "@/lib/ocrExtractor";
import { sanitizeString, validateInputLength } from "@/lib/security";
import { reportCache } from "@/lib/cache";
import { rateLimiter } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const identifier = rateLimiter.getIdentifier(request);
    const rateCheck = rateLimiter.check(identifier, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait before uploading again." },
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
    const body = await request.json();
    const { filename, rawText, sampleId } = body;

    // Handle sample document selection
    if (sampleId && typeof sampleId === "string") {
      const sanitizedSampleId = sanitizeString(sampleId);
      const sample = DEMO_SAMPLE_REPORTS.find((s) => s.id === sanitizedSampleId);
      if (sample) {
        const cacheKey = await reportCache.computeHash(`sample:${sanitizedSampleId}`);
        const cachedDoc = reportCache.get(cacheKey);
        if (cachedDoc) {
          return NextResponse.json(
            { success: true, document: cachedDoc, cached: true },
            {
              headers: {
                "X-MedLens-Cache": "HIT",
                "Cache-Control": "private, no-cache",
              },
            }
          );
        }

        const docRecord = processDocumentExtraction(
          sample.filename,
          sample.rawText,
          sample.results
        );
        reportCache.set(cacheKey, docRecord);

        return NextResponse.json(
          { success: true, document: docRecord, cached: false },
          {
            headers: {
              "X-MedLens-Cache": "MISS",
              "Cache-Control": "private, no-cache",
            },
          }
        );
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

    // Compute deterministic fingerprint for input report text
    const cacheKey = await reportCache.computeHash(`${sanitizedFilename}:${sanitizedText}`);
    const cachedDoc = reportCache.get(cacheKey);
    if (cachedDoc) {
      return NextResponse.json(
        { success: true, document: cachedDoc, cached: true },
        {
          headers: {
            "X-MedLens-Cache": "HIT",
            "Cache-Control": "private, no-cache",
          },
        }
      );
    }

    const docRecord = processDocumentExtraction(
      sanitizedFilename,
      sanitizedText
    );
    reportCache.set(cacheKey, docRecord);

    return NextResponse.json(
      { success: true, document: docRecord, cached: false },
      {
        headers: {
          "X-MedLens-Cache": "MISS",
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Document extraction failed.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
