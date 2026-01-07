import { createClient } from '@supabase/supabase-js';

// For local development, use the computer's IP address when accessed from network
// This allows mobile devices on the same network to connect
function getSupabaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl) return envUrl;
  
  // In browser, check if we're accessing from a network IP
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via IP address (not localhost), use that IP for Supabase
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const url = `http://${hostname}:54321`;
      console.log('Using Supabase URL for network access:', url);
      return url;
    }
  }
  
  // Default to localhost for server-side or localhost access
  return 'http://127.0.0.1:54321';
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Create a function to get the client - this ensures URL is determined at access time, not module load time
// Don't cache the client instance - recreate it each time to ensure we get the correct URL
// This is important for mobile devices that might have different hostnames
function getSupabaseClient() {
  // Only create client on client side
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used on the client side');
  }
  
  const supabaseUrl = getSupabaseUrl();
  console.log('Creating Supabase client with URL:', supabaseUrl);
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Cache client per URL to avoid recreating unnecessarily
// But allow different URLs for different hostnames (desktop vs mobile)
const clientCache = new Map<string, ReturnType<typeof createClient>>();

// Export the client as a getter that creates it lazily
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    try {
      const supabaseUrl = getSupabaseUrl();
      
      // Get or create client for this URL
      if (!clientCache.has(supabaseUrl)) {
        console.log('Creating new Supabase client for URL:', supabaseUrl);
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Don't automatically sign out on token refresh failures
            // We'll handle sign out explicitly in the auth context
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          },
        });
        clientCache.set(supabaseUrl, client);
      }
      
      const client = clientCache.get(supabaseUrl)!;
      const value = client[prop as keyof typeof client];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    } catch (err) {
      console.error('Error getting Supabase client:', err);
      throw err;
    }
  },
});
