import { NextRequest, NextResponse } from 'next/server';
import { getClientIdentifier, shortUrlRateLimiter, checkRateLimit } from '@/lib/rateLimit';

// Simple in-memory store for short URLs
// In production, you'd want to use a database
const shortUrlStore = new Map<string, string>();

// Generate a short code from tournament ID
function generateShortCode(tournamentId: string): string {
  // Use first 12 characters of the hash as short code
  // This should be unique enough for most cases
  return tournamentId.substring(0, 12);
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for short URL creation
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(shortUrlRateLimiter, identifier, 'shorten');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { tournamentId } = body;

    if (!tournamentId || typeof tournamentId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid tournament ID' },
        { status: 400 }
      );
    }

    const shortCode = generateShortCode(tournamentId);
    const fullUrl = `/tournaments/${tournamentId}?shared=true`;
    
    // Store the mapping
    shortUrlStore.set(shortCode, fullUrl);

    // Get the actual origin from headers to handle cases where nextUrl.origin is 0.0.0.0
    // Prefer the client-provided origin header, then check Host header, then fall back to nextUrl
    const clientOrigin = request.headers.get('x-requested-origin');
    const host = request.headers.get('host') || request.nextUrl.host;
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.nextUrl.protocol === 'https:' ? 'https' : 'http');
    
    // Use the client-provided origin if available (most reliable)
    // Otherwise use the host from headers if it's not 0.0.0.0
    // Finally fall back to nextUrl.origin
    let origin: string;
    if (clientOrigin) {
      origin = clientOrigin;
    } else if (host && host !== '0.0.0.0' && !host.includes('0.0.0.0')) {
      origin = `${protocol}://${host}`;
    } else {
      origin = request.nextUrl.origin;
      // If origin still contains 0.0.0.0, try to extract port and use localhost
      if (origin.includes('0.0.0.0')) {
        const port = request.nextUrl.port || (protocol === 'https' ? '443' : '80');
        origin = `${protocol}://localhost:${port}`;
      }
    }

    const shortUrl = `${origin}/s/${shortCode}`;

    return NextResponse.json({ shortUrl, code: shortCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

// Also support GET for retrieving the mapping (for debugging)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (code && shortUrlStore.has(code)) {
    return NextResponse.json({
      code,
      url: shortUrlStore.get(code),
    });
  }

  return NextResponse.json({ error: 'Code not found' }, { status: 404 });
}
