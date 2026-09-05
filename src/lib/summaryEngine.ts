import { AISummary, MedicalRecord } from "@/types/medlens";

// Disallowed diagnostic or prescriptive phrase patterns
const DISALLOWED_PATTERNS = [
  /diagnos(ed|is|ing)/i,
  /you have\s+(?:anemia|diabetes|cancer|disease|infection)/i,
  /you should take\s+/i,
  /prescrib(e|ed|ing)/i,
  /treatment plan/i,
  /take\s+\d+\s*mg/i,
  /cure/i,
];

export const MANDATORY_DISCLAIMER_SENTENCE = "This summary is informational and not a diagnosis.";

/**
 * Validates text against strict clinical safety rules.
 * Returns true if text passes, false if diagnostic/prescriptive language is detected.
 */
export function validateSummarySafety(text: string): boolean {
  if (!text.endsWith(MANDATORY_DISCLAIMER_SENTENCE)) {
    return false;
  }

  const contentOnly = text.slice(0, text.length - MANDATORY_DISCLAIMER_SENTENCE.length);

  for (const pattern of DISALLOWED_PATTERNS) {
    if (pattern.test(contentOnly)) {
      return false;
    }
  }

  return true;
}

/**
 * Generates a deterministic template summary grounded strictly in structured data.
 * Used as primary grounded summary and safe fallback if LLM/filter fails.
 */
export function generateDeterministicTemplateSummary(record: MedicalRecord): AISummary {
  const patient = record.patient;
  const allLabs = record.documents.flatMap((d) => d.extracted_results);

  const abnormalLabs = allLabs.filter((l) => l.status === "Low" || l.status === "High");
  const normalLabs = allLabs.filter((l) => l.status === "Normal");
  const missingRangeLabs = allLabs.filter((l) => l.status === "Range not provided");

  const abnormalPhrases = abnormalLabs.map((l) => {
    return `${l.test_name} (${l.value} ${l.unit}) measured ${l.status.toLowerCase()} relative to the stated reference interval (${l.reference_range?.raw_text || "N/A"})`;
  });

  let text = `Medical Record Summary for ${patient.name.value} (${patient.age.value} yrs, ${patient.sex.value}):\n\n`;

  if (abnormalPhrases.length > 0) {
    text += `• Laboratory Findings Outside Reported Ranges: ${abnormalPhrases.join("; ")}.\n`;
  } else {
    text += `• Laboratory Findings: All reported parameters measured within their respective stated reference ranges.\n`;
  }

  if (normalLabs.length > 0) {
    text += `• Normal Parameters: ${normalLabs.map((l) => `${l.test_name} (${l.value} ${l.unit})`).join(", ")} measured within normal bounds.\n`;
  }

  if (missingRangeLabs.length > 0) {
    text += `• Unspecified Ranges: ${missingRangeLabs.map((l) => l.test_name).join(", ")} lacked reference ranges in source document.\n`;
  }

  if (patient.medications.length > 0) {
    text += `• Active Self-Reported Medications: ${patient.medications.map((m) => m.value).join(", ")}.\n`;
  }

  text += `\n${MANDATORY_DISCLAIMER_SENTENCE}`;

  return {
    text,
    source: "ai_generated",
    generated_at: new Date().toISOString(),
    based_on_documents: record.documents.map((d) => d.document_id),
    disclaimer: MANDATORY_DISCLAIMER_SENTENCE,
  };
}

/**
 * Main summary generator endpoint runner.
 * Uses Google Gemini 2.5 Flash API if key is available, validated with safety guardrails.
 */
export async function generateSafeAISummary(record: MedicalRecord): Promise<AISummary> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const patient = record.patient;
      const allLabs = record.documents.flatMap((d) => d.extracted_results);

      const promptText = `You are MedLens AI, a specialized clinical intelligence engine summarizing structured lab data for healthcare review.
CRITICAL SAFETY CONSTRAINTS:
1. DO NOT diagnose diseases or formulate clinical diagnoses.
2. DO NOT prescribe medications, recommend treatments, or suggest specific drug dosages.
3. State facts objectively based strictly on the provided lab results.
4. MUST END YOUR SUMMARY EXACTLY WITH THIS CLAUSE: "${MANDATORY_DISCLAIMER_SENTENCE}"

Patient Context:
- Name: ${patient.name.value}
- Age: ${patient.age.value}
- Biological Sex: ${patient.sex.value}
- Active Self-Reported Medications: ${patient.medications.map((m) => m.value).join(", ") || "None"}

Extracted Lab Findings:
${allLabs
  .map(
    (l) =>
      `- ${l.test_name}: ${l.value} ${l.unit} (Status: ${l.status}, Reference Range: ${l.reference_range?.raw_text || "N/A"})`
  )
  .join("\n")}

Provide a concise, professional clinical bulleted summary.`;

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (!response.ok) {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 600,
              },
            }),
          }
        );
      }

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (rawText) {
          let formattedText = rawText;
          if (!formattedText.endsWith(MANDATORY_DISCLAIMER_SENTENCE)) {
            formattedText = `${formattedText}\n\n${MANDATORY_DISCLAIMER_SENTENCE}`;
          }

          if (validateSummarySafety(formattedText)) {
            return {
              text: formattedText,
              source: "ai_generated",
              generated_at: new Date().toISOString(),
              based_on_documents: record.documents.map((d) => d.document_id),
              disclaimer: MANDATORY_DISCLAIMER_SENTENCE,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to deterministic engine:", err);
    }
  }

  // Always produce safe grounded summary if API unavailable or fails safety audit
  return generateDeterministicTemplateSummary(record);
}
