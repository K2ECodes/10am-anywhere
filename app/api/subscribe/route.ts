import { NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/subscribe";

export const runtime = "nodejs";

// Newsletter signup via fetch (used by the members gate). Unlike the server
// action, this does NOT auto-revalidate the route, so the gate can show a
// confirmation before manually refreshing to unlock the content.
export async function POST(request: Request) {
  let body: { email?: string; name?: string; source?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Please enter a valid email." }, { status: 400 });
  }
  const result = await subscribeEmail({
    email: body.email ?? "",
    name: body.name ?? null,
    source: body.source ?? "gate",
  });
  return NextResponse.json(result);
}
