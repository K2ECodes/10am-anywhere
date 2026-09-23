import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getProductBySlug } from "@/lib/content";
import { getServerSupabase } from "@/lib/supabase/server";

// Affiliate redirect + first-party click log. Every product card points here
// instead of at the raw affiliate URL, so 10am owns its click data independent
// of any single network (10am_build_context.md section 8).

export const runtime = "nodejs"; // can move to "edge" once verified on Vercel

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const product = await getProductBySlug(params.slug);

  // Unknown slug: send the visitor home rather than to a dead end.
  if (!product) {
    return NextResponse.redirect(new URL("/", _request.url), 302);
  }

  // Destination: the affiliate link, else the raw product link, else home (so a
  // product without any link sends the visitor home instead of erroring).
  const dest = product.affiliateUrl || product.sourceUrl;
  if (!dest) {
    return NextResponse.redirect(new URL("/", _request.url), 302);
  }

  const h = headers();
  const cookieStore = cookies();

  // Stable anonymous session id for de-duplicating clicks.
  let sessionId = cookieStore.get("10am_sid")?.value;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = crypto.randomUUID();

  // Best-effort log; never block or fail the redirect on a logging error.
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("clicks").insert({
        product_id: product.slug,
        user_id: user?.id ?? null,
        session_id: sessionId,
        referrer_page: h.get("referer"),
        network: product.network,
        affiliate_url: dest,
        user_agent: h.get("user-agent"),
        ip_country: h.get("x-vercel-ip-country"),
      });
    }
  } catch (err) {
    console.error("[/go] click log failed:", err);
  }

  const res = NextResponse.redirect(dest, 302);
  if (isNewSession) {
    res.cookies.set("10am_sid", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return res;
}
