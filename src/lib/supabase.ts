import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project URL & publishable/anon key
const DEFAULT_SUPABASE_URL = 'https://wydjticoyawzdkvykekd.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_tTMAMDOr2G7CpE_7VR-npQ_Z7WNGVvo';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  // Priority: SUPABASE_SERVICE_ROLE_KEY (backend superuser bypass), then SUPABASE_ANON_KEY / PUBLISHABLE_KEY
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return client;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabase());
}
