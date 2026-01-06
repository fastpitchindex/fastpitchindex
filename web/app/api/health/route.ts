import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { error } = await supabase.auth.getSession();
  return NextResponse.json({
    ok: !error,
    service: 'supabase',
    error: error?.message ?? null,
  });
}
