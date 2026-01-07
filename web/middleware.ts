import { NextRequest, NextResponse } from 'next/server';
import { getClientIdentifier, generalRateLimiter, checkRateLimit } from './lib/rateLimit';

// Paths that should be rate limited
const rateLimitedPaths = [
  '/api/',
  '/tournaments',
  '/login',
  '/signup',
  '/contact',
];

// Paths that should be excluded from rate limiting (static assets, etc.)
const excludedPaths = [
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/logo.png',
  '/api/health', // Health check endpoint
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for excluded paths
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Only rate limit specific paths
  const shouldRateLimit = rateLimitedPaths.some(path => pathname.startsWith(path));
  
  if (shouldRateLimit) {
    const identifier = getClientIdentifier(request);
    const result = await checkRateLimit(generalRateLimiter, identifier, pathname);

    if (!result.success) {
      // Rate limit exceeded
      const response = NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
      response.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000).toString());

      return response;
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
