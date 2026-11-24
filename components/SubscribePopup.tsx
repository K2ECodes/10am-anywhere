"use client";

import { useEffect, useState } from "react";
import { Instrument_Sans } from "next/font/google";
import FlodeskForm, { MEMBER_EVENT } from "./FlodeskForm";

// The founders' popup, as designed (Subscriber Pop-ups 2): black panel, script
// headline, the three founders' photo (right on desktop, on top on mobile).
const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// Shown once per visit (session), 3s after the site opens, to visitors who are
// not yet members. Becoming one anywhere sets the `nl_ok` cookie, which both
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

  // Once they are recognised or signed up, let them read the confirmation, then close.
  useEffect(() => {
    const done = () => setTimeout(() => setOpen(false), 2500);
    window.addEventListener(MEMBER_EVENT, done);
    return () => window.removeEventListener(MEMBER_EVENT, done);
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
      aria-labelledby="subpop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className={`subpop-panel ${sans.className}`}>
        <button className="subpop-close" onClick={() => setOpen(false)} aria-label="Close">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>
        <figure className="subpop-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/founders-popup.jpg" alt="The three founders of 10am" width={1178} height={1718} />
        </figure>
        <div className="subpop-copy">
          <div className="subpop-eyebrow">From the founders</div>
          <h2 className="subpop-title" id="subpop-title">
            Some things we only
            <br />
            share with friends.
          </h2>
          <p className="subpop-text">
            Your inside track to a world of style, travel and culture. Discover our latest finds, favourite places,
            inspiring people and things worth knowing – with exclusive content and recommendations reserved for the
            10am community.
          </p>
          <div className="subpop-form">
            <FlodeskForm emailOnly submitLabel="Count me in" emailPlaceholder="Your email address" />
          </div>
          <p className="subpop-sign">With love, Alexandra, Corinna and Silke</p>
          <p className="subpop-small">Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}
