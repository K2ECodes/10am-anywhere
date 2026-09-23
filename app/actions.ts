"use server";

import { subscribeEmail, type SubscribeResult } from "@/lib/subscribe";

export type NewsletterState = SubscribeResult;

// Server action used by the footer + popup newsletter forms (useFormState).
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  return subscribeEmail({
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? "") || null,
    source: String(formData.get("source") ?? "footer"),
  });
}
