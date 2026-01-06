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
let clientInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  // Only create client on client side
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used on the client side');
  }
  
  if (!clientInstance) {
    const supabaseUrl = getSupabaseUrl();
    console.log('Creating Supabase client with URL:', supabaseUrl);
    
    // Test connection first
    fetch(`${supabaseUrl}/rest/v1/events?select=event_fingerprint&limit=1`)
      .then((res) => {
        if (res.ok) {
          console.log('Supabase connection test passed');
        } else {
          console.warn('Supabase connection test returned status:', res.status);
        }
      })
      .catch((err) => {
        console.error('Supabase connection test failed:', err);
      });
    
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return clientInstance;
}

// Export the client as a getter that creates it lazily
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
