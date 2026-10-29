import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { engineToken } from "@/lib/engine/auth";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Refreshes the Supabase auth session on navigation so server components see a
// current user. No-op when Supabase is not configured.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The 10am Engine (/engine) is private: one shared team password, set as
  // ENGINE_PASSWORD on Vercel. The cookie holds a hash of it, never the password.
  if (pathname.startsWith("/engine") || pathname.startsWith("/api/engine")) {
    const open = pathname === "/engine/login" || pathname === "/api/engine/login";
    if (!open && request.cookies.get("engine_auth")?.value !== (await engineToken())) {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
      return NextResponse.redirect(new URL("/engine/login", request.url));
    }
    // Lets the root layout drop the public site chrome on engine pages.
    const headers = new Headers(request.headers);
    headers.set("x-engine", "1");
    return NextResponse.next({ request: { headers } });
  }

  if (!url || !anonKey) return NextResponse.next();

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Run on pages, skip static assets and the affiliate redirect.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts|go).*)"],
};
