import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// True once the client has created a Supabase project and set the env vars.
export const supabaseEnabled = Boolean(url && anonKey);

// Server-side client bound to the request cookies (auth, wishlist, clicks).
// Returns null when Supabase is not configured so callers can degrade gracefully.
export function getServerSupabase() {
  if (!supabaseEnabled) return null;
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render; safe to ignore (middleware refreshes).
        }
      },
    },
  });
}
