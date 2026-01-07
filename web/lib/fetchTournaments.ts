// Using direct fetch instead of Supabase client to avoid CORS issues on mobile
// Helper to get Supabase URL
function getSupabaseUrl(): string {
  if (typeof window === 'undefined') return 'http://127.0.0.1:54321';
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:54321`;
  }
  return 'http://127.0.0.1:54321';
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Helper to make direct fetch calls to Supabase (bypasses CORS issues with the client)
async function fetchFromSupabase(endpoint: string, params: Record<string, string> = {}) {
  const baseUrl = getSupabaseUrl();
  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}/rest/v1/${endpoint}${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Handle 404 (not found) gracefully - return empty array instead of throwing
  if (response.status === 404) {
    return [];
  }
  
  // Handle other errors
  if (!response.ok) {
    // Don't throw errors for client errors (4xx) that aren't auth-related
    // These are expected for invalid IDs
    if (response.status >= 400 && response.status < 500 && response.status !== 401 && response.status !== 403) {
      return [];
    }
    const errorText = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

// Fetch zip code coordinates from Supabase
export async function fetchZipCodeCoordinates(zip: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const normalizedZip = zip.replace(/\D/g, '').padStart(5, '0').substring(0, 5);
    if (normalizedZip.length !== 5) return null;
    
    const baseUrl = getSupabaseUrl();
    const url = `${baseUrl}/rest/v1/zip_codes?select=latitude,longitude&zip=eq.${normalizedZip}&limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const row = data[0];
      if (typeof row.latitude === 'number' && typeof row.longitude === 'number') {
        return { lat: row.latitude, lon: row.longitude };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching zip code coordinates:', error);
    return null;
  }
}

export type DbEventRow = {
  event_fingerprint: string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  season_year: number | null;
  season_name: string | null;
  event_url: string;
  site_slug: string;
  updated_at?: string | null;
  event_divisions?: DivisionRow[] | null;
};

export type DivisionRow = {
  division_fingerprint: string;
  event_fingerprint: string;
  age: string | null;
  level: string | null;
  entry_fee: number | null;
  gate_fee: number | null;
  pay_at_plate_fee: number | null;
  games_guaranteed: number | null;
  registration_status: string | null;
  payload?: Record<string, unknown> | null;
};

export type EventRow = {
  event_id: string;
  event_name: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  state: string | null;
  latitude?: number | null;
  longitude?: number | null;
  divisions?: Array<string | number | { division?: string | null; division_age?: string | null; age?: string | null; level?: string | null }>;
  division_rows?: DivisionRow[];
  entry_fee?: number;
  org_name?: string;
  sanction?: string;
  division_levels?: string[] | null;
  description?: string | null;
  location?: string | null;
  source_url?: string | null;
  registration_deadline?: string | null;
  games_guaranteed?: string | null;
  updated_at?: string | null;
};

function mapDbEvent(row: DbEventRow): EventRow {
  const divisions = Array.isArray(row.event_divisions) ? row.event_divisions : [];
  const divisionLabels: Array<{ division?: string | null; division_age?: string | null; age?: string | null; level?: string | null }> = divisions.map((d) => {
    const label = d.age ? (d.level ? `${d.age} ${d.level}` : d.age) : null;
    return {
      division: label,
      division_age: d.age ?? null,
      age: d.age ?? null,
      level: d.level ?? null,
    };
  });

  const levelSet = new Set<string>();
  const feeValues: number[] = [];
  const gameValues: number[] = [];

  divisions.forEach((d) => {
    if (d.level) levelSet.add(String(d.level));
    if (typeof d.entry_fee === "number") feeValues.push(d.entry_fee);
    if (typeof d.games_guaranteed === "number") gameValues.push(d.games_guaranteed);
  });

  const entryFee = feeValues.length ? Math.min(...feeValues) : undefined;
  const gameUnique = Array.from(new Set(gameValues));
  const gamesGuaranteed =
    gameUnique.length === 0 ? undefined : gameUnique.length === 1 ? String(gameUnique[0]) : "Varies";

  return {
    event_id: row.event_fingerprint,
    event_name: row.name ?? "Tournament",
    start_date: row.start_date,
    end_date: row.end_date,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    divisions: divisionLabels,
    division_rows: divisions,
    entry_fee: entryFee,
    division_levels: Array.from(levelSet),
    source_url: row.event_url,
    games_guaranteed: gamesGuaranteed,
    updated_at: row.updated_at ?? undefined,
  };
}

export async function fetchTournaments(options: { isPro?: boolean } = {}): Promise<{
  items: EventRow[];
  hiddenItems: EventRow[];
  error: string | null;
}> {
  try {
    // For free users, filter by date range at the database level to match search_events function
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const freeCutoff = new Date(today);
    freeCutoff.setDate(today.getDate() + 45);
    const freeStart = new Date(today);
    freeStart.setDate(today.getDate() - 2);

    // Build query parameters for direct fetch using PostgREST syntax
    const selectFields = 'event_fingerprint,name,start_date,end_date,city,state,latitude,longitude,season_year,season_name,event_url,site_slug,updated_at';
    
    // For free users, we need to fetch both visible events (within 45 days) and hidden events (beyond 45 days)
    // For pro users, fetch all events
    let visibleEventsData: DbEventRow[] = [];
    let hiddenEventsData: DbEventRow[] = [];
    
    if (!options.isPro) {
      // Fetch visible events (within 45-day window)
      const startDateStr = freeStart.toISOString().split("T")[0];
      const endDateStr = freeCutoff.toISOString().split("T")[0];
      const visibleUrl = `${getSupabaseUrl()}/rest/v1/events?select=${selectFields}&start_date=gte.${startDateStr}&start_date=lte.${endDateStr}&order=start_date.asc`;
      
      // Fetch hidden events (beyond 45-day window) - just need count, so we can use a simpler query
      const hiddenUrl = `${getSupabaseUrl()}/rest/v1/events?select=${selectFields}&start_date=gt.${endDateStr}&order=start_date.asc`;
      
      try {
        // Fetch visible events
        const visibleResponse = await fetch(visibleUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!visibleResponse.ok) {
          const errorText = await visibleResponse.text();
          throw new Error(`Supabase request failed: ${visibleResponse.status} ${visibleResponse.statusText} - ${errorText}`);
        }
        
        visibleEventsData = await visibleResponse.json();
        
        // Fetch hidden events (for count)
        const hiddenResponse = await fetch(hiddenUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (hiddenResponse.ok) {
          hiddenEventsData = await hiddenResponse.json();
        }
      } catch (fetchError) {
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error("Supabase fetch error:", errorMsg);
        return {
          items: [],
          hiddenItems: [],
          error: errorMsg,
        };
      }
    } else {
      // Pro users: fetch all events
      const allUrl = `${getSupabaseUrl()}/rest/v1/events?select=${selectFields}&order=start_date.asc`;
      
      try {
        const response = await fetch(allUrl, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Supabase request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        visibleEventsData = await response.json();
      } catch (fetchError) {
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error("Supabase fetch error:", errorMsg);
        return {
          items: [],
          hiddenItems: [],
          error: errorMsg,
        };
      }
    }
    
    const eventsData = visibleEventsData;

    if (!eventsData || !Array.isArray(eventsData)) {
      console.log("No events data returned from query");
      return { items: [], hiddenItems: [], error: null };
    }

    // Fetch divisions separately to avoid nested select issues
    let divisionsByEvent = new Map<string, DivisionRow[]>();
    
    // Combine visible and hidden events for division fetching
    const allEventsForDivisions = [...eventsData, ...hiddenEventsData];
    
    if (allEventsForDivisions.length > 0) {
      const eventFingerprints = allEventsForDivisions.map(e => e.event_fingerprint);
      
      // Fetch divisions using direct fetch - PostgREST 'in' syntax
      try {
        // PostgREST 'in' operator syntax
        const divisionsParams: Record<string, string> = {
          select: '*',
          event_fingerprint: `in.(${eventFingerprints.join(',')})`,
        };
        const divisionsData = await fetchFromSupabase('event_divisions', divisionsParams);
        
        if (divisionsData && Array.isArray(divisionsData)) {
          // Group divisions by event_fingerprint
          divisionsData.forEach((div) => {
            if (!divisionsByEvent.has(div.event_fingerprint)) {
              divisionsByEvent.set(div.event_fingerprint, []);
            }
            divisionsByEvent.get(div.event_fingerprint)!.push(div);
          });
        }
      } catch (divisionsError) {
        console.error("Error fetching divisions:", divisionsError);
        // Continue without divisions rather than failing completely
      }
    }

    // Map visible events to EventRow format
    const visibleEvents = eventsData.map((row) => {
      const divisions = divisionsByEvent.get(row.event_fingerprint) || [];
      return mapDbEvent({ ...row, event_divisions: divisions } as DbEventRow);
    });
    
    // Map hidden events to EventRow format (for count)
    const hiddenEvents = hiddenEventsData.map((row) => {
      const divisions = divisionsByEvent.get(row.event_fingerprint) || [];
      return mapDbEvent({ ...row, event_divisions: divisions } as DbEventRow);
    });
    
    return {
      items: visibleEvents,
      hiddenItems: options.isPro ? [] : hiddenEvents,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in fetchTournaments:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
      ? error
      : JSON.stringify(error);
    
    // Check if it's a network error
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const supabaseUrl = typeof window !== 'undefined' 
        ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
          ? `http://${window.location.hostname}:54321`
          : 'http://127.0.0.1:54321')
        : 'http://127.0.0.1:54321';
      return {
        items: [],
        hiddenItems: [],
        error: `Network error: Unable to connect to Supabase at ${supabaseUrl}. Please check that Supabase is running and accessible from your network.`,
      };
    }
    
    return {
      items: [],
      hiddenItems: [],
      error: `Failed to fetch tournaments: ${errorMessage}`,
    };
  }
}

export async function fetchTournamentById(eventId: string): Promise<{
  event: EventRow | null;
  error: string | null;
}> {
  try {
    // Fetch event by ID - this bypasses date restrictions to allow shared tournament links
    // Anyone with the direct link can view the tournament details, even if outside the free tier window
    const params: Record<string, string> = {
      select: 'event_fingerprint,name,start_date,end_date,city,state,latitude,longitude,season_year,season_name,event_url,site_slug,updated_at',
      event_fingerprint: `eq.${eventId}`,
      limit: '1',
    };
    
    const eventDataArray = await fetchFromSupabase('events', params);
    
    if (!eventDataArray || !Array.isArray(eventDataArray) || eventDataArray.length === 0) {
      return { event: null, error: null };
    }
    
    const eventData = eventDataArray[0] as DbEventRow;
    
    // Fetch divisions for this event
    let divisions: DivisionRow[] = [];
    try {
      const divisionsParams: Record<string, string> = {
        select: '*',
        event_fingerprint: `eq.${eventId}`,
      };
      const divisionsData = await fetchFromSupabase('event_divisions', divisionsParams);
      if (divisionsData && Array.isArray(divisionsData)) {
        divisions = divisionsData;
      }
    } catch (divisionsError) {
      console.error("Error fetching divisions:", divisionsError);
      // Continue without divisions
    }
    
    const event = mapDbEvent({ ...eventData, event_divisions: divisions } as DbEventRow);
    return { event, error: null };
  } catch (error) {
    return {
      event: null,
      error: error instanceof Error ? error.message : "Failed to fetch tournament",
    };
  }
}
