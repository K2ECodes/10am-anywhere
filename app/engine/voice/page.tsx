import { getVoiceShowcase } from "@/lib/engine/store";
import { VOICE_TIPS } from "@/lib/engine/voice-clone";
import VoiceStudio from "@/components/engine/VoiceStudio";

export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const show = await getVoiceShowcase();
  const reels = [
    { src: show.email, label: "In Silke's voice", note: "Her AI voice, chatty and quick. About 33 seconds.", dl: "silke-voice" },
    { src: show.takes, label: "In a stock voice", note: "Joanna, a warm conversational presenter voice. About 33 seconds.", dl: "stock-voice" },
  ].filter((r) => r.src);

  return (
    <>
      <div className="eng-kicker">Deliverable 02 · Phase Two · Voice Studio</div>
      <h1 className="eng-h1">Your voice on every reel, without a recording session.</h1>
      <p className="eng-lede">
        An AI voice trained on Silke&apos;s own recordings. Write a line, hear it in her voice in a few seconds, and drop it
        straight into an edit. No studio, no retakes, and every line still goes past you before it is used.
      </p>

      <section className="eng-section">
        <h2 className="eng-h2">How to stay sane in December</h2>
        <p className="eng-h2-sub">
          Pepa&apos;s edit, voiced in one easy, conversational take that follows the text on each slide. Short and quick,
          more chat than performance. Two voices to choose from.
        </p>
        {reels.length ? (
          <div className="eng-voice-reels">
            {reels.map((r) => (
              <figure key={r.label} className="eng-card">
                <video src={r.src!} poster={show.poster ?? undefined} controls playsInline preload="metadata" />
                <figcaption>
                  <b>{r.label}</b>
                  <small>{r.note}</small>
                  <a className="eng-btn ghost" href={r.src! + "?dl=december-reel-" + r.dl + ".mp4"}>Download</a>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : <div className="eng-empty">Reel not uploaded</div>}
      </section>

      <section className="eng-section">
        <h2 className="eng-h2">Make a voiceover</h2>
        <p className="eng-h2-sub">Type the line, choose how it should sound, then play it back and download the file.</p>
        <div className="eng-voice-grid">
          <VoiceStudio />
          <div className="eng-card">
            <div className="eng-meta">Getting the best read</div>
            <ul style={{ paddingLeft: 18, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              {VOICE_TIPS.map((t) => <li key={t} style={{ marginBottom: 8 }}>{t}</li>)}
            </ul>
            <div className="eng-meta" style={{ marginTop: 24 }}>Whose voice this is</div>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: 0 }}>
              Cloned from Silke&apos;s own recordings, with her permission, and used only for 10am. It lives in this private
              workspace behind your team password.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
