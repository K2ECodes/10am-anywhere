import { NextResponse } from "next/server";
import { engineToken } from "@/lib/engine/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const ok = Boolean(process.env.ENGINE_PASSWORD) && form.get("password") === process.env.ENGINE_PASSWORD;
  const res = NextResponse.redirect(new URL(ok ? "/engine" : "/engine/login?wrong=1", req.url), 303);
  if (ok) {
    res.cookies.set("engine_auth", await engineToken(), {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
