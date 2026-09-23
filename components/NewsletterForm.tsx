"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions";
import { trackLead } from "@/lib/track";

const initial: NewsletterState = { ok: false, message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="nl-submit" type="submit" disabled={pending}>
      {pending ? "One moment…" : "Subscribe to 10am"}
    </button>
  );
}

// The full newsletter form inside the membership overlay.
export default function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeNewsletter, initial);
  // Fire the Meta Pixel Lead (conversion) once, on a successful signup.
  useEffect(() => {
    if (state.ok) trackLead();
  }, [state.ok]);
  return (
    <form className="nl-form" action={formAction}>
      <label htmlFor="nl-name">Name</label>
      <input id="nl-name" name="name" type="text" placeholder="Your name" />
      <label htmlFor="nl-email">Email</label>
      <input id="nl-email" name="email" type="email" placeholder="you@somewhere.com" required />
      <input type="hidden" name="source" value="homepage popup" />
      <Submit />
      {state.ok ? (
        <p className="nl-success" role="status">✓ {state.message}</p>
      ) : (
        <p className="nl-fineprint" role="status">
          {state.message
            ? state.message
            : "By subscribing you agree to receive the 10am letter. Unsubscribe at the bottom of any letter. We never share your address."}
        </p>
      )}
    </form>
  );
}
