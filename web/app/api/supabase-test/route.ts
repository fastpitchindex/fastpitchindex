import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.auth.getSession();
  return NextResponse.json({ ok: !error, error, session: data?.session ?? null });
}
