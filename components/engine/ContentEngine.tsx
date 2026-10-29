"use client";

import { useEffect, useMemo, useState } from "react";
import type { Draft, Source, Status, Format } from "@/lib/engine/store";
import { FORMATS, runChecks } from "@/lib/engine/voice";

const REVIEWERS = ["Silke", "Alexandra", "Corinna", "Pepa"];
const TABS: { id: Status; label: string }[] = [
  { id: "review", label: "To review" },
  { id: "changes", label: "Changes requested" },
  { id: "approved", label: "Approved" },
  { id: "published", label: "Posted" },
  { id: "rejected", label: "Rejected" },
];
const ORDER: Format[] = ["tiktok", "threads", "email"];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Europe/Berlin" });

/* eslint-disable @typescript-eslint/no-explicit-any */
// Plain text for the clipboard, laid out the way each platform wants it pasted.
function asText(d: Draft): string {
  const c = d.content as any;
  if (d.format === "threads") return (c.posts ?? []).join("\n\n---\n\n");
  if (d.format === "tiktok") {
    const slides = (c.slides ?? []).map((x: any, i: number) => `Slide ${i + 1} (Instagram image ${x.image}): ${x.onScreen}`).join("\n");
    return `TIKTOK PHOTO POST\n\n${slides}\n\nSOUND: ${c.sound}\n\nCAPTION\n${c.caption}\n\n${(c.hashtags ?? []).join(" ")}`;
  }
  const picks = (c.picks ?? []).map((p: any) => `${p.product} (${p.price})\n${p.line}\n${p.url ?? ""}`).join("\n\n");
  return `Subject: ${c.subject}\nPreview: ${c.preheader}\n\n${c.headline}\n\n${c.intro}\n\n${picks}\n\n[${c.cta}] ${c.link ?? ""}\n\n${c.signoff}\n\n${c.disclosure ?? ""}`;
}

function DraftBody({ d, slides }: { d: Draft; slides: string[] }) {
  const c = d.content as any;
  if (d.format === "threads") {
    return (
      <>
        <h4>Thread · {(c.posts ?? []).length} posts</h4>
        {(c.posts ?? []).map((p: string, i: number) => <div key={i} className="eng-thread-post">{p}</div>)}
      </>
    );
  }
  if (d.format === "tiktok") {
    return (
      <>
        <h4>Photo post · {(c.slides ?? []).length} slides from your carousel</h4>
        <div className="eng-tt-slides">
          {(c.slides ?? []).map((x: any, i: number) => (
            <figure key={i} className="eng-tt-slide">
              {slides[x.image - 1] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slides[x.image - 1]} alt={`Instagram image ${x.image}`} />
              ) : null}
              <figcaption>{x.onScreen}</figcaption>
              <span>{i + 1}</span>
            </figure>
          ))}
        </div>
        <h4>Caption</h4>
        <p>{c.caption}</p>
        <p style={{ color: "var(--ink-soft)" }}>{(c.hashtags ?? []).join(" ")}</p>
        {c.sound ? <><h4>Sound</h4><p>{c.sound}</p></> : null}
      </>
    );
  }
  return (
    <div className="eng-email">
      <div className="eng-email-subject">{c.subject}</div>
      <div className="eng-email-pre">{c.preheader}</div>
      <p style={{ fontStyle: "italic", fontSize: 20, margin: "0 0 6px" }}>{c.headline}</p>
      <p>{c.intro}</p>
      {(c.picks ?? []).map((p: any, i: number) => (
        <div key={i} className="eng-email-pick">
          <span><b style={{ fontWeight: 400, fontStyle: "italic" }}>{p.product}</b><br /><span style={{ color: "#444" }}>{p.line}</span></span>
          <span style={{ whiteSpace: "nowrap" }}>{p.price}</span>
        </div>
      ))}
      <p style={{ marginTop: 12 }}><span className="eng-pill">{c.cta}</span></p>
      <p style={{ color: "#444" }}>{c.signoff}</p>
      <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>{c.disclosure}</p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function ContentEngine({ source, initialDrafts }: { source: Source | null; initialDrafts: Draft[] }) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [tab, setTab] = useState<Status>("review");
  const [reviewer, setReviewer] = useState("Silke");
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try { const r = localStorage.getItem("engine-reviewer"); if (r) setReviewer(r); } catch {}
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, drafts.filter((d) => d.status === t.id).length])), [drafts]);
  const shown = drafts
    .filter((d) => d.status === tab)
    .sort((a, b) => ORDER.indexOf(a.format) - ORDER.indexOf(b.format) || b.createdAt.localeCompare(a.createdAt));

  const replace = (d: Draft) => setDrafts((ds) => [d, ...ds.filter((x) => x._id !== d._id)]);

  async function move(d: Draft, status: Status, note?: string | null) {
    setBusy(d._id);
    const r = await fetch(`/api/engine/drafts/${encodeURIComponent(d._id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, reviewer, ...(note !== undefined ? { note } : {}) }),
    });
    setBusy(null);
    if (!r.ok) return setToast("That didn't save. Try again.");
    replace((await r.json()).draft);
    setNoteOpen(null);
    setToast(
      status === "approved" ? "Approved. It's ready to post when you are." :
      status === "changes" ? "Sent back with your note." :
      status === "rejected" ? "Rejected. It won't be posted." :
      status === "published" ? "Marked as posted." : "Moved back to review."
    );
  }

  async function draft(format: Format, revise?: Draft) {
    setBusy(revise ? revise._id : format);
    const r = await fetch("/api/engine/draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ format, ...(revise ? { reviseId: revise._id, note: revise.note } : {}) }),
    });
    if (!r.ok) {
      setBusy(null);
      return setToast(r.status === 503 ? "The drafting assistant is offline right now." : "Drafting didn't work that time. Try again.");
    }
    const { draft: fresh } = await r.json();
    if (revise) {
      // The old version is superseded by the rewrite.
      const old = await fetch(`/api/engine/drafts/${encodeURIComponent(revise._id)}`, {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "rejected", reviewer, note: `Replaced by version ${fresh.version}. ${revise.note ?? ""}`.trim() }),
      });
      if (old.ok) replace((await old.json()).draft);
    }
    replace(fresh);
    setBusy(null);
    setTab("review");
    setToast(`New ${FORMATS[format as keyof typeof FORMATS].label} draft ready to review.`);
  }

  // The carousel images in the TikTok order, saved as tiktok-1.jpg, tiktok-2.jpg…
  function downloadSlides(d: Draft) {
    const order = ((d.content.slides as { image: number }[] | undefined) ?? []).map((x) => source?.slides[x.image - 1]).filter(Boolean) as string[];
    order.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = `${url.replace("auto=format", "fm=jpg")}&dl=tiktok-${i + 1}.jpg`;
      document.body.appendChild(a);
      setTimeout(() => { a.click(); a.remove(); }, i * 400);
    });
    setToast(`Downloading ${order.length} slides in TikTok order.`);
  }

  async function copy(d: Draft) {
    try { await navigator.clipboard.writeText(asText(d)); setToast("Copied. Paste it straight into the app."); }
    catch { setToast("Copy didn't work in this browser."); }
  }

  return (
    <>
      {/* The flow: what 10am already makes, connected to the channels */}
      <section className="eng-section">
        <h2 className="eng-h2">How it connects</h2>
        <p className="eng-h2-sub">The post you already published, the edit it sells, and the three channels it should reach. Every link carries tracking, so you can see which channel drives clicks.</p>
        <div className="eng-flow">
          <div className="eng-card">
            <div className="eng-meta">1 · Instagram · {source ? fmtDate(source.postedAt) : "not synced"}</div>
            {source?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={source.image} alt="Latest Instagram post" className="eng-src-img" />
            ) : null}
            <div className="eng-caption">{source?.caption ?? "No post synced yet."}</div>
            {source ? <p style={{ marginTop: 12 }}><a href={source.url} target="_blank" rel="noreferrer" className="eng-deliv-go" style={{ textDecoration: "none" }}>View on Instagram</a></p> : null}
          </div>
          <div className="eng-flow-arrow">→</div>
          <div className="eng-card">
            <div className="eng-meta">2 · The website edit</div>
            {source?.edit ? (
              <>
                <div className="eng-channel-name" style={{ fontSize: 26 }}>{source.edit.title}</div>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "4px 0 0" }}>
                  {source.edit.issueNumber ? `Issue No. ${source.edit.issueNumber} · ` : ""}{source.edit.products.length} pieces
                </p>
                <div className="eng-prod-strip">
                  {source.edit.products.filter((p) => p.image).slice(0, 8).map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.slug} src={p.image!} alt={`${p.brand} ${p.name}`} title={`${p.brand}, ${p.name}`} />
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Matched from the caption automatically.{source.keyword ? ` Comment keyword ${source.keyword} carries over to every channel.` : ""}
                </p>
              </>
            ) : <p>No matching edit found for this post.</p>}
          </div>
          <div className="eng-flow-arrow">→</div>
          <div className="eng-card">
            <div className="eng-meta">3 · Adapted for each channel</div>
            {ORDER.map((f) => (
              <div key={f} className="eng-channel">
                <span className="eng-channel-name">
                  {FORMATS[f].label}
                  <small>{FORMATS[f].blurb}</small>
                </span>
                <button className="eng-btn ghost" disabled={busy !== null || !source} onClick={() => draft(f)}>
                  {busy === f ? "Drafting…" : "Draft"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The board */}
      <section className="eng-section">
        <div className="eng-toolbar">
          <div>
            <h2 className="eng-h2">Review board</h2>
            <p className="eng-h2-sub" style={{ marginBottom: 0 }}>Every draft waits here. Approve it, send it back with a note, or reject it.</p>
          </div>
          <label>
            Reviewing as
            <select value={reviewer} onChange={(e) => { setReviewer(e.target.value); try { localStorage.setItem("engine-reviewer", e.target.value); } catch {} }}>
              {REVIEWERS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <div className="eng-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? "on" : undefined} onClick={() => setTab(t.id)}>
              {t.label}<i>{counts[t.id] || 0}</i>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="eng-empty">Nothing here right now.</div>
        ) : (
          <div className="eng-drafts">
            {shown.map((d) => {
              const checks = runChecks(d.format, d.content, source?.keyword ?? null);
              const blocking = checks.some((c) => !c.ok && c.level === "fail");
              const isBusy = busy === d._id;
              return (
                <article key={d._id} className="eng-draft">
                  <div className="eng-draft-head">
                    <span className="eng-channel-name">{FORMATS[d.format].label}</span>
                    <span className="eng-meta" style={{ margin: 0 }}>Version {d.version} · {fmtDate(d.createdAt)}</span>
                  </div>
                  <div className="eng-draft-body"><DraftBody d={d} slides={source?.slides ?? []} /></div>
                  <div className="eng-guard" title="Checked automatically against the 10am voice guide">
                    {checks.map((c) => (
                      <span key={c.id} className={c.ok ? "" : c.level === "fail" ? "no" : "maybe"}>{c.ok ? "✓" : "!"} {c.label}</span>
                    ))}
                  </div>
                  <div className="eng-draft-actions">
                    {d.decidedBy && d.status !== "review" ? (
                      <div className="eng-decided">
                        {TABS.find((t) => t.id === d.status)?.label} by {d.decidedBy}{d.decidedAt ? `, ${fmtDate(d.decidedAt)}` : ""}
                      </div>
                    ) : null}
                    {d.note && d.status !== "review" ? <div className="eng-notebox">“{d.note}”</div> : null}

                    {d.status === "review" && noteOpen !== d._id ? (
                      <div className="eng-btns">
                        <button className="eng-btn" disabled={isBusy || blocking} title={blocking ? "Fix the red checks first" : undefined} onClick={() => move(d, "approved")}>Approve</button>
                        <button className="eng-btn ghost" disabled={isBusy} onClick={() => setNoteOpen(d._id)}>Request changes</button>
                        <button className="eng-btn quiet" disabled={isBusy} onClick={() => move(d, "rejected")}>Reject</button>
                      </div>
                    ) : null}
                    {noteOpen === d._id ? (
                      <>
                        <textarea className="eng-note" placeholder="What should change? e.g. Make it sound more like Silke talking." value={notes[d._id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [d._id]: e.target.value }))} autoFocus />
                        <div className="eng-btns">
                          <button className="eng-btn" disabled={isBusy || !(notes[d._id] ?? "").trim()} onClick={() => move(d, "changes", notes[d._id].trim())}>Send back</button>
                          <button className="eng-btn quiet" onClick={() => setNoteOpen(null)}>Cancel</button>
                        </div>
                      </>
                    ) : null}
                    {d.status === "changes" ? (
                      <div className="eng-btns">
                        <button className="eng-btn" disabled={busy !== null} onClick={() => draft(d.format, d)}>{isBusy ? "Rewriting…" : "Rewrite with this note"}</button>
                        <button className="eng-btn ghost" disabled={isBusy || blocking} onClick={() => move(d, "approved")}>Approve as is</button>
                        <button className="eng-btn quiet" disabled={isBusy} onClick={() => move(d, "review", null)}>Back to review</button>
                      </div>
                    ) : null}
                    {d.status === "approved" ? (
                      <div className="eng-btns">
                        <button className="eng-btn" onClick={() => copy(d)}>Copy for {FORMATS[d.format].label}</button>
                        {d.format === "tiktok" ? (
                          <button className="eng-btn ghost" onClick={() => downloadSlides(d)}>Download slides</button>
                        ) : null}
                        <button className="eng-btn ghost" disabled={isBusy} onClick={() => move(d, "published")}>Mark as posted</button>
                        <button className="eng-btn quiet" disabled={isBusy} onClick={() => move(d, "review")}>Undo approval</button>
                      </div>
                    ) : null}
                    {d.status === "published" ? (
                      <div className="eng-btns"><button className="eng-btn ghost" onClick={() => copy(d)}>Copy again</button></div>
                    ) : null}
                    {d.status === "rejected" ? (
                      <div className="eng-btns"><button className="eng-btn quiet" disabled={isBusy} onClick={() => move(d, "review", null)}>Restore to review</button></div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      {toast ? <div className="eng-toast" role="status">{toast}</div> : null}
    </>
  );
}
