import { describe, it, expect, beforeEach } from "vitest";
import { reportCache } from "@/lib/cache";

describe("Smart Caching Layer (SHA-256 Fingerprinting & Memoization)", () => {
  beforeEach(() => {
    reportCache.clear();
  });

  it("computes deterministic hashes and caches data", async () => {
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

  it("produces distinct hashes for different contents", async () => {
    const hashA = await reportCache.computeHash("Report_A_Data");
    const hashB = await reportCache.computeHash("Report_B_Data");
    expect(hashA).not.toBe(hashB);
  });

  it("handles cache misses gracefully", () => {
    expect(reportCache.get("non_existent_key")).toBeNull();
    expect(reportCache.has("non_existent_key")).toBe(false);
  });

  it("tracks hit counts accurately", async () => {
    const key = await reportCache.computeHash("hit_counter_test");
    reportCache.set(key, { value: 42 });

    expect(reportCache.get(key)).toEqual({ value: 42 });
    expect(reportCache.get(key)).toEqual({ value: 42 });
    expect(reportCache.get(key)).toEqual({ value: 42 });

    const stats = reportCache.stats();
    expect(stats.size).toBe(1);
    expect(stats.entries[0].hits).toBe(3);
  });

  it("expires items when TTL is exceeded", async () => {
    const key = await reportCache.computeHash("ttl_test");
    // Set with 1ms TTL
    reportCache.set(key, { data: "ephemeral" }, 1);

    // Wait 15ms
    await new Promise((resolve) => setTimeout(resolve, 15));

    expect(reportCache.get(key)).toBeNull();
    expect(reportCache.has(key)).toBe(false);
  });

  it("clears all cached entries when requested", async () => {
    const key1 = await reportCache.computeHash("doc1");
    const key2 = await reportCache.computeHash("doc2");
    reportCache.set(key1, "data1");
    reportCache.set(key2, "data2");

    expect(reportCache.stats().size).toBe(2);
    reportCache.clear();
    expect(reportCache.stats().size).toBe(0);
    expect(reportCache.get(key1)).toBeNull();
  });
});
