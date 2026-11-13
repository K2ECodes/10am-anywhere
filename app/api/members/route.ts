import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { MEMBER_COOKIE, MEMBER_COOKIE_OPTIONS } from "@/lib/member-cookie";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Flodesk statuses that count as a member. "unconfirmed" has signed up but not
// yet clicked the opt-in email; they were let in on signup, so they stay in.
const MEMBER_STATUSES = new Set(["active", "unconfirmed"]);

async function flodeskStatus(email: string): Promise<string | null> {
  const key = process.env.FLODESK_API_KEY;
  if (!key) return null;
  // Flodesk looks a subscriber up by email only with the @ left as is.
  const r = await fetch(`https://api.flodesk.com/v1/subscribers/${encodeURIComponent(email).replace("%40", "@")}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${key}:`).toString("base64"),
      "User-Agent": "10am-anywhere (info@10amanywhere.com)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Flodesk lookup ${r.status}`);
  return ((await r.json()) as { status?: string }).status ?? null;
}

// Every newsletter form on the site calls this before Flodesk sees the email.
//   { email }               -> already a member? Unlock now, and Flodesk is never
//                              contacted, so no second opt-in or welcome email.
//   { email, joined: true } -> Flodesk just accepted a new signup: unlock.
export async function POST(request: Request) {
  let body: { email?: string; joined?: boolean; source?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ member: false }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ member: false }, { status: 400 });

  if (body.joined) {
    try {
      const supabase = getServerSupabase();
      await supabase?.from("newsletter_signups").insert({ email, source: body.source || "flodesk" });
    } catch {
      /* a record of the signup is nice to have, never a reason to keep them out */
    }
  } else {
    let status: string | null = null;
    try {
      status = await flodeskStatus(email);
    } catch (err) {
      // Flodesk unreachable: send them through the normal signup instead.
      console.error("[members] lookup failed:", err);
      return NextResponse.json({ member: false });
    }
    if (!status || !MEMBER_STATUSES.has(status)) return NextResponse.json({ member: false });
  }

  const res = NextResponse.json({ member: true });
  res.cookies.set(MEMBER_COOKIE, "1", MEMBER_COOKIE_OPTIONS);
  return res;
}
