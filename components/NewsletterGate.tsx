"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FlodeskForm, { MEMBER_EVENT } from "./FlodeskForm";
import { trackLead } from "@/lib/track";

// The wall shown in place of Travel / Culture until the reader is a member. The
// Flodesk form handles both cases (see FlodeskForm): an email already on the list
// is let straight in with no new emails sent; a new one signs up through Flodesk's
// own opt-in and welcome. Either way the server sets the members cookie and the
// form fires MEMBER_EVENT, and we refresh so the content renders.
export default function NewsletterGate({ section }: { section: string }) {
  const router = useRouter();
  const lower = section.toLowerCase();

  useEffect(() => {
    const unlock = () => {
      trackLead();
      setTimeout(() => router.refresh(), 1200);
    };
    window.addEventListener(MEMBER_EVENT, unlock);
    return () => window.removeEventListener(MEMBER_EVENT, unlock);
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
          the 10am list. Add your email to unlock it. It is free, and the letter comes with it.
        </p>
        <p className="nl-gate-copy nl-gate-member">
          Already on the list? Enter the same email and you are straight in.
        </p>
        <div className="nl-gate-fdform">
          <FlodeskForm />
        </div>
      </div>
    </section>
  );
}
