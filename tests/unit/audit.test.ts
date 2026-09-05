import { describe, it, expect, beforeEach } from "vitest";
import { auditLogger } from "@/lib/audit";

describe("HIPAA Audit Logger Service (audit.ts)", () => {
  beforeEach(() => {
    auditLogger.clear();
  });

  it("records audit entry with unique ID, timestamp, and default actor", () => {
    const entry = auditLogger.record("DOCUMENT_UPLOADED", {
      field: "CBC_Report.pdf",
    });

    expect(entry.id).toMatch(/^aud_/);
    expect(entry.action).toBe("DOCUMENT_UPLOADED");
    expect(entry.actor).toBe("MedLens_Provenance_Engine");
    expect(entry.verified).toBe(true);
    expect(entry.timestamp).toBeTruthy();
  });

  it("maintains audit log history in reverse chronological order", () => {
    auditLogger.record("DOCUMENT_UPLOADED");
    auditLogger.record("OCR_EXTRACTED");
    auditLogger.record("VERIFICATION_CHECKED");

    const logs = auditLogger.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].action).toBe("VERIFICATION_CHECKED");
    expect(logs[2].action).toBe("DOCUMENT_UPLOADED");
  });

  it("exports valid JSON audit trail representation", () => {
    auditLogger.record("RANGE_BOUNDED", {
      field: "Hemoglobin",
      previousValue: "10.4",
      newValue: "Low",
    });

    const jsonStr = auditLogger.exportAuditTrailJson();
    const parsed = JSON.parse(jsonStr);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].field).toBe("Hemoglobin");
    expect(parsed[0].newValue).toBe("Low");
  });

  it("clears all audit records when clear is called", () => {
    auditLogger.record("DOCUMENT_UPLOADED");
    expect(auditLogger.getLogs()).toHaveLength(1);

    auditLogger.clear();
    expect(auditLogger.getLogs()).toHaveLength(0);
  });
});
