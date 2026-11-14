"use client";

import { useState } from "react";
import { DELIVERY, MAX_CHARS, type Delivery } from "@/lib/engine/voice-clone";

type Take = { id: number; text: string; delivery: Delivery; url: string };

const STARTERS = [
  "It's Christmas. Not the Olympics.",
  "First things first. Pour yourself a drink.",
  "Three rooms worth the trip this month, and one you can skip.",
];

const fileName = (t: string) =>
  "silke-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + ".wav";

export default function VoiceStudio() {
  const [text, setText] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("natural");
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
        body: JSON.stringify({ text, delivery }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error === "voice_offline" ? "The voice is not switched on yet." : j.error ?? "Something went wrong.");
        return;
      }
      const url = URL.createObjectURL(await r.blob());
      setTakes((t) => [{ id: Date.now(), text: text.trim(), delivery, url }, ...t]);
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
        <div className="eng-voice-delivery" role="radiogroup" aria-label="Delivery">
          {(Object.keys(DELIVERY) as Delivery[]).map((d) => (
            <button key={d} type="button" role="radio" aria-checked={delivery === d}
              className={delivery === d ? "on" : undefined} onClick={() => setDelivery(d)} title={DELIVERY[d].hint}>
              {DELIVERY[d].label}
            </button>
          ))}
        </div>
        <div className="eng-btns" style={{ alignItems: "center" }}>
          <small className="eng-voice-count">{text.length} / {MAX_CHARS}</small>
          <button className="eng-btn" disabled={busy || !text.trim()} onClick={speak}>
            {busy ? "Speaking…" : "Hear it in Silke's voice"}
          </button>
        </div>
      </div>
      {error ? <div className="eng-notebox" style={{ marginTop: 16 }}>{error}</div> : null}

      {takes.length ? (
        <div className="eng-voice-takes">
          {takes.map((t) => (
            <div key={t.id} className="eng-voice-take">
              <p>&ldquo;{t.text}&rdquo; <small>{DELIVERY[t.delivery].label}</small></p>
              <div className="eng-voice-play">
                <audio src={t.url} controls preload="auto" />
                <a className="eng-btn ghost" href={t.url} download={fileName(t.text)}>Download</a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
