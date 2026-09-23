"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FlodeskForm from "./FlodeskForm";
import { trackLead } from "@/lib/track";

// The wall shown in place of Travel / Culture until the reader subscribes. The
// signup runs through the native Flodesk form (so the opt-in + welcome fire); we
// watch that form for its success state, then set the `nl_ok` cookie the server
// checks and refresh to unlock the content. Unlock is optimistic — the reader
// still confirms via the opt-in email to complete their subscription.
export default function NewsletterGate({ section }: { section: string }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const lower = section.toLowerCase();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let done = false;
    const check = () => {
      if (done) return;
      const success = el.querySelector('[data-ff-el="success"]') as HTMLElement | null;
      const root = el.querySelector('[data-ff-el="root"]');
      const isSuccess =
        (success && success.offsetParent !== null) ||
        root?.getAttribute("data-ff-stage") === "success";
      if (isSuccess) {
        done = true;
        obs.disconnect();
        trackLead();
        // Unlock: the gate reads this cookie server-side (see lib/newsletter-gate).
        document.cookie = `nl_ok=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        setTimeout(() => router.refresh(), 2500);
      }
    };
    const obs = new MutationObserver(check);
    obs.observe(el, { subtree: true, childList: true, attributes: true });
    return () => obs.disconnect();
  }, [router]);

  return (
    <section className="nl-gate">
      <div className="nl-gate-inner">
        <div className="overlay-eyebrow">members only</div>
        <h1 className="nl-gate-title">
          <em>
            The {section} edit
            <br />
            is for members.
          </em>
        </h1>
        <p className="nl-gate-copy">
          Our {lower} edit, the places we return to and the addresses we keep close, is reserved for
          the 10am list. Add your email to unlock it. It is free, and the monthly letter comes with
          it.
        </p>
        <div ref={wrapRef} className="nl-gate-fdform">
          <FlodeskForm />
        </div>
      </div>
    </section>
  );
}
