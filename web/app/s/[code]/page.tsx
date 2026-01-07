"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import Skeleton from "@/components/Skeleton";

export default function ShortUrlRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const code = params.code as string;

  useEffect(() => {
    if (!code || code.length !== 12) {
      setError("Invalid short code");
      setLoading(false);
      return;
    }

    // The short code is the first 12 characters of the tournament ID
    // We'll look up tournaments that start with this code
    const lookupTournament = async () => {
      try {
        // Try to fetch from API first (in case we have a stored mapping)
        const apiResponse = await fetch(`/api/shorten?code=${encodeURIComponent(code)}`);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          if (data.url) {
            router.replace(data.url);
            return;
          }
        }

        // Fallback: Look up tournament by prefix using PostgREST
        // Since the code is the first 12 chars of the tournament ID, we can query for it
        const supabaseUrl = typeof window !== 'undefined' 
          ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
              ? `http://${window.location.hostname}:54321`
              : 'http://127.0.0.1:54321')
          : 'http://127.0.0.1:54321';
        
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
        
        // PostgREST supports pattern matching with 'like' operator
        // Format: event_fingerprint=like.pattern (use * for wildcard, but PostgREST uses %)
        // Actually, PostgREST uses 'like' with % wildcards, but we need to URL encode it
        const encodedPattern = encodeURIComponent(`${code}%`);
        const response = await fetch(
          `${supabaseUrl}/rest/v1/events?select=event_fingerprint&event_fingerprint=like.${encodedPattern}&limit=2`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length === 1) {
            // Exactly one match - use it
            const tournamentId = data[0].event_fingerprint;
            router.replace(`/tournaments/${tournamentId}?shared=true`);
            return;
          } else if (Array.isArray(data) && data.length > 1) {
            // Multiple matches - this shouldn't happen with 12 chars, but handle it
            // Use the first one that exactly starts with the code
            const exactMatch = data.find((item: any) => item.event_fingerprint?.startsWith(code));
            if (exactMatch) {
              router.replace(`/tournaments/${exactMatch.event_fingerprint}?shared=true`);
              return;
            }
          }
        }

        // If no exact match, try the code as-is (in case it's a full tournament ID that happens to be 12 chars)
        // Actually, tournament IDs are 64 chars, so this won't work
        // But we can try to use the code to find the tournament
        
        setError("Tournament not found. The link may be invalid or expired.");
        setLoading(false);
      } catch (err) {
        console.error("Error looking up tournament:", err);
        setError("Failed to load tournament");
        setLoading(false);
      }
    };

    lookupTournament();
  }, [code, router]);

  if (loading) {
    return (
      <Layout>
        <section className="py-20 md:py-28">
          <Container>
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/2" />
          </Container>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-20 md:py-28">
          <Container className="flex flex-col items-center justify-center">
            <p className="text-foreground font-medium text-lg">Tournament not found</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </Container>
        </section>
      </Layout>
    );
  }

  return null;
}
