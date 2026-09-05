import { AuditEntry, AuditEntrySchema } from "./schemas";

class AuditLogService {
  private logs: AuditEntry[] = [];

  record(
    action: AuditEntry["action"],
    details?: {
      field?: string;
      previousValue?: any;
      newValue?: any;
      actor?: string;
      verified?: boolean;
    }
  ): AuditEntry {
    const entry: AuditEntry = {
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      field: details?.field,
      previousValue: details?.previousValue,
      newValue: details?.newValue,
      actor: details?.actor || "MedLens_Provenance_Engine",
      verified: details?.verified ?? true,
    };

    // Runtime validate with Zod
    AuditEntrySchema.parse(entry);
    this.logs.unshift(entry);
    return entry;
  }

  getLogs(): AuditEntry[] {
    return [...this.logs];
  }

  exportAuditTrailJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogService();
