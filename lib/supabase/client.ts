"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseEnabled = Boolean(url && anonKey);

// Browser client for client components (auth widgets, wishlist). Null when
// Supabase is not configured; wishlist falls back to localStorage in that case.
export function getBrowserSupabase() {
  if (!supabaseEnabled) return null;
  return createBrowserClient(url, anonKey);
}
