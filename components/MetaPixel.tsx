"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Meta (Facebook) Pixel, consent-gated for GDPR. It loads and fires ONLY after the
// visitor accepts marketing in the consent banner ("Accept all"), never before.
// - PageView on first load and on every client-side route change (this is an SPA,
//   so navigations don't reload the page; without this only the landing counts).
// - Lead is fired from the newsletter form on a successful signup (see lib/track).
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1058299643735868";
const CONSENT_KEY = "10am_consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

// Injects Meta's base code once, initialises the pixel, and fires the first
// PageView. Safe to call repeatedly; it no-ops after the first run.
function initPixel() {
  if (typeof window === "undefined" || window.fbq) return;
  /* eslint-disable */
  // prettier-ignore
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  // The IIFE defines window.fbq at runtime; re-read it through a typed reference
  // (TS narrowed the property to undefined via the guard above).
  const fbq = window.fbq as unknown as (...args: unknown[]) => void;
  fbq("init", PIXEL_ID);
  fbq("track", "PageView");
}

export default function MetaPixel() {
  const pathname = usePathname();

  // Load on mount if consent is already given, otherwise wait for the accept event.
  useEffect(() => {
    if (hasConsent()) {
      initPixel();
      return;
    }
    function onConsent(e: Event) {
      if ((e as CustomEvent).detail === "accepted") initPixel();
    }
    window.addEventListener("consent-changed", onConsent);
    return () => window.removeEventListener("consent-changed", onConsent);
  }, []);

  // Track subsequent client-side navigations as PageViews (once the pixel exists).
  useEffect(() => {
    if (window.fbq) window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
