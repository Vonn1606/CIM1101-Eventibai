import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Returns a Supabase client with admin (service-role) privileges if
 * SUPABASE_SERVICE_ROLE_KEY is set in the environment.
 * If not set, returns null so callers can fall back gracefully.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return null;
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
