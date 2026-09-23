"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "./types";
import { getBrowserSupabase } from "./supabase/client";

// Wishlist state. Persists to localStorage immediately (optimistic, works with
// no account) and writes through to Supabase when a session is present, so a
// signed-in reader's wishlist follows them across devices.

export interface WishlistEntry {
  slug: string;
  brand: string;
  name: string;
  image?: string;
  price: number;
  currency: string;
}

interface WishlistContextValue {
  items: WishlistEntry[];
  has: (slug: string) => boolean;
  toggle: (product: Product) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "10am_wishlist";

function toEntry(p: Product): WishlistEntry {
  return { slug: p.slug, brand: p.brand, name: p.name, image: p.image, price: p.price, currency: p.currency };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistEntry[]>([]);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist to localStorage on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  // When a session is present, load the wishlist from Supabase so it follows the
  // user across tabs and devices (previously it only wrote through, never read
  // back). Runs on mount and whenever auth state changes (e.g. after magic-link
  // sign-in). Local-only items are merged up so pre-login adds aren't lost.
  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;

    async function loadFromSupabase() {
      const {
        data: { user },
      } = await supabase!.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase!
        .from("wishlists")
        .select("product_snapshot")
        .eq("user_id", user.id);
      if (!active || !data) return;
      const remote = data
        .map((r) => r.product_snapshot as WishlistEntry)
        .filter((e): e is WishlistEntry => Boolean(e && e.slug));
      setItems((prev) => {
        const bySlug = new Map<string, WishlistEntry>();
        for (const e of remote) bySlug.set(e.slug, e);
        for (const e of prev) {
          if (!bySlug.has(e.slug)) {
            bySlug.set(e.slug, e);
            void supabase!
              .from("wishlists")
              .upsert(
                { user_id: user.id, product_id: e.slug, product_snapshot: e },
                { onConflict: "user_id,product_id" }
              );
          }
        }
        return Array.from(bySlug.values());
      });
    }

    loadFromSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadFromSupabase();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const writeThrough = useCallback(
    async (entry: WishlistEntry, add: boolean) => {
      const supabase = getBrowserSupabase();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      if (add) {
        await supabase.from("wishlists").upsert(
          {
            user_id: user.id,
            product_id: entry.slug,
            product_snapshot: entry,
          },
          { onConflict: "user_id,product_id" }
        );
      } else {
        await supabase.from("wishlists").delete().match({ user_id: user.id, product_id: entry.slug });
      }
    },
    []
  );

  const toggle = useCallback(
    (product: Product) => {
      const entry = toEntry(product);
      setItems((prev) => {
        const exists = prev.some((i) => i.slug === entry.slug);
        void writeThrough(entry, !exists);
        return exists ? prev.filter((i) => i.slug !== entry.slug) : [entry, ...prev];
      });
    },
    [writeThrough]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      has: (slug) => items.some((i) => i.slug === slug),
      toggle,
      count: items.length,
    }),
    [items, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
