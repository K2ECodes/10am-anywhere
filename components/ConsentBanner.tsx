"use client";

import { useEffect, useState } from "react";

// Minimal GDPR consent banner: analytics/marketing stay off until accepted, the
// choice is remembered, and it can be reopened from the footer ("Cookies").
// A drop-in for Klaro; swap in Klaro later if granular categories are needed.
const KEY = "10am_consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(KEY));
    function reopen() {
      setVisible(true);
    }
    window.addEventListener("open-consent", reopen);
    return () => window.removeEventListener("open-consent", reopen);
  }, []);

  function choose(value: "accepted" | "declined") {
    localStorage.setItem(KEY, value);
    // Let marketing scripts (e.g. the Meta Pixel) start immediately on accept,
    // without a page reload.
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="consent" role="dialog" aria-label="Cookie preferences">
      <p>
        We use essential cookies to run the site. Analytics and marketing stay off until you say
        yes. You can change this any time from the footer.
      </p>
      <div className="consent-actions">
        <button type="button" className="decline" onClick={() => choose("declined")}>
          Essential only
        </button>
        <button type="button" className="accept" onClick={() => choose("accepted")}>
          Accept all
        </button>
      </div>
    </div>
  );
}
