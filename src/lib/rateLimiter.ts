/**
 * Enterprise Rate Limiting Utility for MedLens API Routes
 * Implements a sliding-window in-memory token bucket limiter.
 * Protects endpoints against DoS, brute force, and token exhaustion.
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

interface ClientWindow {
  count: number;
  resetTime: number;
}

class RateLimiterService {
  private windows = new Map<string, ClientWindow>();
  private defaultLimit: number = 60; // 60 requests
  private defaultWindowMs: number = 60 * 1000; // per 1 minute window

  /**
   * Checks if an IP or client identifier is allowed under rate limits
   */
  check(identifier: string, limit?: number, windowMs?: number): RateLimitResult {
    const maxRequests = limit || this.defaultLimit;
    const windowDuration = windowMs || this.defaultWindowMs;
    const now = Date.now();

    const clientWindow = this.windows.get(identifier);

    if (!clientWindow || now > clientWindow.resetTime) {
      // First request or window expired
      const resetTime = now + windowDuration;
      this.windows.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetMs: windowDuration,
      };
    }

    if (clientWindow.count >= maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetMs: Math.max(0, clientWindow.resetTime - now),
      };
    }

    clientWindow.count++;
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - clientWindow.count,
      resetMs: Math.max(0, clientWindow.resetTime - now),
    };
  }

  /**
   * Helper to extract client IP from incoming Request headers
   */
  getIdentifier(request: Request): string {
    const xff = request.headers.get("x-forwarded-for");
    if (xff) {
      return xff.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
    return "127.0.0.1";
  }

  clear(): void {
    this.windows.clear();
  }
}

export const rateLimiter = new RateLimiterService();
