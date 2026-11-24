/**
 * ATLAS AI - In-Memory Sliding Window Rate Limiter
 * Protects auth endpoints, AI model generation, and file uploads against DDoS and brute-force attacks.
 */

interface RateLimitRecord {
  timestamps: number[]
}

class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Periodic garbage collection every 5 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Check if a request exceeds the limit within the time window.
   * @param key Unique client identifier (e.g., client IP or User ID)
   * @param maxRequests Maximum allowed requests in the window
   * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
   */
  public check(
    key: string,
    maxRequests: number = 30,
    windowMs: number = 60 * 1000
  ): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now()
    const windowStart = now - windowMs

    let record = this.store.get(key)
    if (!record) {
      record = { timestamps: [] }
      this.store.set(key, record)
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter(ts => ts > windowStart)

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0]
      const retryAfterMs = Math.max(0, oldestInWindow + windowMs - now)
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs,
      }
    }

    // Record this request
    record.timestamps.push(now)
    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      retryAfterMs: 0,
    }
  }

  private cleanup() {
    const now = Date.now()
    const cutoff = now - 10 * 60 * 1000 // 10 minutes ago
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter(ts => ts > cutoff)
      if (record.timestamps.length === 0) {
        this.store.delete(key)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

/**
 * Extract client IP from request headers safely.
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '127.0.0.1'
}
