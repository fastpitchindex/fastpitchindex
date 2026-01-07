# Rate Limiting Setup

This application implements server-side rate limiting to protect against abuse and scraping.

## How It Works

Rate limiting is implemented using:
- **Next.js Middleware** - Applies rate limiting globally to specific paths
- **Upstash Redis** (production) - Distributed rate limiting that works across serverless functions
- **In-memory store** (development) - Fallback for local development

## Rate Limits

- **General pages** (`/tournaments`, `/login`, `/signup`, `/contact`): 100 requests per minute
- **API endpoints** (`/api/*`): 10 requests per minute
- **Short URL creation** (`/api/shorten`): 5 requests per minute

## Setup for Production

1. **Create an Upstash Redis database**:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a new Redis database
   - Copy the REST URL and REST Token

2. **Add environment variables**:
   ```env
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

3. **Deploy** - The rate limiting will automatically use Redis in production.

## Development

In development (without Redis), rate limiting uses an in-memory store. This works fine for local testing but won't persist across server restarts.

## Rate Limit Headers

Responses include these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the rate limit resets (ISO timestamp)
- `Retry-After`: Seconds until retry is allowed (on 429 responses)

## Customization

To adjust rate limits, edit `web/lib/rateLimit.ts`:

```typescript
export const apiRateLimiter = createRateLimiter(10, 60); // 10 requests per 60 seconds
export const shortUrlRateLimiter = createRateLimiter(5, 60); // 5 requests per 60 seconds
export const generalRateLimiter = createRateLimiter(100, 60); // 100 requests per 60 seconds
```

To add/remove rate-limited paths, edit `web/middleware.ts`:

```typescript
const rateLimitedPaths = [
  '/api/',
  '/tournaments',
  '/login',
  '/signup',
  '/contact',
];
```

## Blocking Bots

Rate limiting works alongside `robots.txt` to prevent scraping:
- `robots.txt` tells legitimate bots what they can access
- Rate limiting enforces limits on all requests (including bots that ignore robots.txt)

For additional bot protection, consider:
- Cloudflare Bot Management
- IP-based blocking for known bot IPs
- CAPTCHA for suspicious traffic patterns
