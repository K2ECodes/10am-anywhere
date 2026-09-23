"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Google Analytics 4, consent-gated for GDPR. gtag.js loads and fires ONLY after
// the visitor accepts marketing/analytics in the consent banner ("Accept all"),
// never before. Fires page_view on first load and on every client-side route
// change (this is an SPA, so navigations don't reload the page).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-0KTQ86N362";
const CONSENT_KEY = "10am_consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

// Injects gtag.js once and configures the property. send_page_view:false so we
// control page_view ourselves (the effect below fires it, including on load).
function initGA() {
  if (typeof window === "undefined" || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  /* eslint-disable prefer-rest-params */
  window.gtag = function gtag() {
    (window.dataLayer as unknown[]).push(arguments);
  };
  /* eslint-enable prefer-rest-params */
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Load on mount if consent is already given, otherwise wait for the accept event.
  useEffect(() => {
    if (hasConsent()) {
      initGA();
      return;
    }
    function onConsent(e: Event) {
      if ((e as CustomEvent).detail === "accepted") initGA();
    }
    window.addEventListener("consent-changed", onConsent);
    return () => window.removeEventListener("consent-changed", onConsent);
  }, []);

  // Track each page (first load + client-side navigations), once GA has loaded.
  useEffect(() => {
    if (window.gtag) window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
