import { cookies } from "next/headers";
import { getServerSupabase } from "@/lib/supabase/server";

export interface SubscribeResult {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS =
  "You are on the list. We have sent a note to your inbox to confirm. If you don't see it, please check your spam folder.";

// Core newsletter signup, shared by the server action (footer / popup) and the
// /api/subscribe route (used by the members gate so it can show a confirmation
// before unlocking). Records to Supabase, sends the Resend welcome (best effort),
// and sets the nl_ok cookie so Travel / Culture unlock.
export async function subscribeEmail(input: {
  email: string;
  name?: string | null;
  source?: string;
}): Promise<SubscribeResult> {
  const email = String(input.email ?? "").trim().toLowerCase();
  const name = (input.name ?? "").toString().trim() || null;
  const source = input.source || "site";

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email." };
  }

  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.from("newsletter_signups").insert({ email, name, source });
      if (error && error.code !== "23505") throw error; // 23505 = already subscribed, fine
    }
  } catch (err) {
    console.error("[newsletter] save failed:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  // Flodesk (the client's email platform): add the subscriber to the segment so
  // Flodesk's own welcome workflow fires and they are in the audience for every
  // future newsletter. Best-effort, and it must never fail the signup. When it
  // handles the subscriber, we skip the Resend welcome below to avoid a duplicate.
  let handledByFlodesk = false;
  const flodeskKey = process.env.FLODESK_API_KEY;
  const flodeskSegment = process.env.FLODESK_SEGMENT_ID;
  if (flodeskKey && flodeskSegment) {
    try {
      const headers = {
        // Flodesk uses HTTP Basic auth: API key as the username, empty password.
        Authorization: "Basic " + Buffer.from(`${flodeskKey}:`).toString("base64"),
        "Content-Type": "application/json",
        "User-Agent": "10am-anywhere (info@10amanywhere.com)",
      };
      // Upsert the subscriber (creates or updates by email). double_optin: true
      // makes Flodesk send its confirmation ("opt-in") email and hold the person
      // as "unconfirmed" until they click it; the welcome (a Flodesk workflow on
      // this segment) then fires once they confirm.
      const up = await fetch("https://api.flodesk.com/v1/subscribers", {
        method: "POST",
        headers,
        body: JSON.stringify({ email, double_optin: true, ...(name ? { first_name: name } : {}) }),
      });
      if (!up.ok) throw new Error(`Flodesk upsert ${up.status}: ${await up.text()}`);
      // The segment endpoint addresses the subscriber by ID (not email), so use
      // the id returned from the upsert. Adding to the segment is what enrols them
      // in the welcome workflow; with double opt-in it fires once they confirm.
      const created = (await up.json()) as { id?: string };
      if (created.id) {
        const seg = await fetch(`https://api.flodesk.com/v1/subscribers/${created.id}/segments`, {
          method: "POST",
          headers,
          body: JSON.stringify({ segment_ids: [flodeskSegment] }),
        });
        if (!seg.ok) throw new Error(`Flodesk segment ${seg.status}: ${await seg.text()}`);
      }
      handledByFlodesk = true;
    } catch (err) {
      console.error("[newsletter] Flodesk sync failed:", err);
    }
  }

  // Fallback welcome email via Resend, only when Flodesk is not configured/handling
  // it. Best-effort and must never fail the signup.
  try {
    if (!handledByFlodesk && process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.NEWSLETTER_FROM,
        to: email,
        subject: "Welcome to the 10am letter",
        text: "Thank you for joining 10am. A monthly letter, delivered at 10am CEST.",
      });
    }
  } catch (err) {
    console.error("[newsletter] welcome email skipped:", err);
  }

  cookies().set("nl_ok", "1", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });

  return { ok: true, message: SUCCESS };
}
