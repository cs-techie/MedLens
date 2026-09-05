import { describe, it, expect, beforeEach } from "vitest";
import { rateLimiter, checkRateLimit, resetRateLimiterState } from "@/lib/rateLimiter";

describe("API Rate Limiter Service", () => {
  beforeEach(() => {
    resetRateLimiterState();
  });

  it("allows requests within configured limit threshold", () => {
    const clientIp = "192.168.1.100";
    const res1 = rateLimiter.check(clientIp, 5, 60000);

    expect(res1.allowed).toBe(true);
    expect(res1.limit).toBe(5);
    expect(res1.remaining).toBe(4);

    const res2 = rateLimiter.check(clientIp, 5, 60000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("blocks requests once rate limit is exceeded", () => {
    const clientIp = "192.168.1.101";
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      expect(rateLimiter.check(clientIp, limit, 60000).allowed).toBe(true);
    }

    const blocked = rateLimiter.check(clientIp, limit, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it("isolates rate limits per client identifier", () => {
    const clientA = "10.0.0.1";
    const clientB = "10.0.0.2";
    const limit = 2;

    rateLimiter.check(clientA, limit, 60000);
    rateLimiter.check(clientA, limit, 60000);
    expect(rateLimiter.check(clientA, limit, 60000).allowed).toBe(false);

    expect(rateLimiter.check(clientB, limit, 60000).allowed).toBe(true);
  });

  it("resets rate limit window after expiration", async () => {
    const clientIp = "192.168.1.102";
    const limit = 2;
    const windowMs = 20; // 20ms window for fast testing

    rateLimiter.check(clientIp, limit, windowMs);
    rateLimiter.check(clientIp, limit, windowMs);
    expect(rateLimiter.check(clientIp, limit, windowMs).allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(rateLimiter.check(clientIp, limit, windowMs).allowed).toBe(true);
  });

  it("extracts client IP correctly from request headers", () => {
    const reqWithForwarded = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(rateLimiter.getIdentifier(reqWithForwarded)).toBe("203.0.113.195");

    const reqWithRealIp = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(rateLimiter.getIdentifier(reqWithRealIp)).toBe("198.51.100.1");

    const reqDefault = new Request("http://localhost/api/test");
    expect(rateLimiter.getIdentifier(reqDefault)).toBe("127.0.0.1");
  });

  describe("checkRateLimit standalone helper function", () => {
    it("allows first request from a new client and tracks remaining count", () => {
      const result = checkRateLimit("client-a", 3, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("blocks requests once max is exceeded and reports retryAfterSeconds", () => {
      checkRateLimit("client-c", 2, 60000);
      checkRateLimit("client-c", 2, 60000);
      const blocked = checkRateLimit("client-c", 2, 60000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("tracks separate clients independently with checkRateLimit helper", () => {
      checkRateLimit("client-d", 1, 60000);
      const otherClient = checkRateLimit("client-e", 1, 60000);
      expect(otherClient.allowed).toBe(true);
    });

    it("resets window state when resetRateLimiterState is called", () => {
      checkRateLimit("client-f", 1, 60000);
      expect(checkRateLimit("client-f", 1, 60000).allowed).toBe(false);

      resetRateLimiterState();

      expect(checkRateLimit("client-f", 1, 60000).allowed).toBe(true);
    });
  });
});
