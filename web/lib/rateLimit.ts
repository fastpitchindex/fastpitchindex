import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory rate limiter for development (fallback)
class MemoryRateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private limit: number;
  private window: number;

  constructor(limit: number, window: number) {
    this.limit = limit;
    this.window = window;
  }

  async limit(key: string) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      this.store.set(key, {
        count: 1,
        resetTime: now + this.window,
      });
      return { 
        success: true, 
        limit: this.limit, 
        remaining: this.limit - 1, 
        reset: Math.floor((now + this.window) / 1000) 
      };
    }

    if (record.count >= this.limit) {
      return { 
        success: false, 
        limit: this.limit, 
        remaining: 0, 
        reset: Math.floor(record.resetTime / 1000) 
      };
    }

    record.count++;
    return { 
      success: true, 
      limit: this.limit, 
      remaining: this.limit - record.count, 
      reset: Math.floor(record.resetTime / 1000) 
    };
  }
}

// Create rate limiter instance
// Uses Upstash Redis in production, falls back to in-memory for development
function createRateLimiter(limit: number, window: number) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    // Use Upstash Redis for production
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window} s`),
      analytics: true,
    });
  } else {
    // Fallback to in-memory for development
    console.warn('Rate limiting using in-memory store (set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production)');
    return new MemoryRateLimiter(limit, window * 1000) as any;
  }
}

// Different rate limiters for different endpoints
export const apiRateLimiter = createRateLimiter(10, 60); // 10 requests per minute
export const shortUrlRateLimiter = createRateLimiter(5, 60); // 5 requests per minute (more restrictive)
export const generalRateLimiter = createRateLimiter(100, 60); // 100 requests per minute for general pages

// Helper to get client identifier for rate limiting
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwarded?.split(',')[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             'unknown';
  
  return ip;
}

// Helper to check rate limit
export async function checkRateLimit(
  limiter: any,
  identifier: string,
  path?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const key = path ? `${identifier}:${path}` : identifier;
  const result = await limiter.limit(key);
  
  // Convert reset from seconds to milliseconds if needed (Upstash returns seconds)
  const reset = typeof result.reset === 'number' 
    ? (result.reset < 1000000000000 ? result.reset * 1000 : result.reset) // If seconds, convert to ms
    : Date.now();
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset,
  };
}
