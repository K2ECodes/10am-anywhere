import { getSource, listDrafts } from "@/lib/engine/store";
import { VOICE_GUIDE, DISCLOSURE } from "@/lib/engine/voice";
import ContentEngine from "@/components/engine/ContentEngine";

export const dynamic = "force-dynamic";

export default async function ContentEnginePage() {
  const [source, drafts] = await Promise.all([getSource(), listDrafts()]);
  return (
    <>
      <div className="eng-kicker">Deliverable 02 · Phase Two · The Content Engine</div>
      <h1 className="eng-h1">Write it once. Say it everywhere, in your voice.</h1>
      <p className="eng-lede">
        Each week the engine picks up your newest Instagram post, finds the edit it sells, and drafts a TikTok, a Threads
        conversation and a newsletter section from it. You see every word before anything goes out.
      </p>

      <div className="eng-gates">
        <div><b>1. It listens</b>Your latest @10am_anywhere post is pulled in automatically and linked to its edit on the site.</div>
        <div><b>2. It drafts</b>The drafting assistant writes each format in the 10am voice, with your real products and prices.</div>
        <div><b>3. It checks</b>Every draft is checked against the voice guide and the Anzeige rule before you see it.</div>
        <div><b>4. You decide</b>Approve, reject or send it back with a note. Only approved pieces can be copied out to post.</div>
      </div>

      <ContentEngine source={source} initialDrafts={drafts} />

      <section className="eng-section">
        <h2 className="eng-h2">The voice the assistant writes in</h2>
        <p className="eng-h2-sub">Built from your captions, edits and columns. Tell us what to change and the assistant follows it from the next draft on.</p>
        <div className="eng-grid2">
          <div className="eng-card">
            <div className="eng-meta">How 10am sounds</div>
            <p style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1.5, marginTop: 0 }}>{VOICE_GUIDE.summary}</p>
            <ul style={{ paddingLeft: 18, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              {VOICE_GUIDE.principles.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div className="eng-card">
            <div className="eng-meta">Guardrails on every draft</div>
            <ul className="eng-checks">
              <li><span>The affiliate disclosure<small>&ldquo;{DISCLOSURE}&rdquo; on anything with product links</small></span><span className="eng-pill bad">Blocks approval</span></li>
              <li><span>No long dashes<small>House style: commas and full stops instead</small></span><span className="eng-pill bad">Blocks approval</span></li>
              <li><span>Platform limits<small>Threads posts under 500 characters, email subjects under 60</small></span><span className="eng-pill bad">Blocks approval</span></li>
              <li><span>No exclamation marks, no hype words<small>{VOICE_GUIDE.avoid.slice(0, 5).join(", ")}…</small></span><span className="eng-pill warn">Flags it</span></li>
              <li><span>Real products only<small>The assistant can only name pieces and prices from the edit</small></span><span className="eng-pill ok">Built in</span></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
