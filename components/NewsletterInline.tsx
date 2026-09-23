"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions";

const initial: NewsletterState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "…" : "Join →"}</button>;
}

// The compact footer newsletter field.
export default function NewsletterInline() {
  const [state, formAction] = useFormState(subscribeNewsletter, initial);
  return (
    <form className="footer-nl-form" action={formAction}>
      <input type="email" name="email" placeholder="your email" aria-label="Email" required />
      <input type="hidden" name="source" value="footer" />
      <SubmitButton />
      {state.message ? (
        <span className="footer-nl-msg" role="status">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
