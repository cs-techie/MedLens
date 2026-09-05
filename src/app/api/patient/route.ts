import { NextResponse } from "next/server";
import { initialPatientProfile } from "@/lib/store";
import { PatientProfile } from "@/types/medlens";
import { sanitizePatientInput, validateInputLength } from "@/lib/security";
import { rateLimiter } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

// In-memory store for active patient profile during session
let currentPatient: PatientProfile = { ...initialPatientProfile };

export async function GET(request: Request) {
  const identifier = rateLimiter.getIdentifier(request);
  const rateCheck = rateLimiter.check(identifier, 60, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Please wait." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
    );
  }

  return NextResponse.json({
    success: true,
    patient: currentPatient,
  });
}

export async function POST(request: Request) {
  try {
    const identifier = rateLimiter.getIdentifier(request);
    const rateCheck = rateLimiter.check(identifier, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait." },
        { status: 429, headers: { "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString() } }
      );
    }
    const rawBody = await request.json();
    if (!rawBody || !rawBody.name || !rawBody.name.value) {
      return NextResponse.json(
        { success: false, error: "Patient name is required." },
        { status: 400 }
      );
    }

    if (!validateInputLength(rawBody.name.value, 150)) {
      return NextResponse.json(
        { success: false, error: "Patient name exceeds maximum allowed length." },
        { status: 400 }
      );
    }

    const sanitizedProfile: PatientProfile = sanitizePatientInput(rawBody);
    currentPatient = sanitizedProfile;

    return NextResponse.json({
      success: true,
      message: "Patient intake updated with user provenance.",
      patient: currentPatient,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to update patient intake.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
