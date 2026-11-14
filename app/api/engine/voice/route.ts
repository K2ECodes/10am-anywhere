import { NextResponse } from "next/server";
import { SILKE_VOICE_ID, DELIVERY, MAX_CHARS, type Delivery } from "@/lib/engine/voice-clone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Speaks a line in Silke's cloned voice (HeyGen Voice instant clone, made from her
// own recordings). Returns a WAV the team can play, download and drop into a reel.
// Behind the engine password (middleware); the HeyGen key never leaves the server.
export async function POST(req: Request) {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) return NextResponse.json({ error: "voice_offline" }, { status: 503 });

  const { text, delivery } = (await req.json().catch(() => ({}))) as { text?: string; delivery?: Delivery };
  // House style: no long dashes; the voice reads commas and full stops as its pauses.
  const line = (text ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim();
  if (!line) return NextResponse.json({ error: "Write a line first." }, { status: 400 });
  if (line.length > MAX_CHARS) return NextResponse.json({ error: `Keep it under ${MAX_CHARS} characters.` }, { status: 400 });

  const res = await fetch("https://api.heygen.com/v3/models/audio/tts", {
    method: "POST",
    headers: { "X-Api-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.HEYGEN_TTS_MODEL || "heygen-voice-1-turbo-free",
      voice_id: process.env.HEYGEN_SILKE_VOICE_ID || SILKE_VOICE_ID,
      text: line,
      language: "en",
      expressiveness_boost: DELIVERY[delivery ?? "natural"]?.boost ?? DELIVERY.natural.boost,
    }),
    signal: AbortSignal.timeout(50_000),
  }).catch(() => null);
  const json = res ? ((await res.json().catch(() => ({}))) as { data?: { audio_url?: string }; error?: { message?: string } }) : {};
  const url = json.data?.audio_url;
  if (!res?.ok || !url) {
    console.error("voice tts failed", res?.status, json.error?.message);
    return NextResponse.json({ error: "The voice is busy. Try again in a moment." }, { status: 502 });
  }
  const audio = await fetch(url).catch(() => null);
  if (!audio?.ok) return NextResponse.json({ error: "The voice is busy. Try again in a moment." }, { status: 502 });
  return new NextResponse(await audio.arrayBuffer(), {
    headers: { "content-type": "audio/wav", "cache-control": "no-store" },
  });
}
