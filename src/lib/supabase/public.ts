import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cookie-less anon client for cached public reads (Server Components wrapped in
 * `unstable_cache`, sitemap, metadata). No session — RLS `select` policies for
 * the `anon` role decide visibility. Safe to construct at module scope.
 */
export const supabasePublic = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key-not-set",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
