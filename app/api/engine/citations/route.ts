import { NextResponse } from "next/server";
import { setCitation } from "@/lib/engine/store";

export const runtime = "nodejs";

const RESULTS = ["", "cited", "mentioned", "absent"];

export async function POST(req: Request) {
  const { key, value } = (await req.json()) as { key: string; value: string };
  if (!/^[a-z0-9-]+\|[a-z]+\|\d{4}-\d{2}$/.test(key) || !RESULTS.includes(value)) {
    return NextResponse.json({ error: "bad input" }, { status: 400 });
  }
  await setCitation(key, value);
  return NextResponse.json({ ok: true });
}
