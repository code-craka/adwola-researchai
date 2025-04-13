import { Redis } from "@upstash/redis"
import { logError, ErrorCategory, ErrorSeverity } from "../logging/error-logger"

// Initialize Redis client if credentials are available
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Fallback in-memory store if Redis is not available
const inMemoryStore: Record<string, { count: number; reset: number }> = {}

// Clean up in-memory store every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const now = Date.now()
      Object.keys(inMemoryStore).forEach((key) => {
        if (inMemoryStore[key].reset < now) {
          delete inMemoryStore[key]
        }
      })
    },
    10 * 60 * 1000,
  )
}

/**
 * Rate limiting function
 * @param identifier Unique identifier for the rate limit (e.g., IP, user ID, action)
 * @param limit Maximum number of requests allowed in the window
 * @param window Time window in seconds (default: 60 seconds)
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  window = 60,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  const resetTime = now + window * 1000

  try {
    if (redis) {
      // Use Redis for distributed rate limiting
      const multi = redis.multi()
      multi.incr(key)
      multi.pttl(key)

      // If key doesn't exist, set expiration
      multi.expire(key, window)

      const [count, ttl] = (await multi.exec()) as [number, number]

      // If this is a new key, set expiration
      if (count === 1) {
        await redis.expire(key, window)
      }

      const reset = now + (ttl > 0 ? ttl : window * 1000)
      const remaining = Math.max(0, limit - count)

      return {
        success: count <= limit,
        limit,
        remaining,
        reset,
      }
    } else {
      // Fallback to in-memory rate limiting
      if (!inMemoryStore[key]) {
        inMemoryStore[key] = { count: 0, reset: resetTime }
      }

      // Reset if window has passed
      if (inMemoryStore[key].reset < now) {
        inMemoryStore[key] = { count: 0, reset: resetTime }
      }

      // Increment counter
      inMemoryStore[key].count++

      const remaining = Math.max(0, limit - inMemoryStore[key].count)

      return {
        success: inMemoryStore[key].count <= limit,
        limit,
        remaining,
        reset: inMemoryStore[key].reset,
      }
    }
  } catch (error) {
    // Log error but don't block the request
    await logError({
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.WARNING,
      message: `Rate limiting error: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { identifier, limit, window },
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Allow the request to proceed if rate limiting fails
    return {
      success: true,
      limit,
      remaining: 1,
      reset: resetTime,
    }
  }
}
