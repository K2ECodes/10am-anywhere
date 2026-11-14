"use client";

import { useState } from "react";
import { DELIVERY, MAX_CHARS, VOICES, type Delivery, type VoiceKey } from "@/lib/engine/voice-clone";

type Take = { id: number; text: string; delivery: Delivery; voice: VoiceKey; url: string };

const STARTERS = [
  "It's Christmas. Not the Olympics.",
  "One, keep your glass half full, ideally with a martini in it.",
  "Three rooms worth the trip this month, and one you can skip.",
];

const fileName = (v: string, t: string) =>
  v + "-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + ".wav";

export default function VoiceStudio() {
  const [text, setText] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("lively");
  const [voice, setVoice] = useState<VoiceKey>("silke");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [takes, setTakes] = useState<Take[]>([]);

  async function speak() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/engine/voice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, delivery, voice }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error === "voice_offline" ? "The voice is not switched on yet." : j.error ?? "Something went wrong.");
        return;
      }
      const url = URL.createObjectURL(await r.blob());
      setTakes((t) => [{ id: Date.now(), text: text.trim(), delivery, voice, url }, ...t]);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="eng-card eng-voice">
      <div className="eng-meta">Write a line</div>
      <textarea
        className="eng-note eng-voice-text"
        value={text}
        maxLength={MAX_CHARS}
        placeholder="December. Supposedly the most wonderful time of the year."
        onChange={(e) => setText(e.target.value)}
      />
      <div className="eng-voice-starters">
        {STARTERS.map((s) => (
          <button key={s} type="button" onClick={() => setText(s)}>{s}</button>
        ))}
      </div>
      <div className="eng-toolbar" style={{ marginTop: 16, marginBottom: 0 }}>
        <div className="eng-btns">
        <div className="eng-voice-delivery" role="radiogroup" aria-label="Voice">
          {(Object.keys(VOICES) as VoiceKey[]).map((v) => (
            <button key={v} type="button" role="radio" aria-checked={voice === v}
              className={voice === v ? "on" : undefined} onClick={() => setVoice(v)} title={VOICES[v].note}>
              {VOICES[v].label}
            </button>
          ))}
        </div>
        <div className="eng-voice-delivery" role="radiogroup" aria-label="Delivery">
          {(Object.keys(DELIVERY) as Delivery[]).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={delivery === d}
              className={delivery === d ? "on" : undefined} onClick={() => setDelivery(d)} title={DELIVERY[d].hint}>
              {DELIVERY[d].label}
            </button>
          ))}
        </div>
        </div>
        <div className="eng-btns" style={{ alignItems: "center" }}>
          <small className="eng-voice-count">{text.length} / {MAX_CHARS}</small>
          <button className="eng-btn" disabled={busy || !text.trim()} onClick={speak}>
            {busy ? "Speaking…" : `Hear it in ${VOICES[voice].label}'s voice`}
          </button>
        </div>
      </div>
      {error ? <div className="eng-notebox" style={{ marginTop: 16 }}>{error}</div> : null}

      {takes.length ? (
        <div className="eng-voice-takes">
          {takes.map((t) => (
            <div key={t.id} className="eng-voice-take">
              <p>&ldquo;{t.text}&rdquo; <small>{VOICES[t.voice].label} · {DELIVERY[t.delivery].label}</small></p>
              <div className="eng-voice-play">
                <audio src={t.url} controls preload="auto" />
                <a className="eng-btn ghost" href={t.url} download={fileName(t.voice, t.text)}>Download</a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
