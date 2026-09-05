import { describe, it, expect } from "vitest";
import { reportCache } from "@/lib/cache";

describe("Smart Caching Layer (SHA-256 Fingerprinting)", () => {
  it("computes deterministic hashes and caches data", async () => {
    reportCache.clear();
    const content = "PATIENT_REPORT_SAMPLE_12345";
    const hash1 = await reportCache.computeHash(content);
    const hash2 = await reportCache.computeHash(content);

    expect(hash1).toBe(hash2);

    reportCache.set(hash1, { parsed: true, items: ["Hemoglobin"] });
    expect(reportCache.has(hash1)).toBe(true);

    const cached = reportCache.get<{ parsed: boolean; items: string[] }>(hash1);
    expect(cached?.parsed).toBe(true);
    expect(cached?.items).toContain("Hemoglobin");
  });

  it("handles cache misses gracefully", () => {
    expect(reportCache.get("non_existent_key")).toBeNull();
  });
});
