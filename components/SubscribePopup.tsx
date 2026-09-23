"use client";

import { useEffect, useState } from "react";
import FlodeskForm from "./FlodeskForm";

// Shown once per visit (session), 3s after the site opens, to visitors who have
// not yet subscribed. Subscribing anywhere sets the `nl_ok` cookie, which both
// suppresses this popup and unlocks the members-only Travel / Culture sections.
const SESSION_KEY = "10am_sub_popup_shown";
const DELAY_MS = 3000;

function isSubscribed() {
  return typeof document !== "undefined" && document.cookie.includes("nl_ok=1");
}

export default function SubscribePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isSubscribed()) return;
    // Only nag once per visit, not on every client-side navigation.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      /* private mode: fall through and just show it */
    }
    const t = setTimeout(() => {
      // They may have subscribed via the nav in those 3 seconds.
      if (isSubscribed()) return;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", open);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className={`overlay subpop${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Join the 10am Club"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="overlay-panel">
        <button className="overlay-close" onClick={() => setOpen(false)} aria-label="Close">
          Close ×
        </button>
        <div className="overlay-eyebrow">the 10am club</div>
        <h2 className="overlay-title">
          <em>Welcome to the 10am Club.</em>
        </h2>
        <p className="subpop-line">Join for curated pieces and luxe recommendations.</p>
        <FlodeskForm />
      </div>
    </div>
  );
}
