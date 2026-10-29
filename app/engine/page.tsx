import Link from "next/link";
import { getSource, listDrafts } from "@/lib/engine/store";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });

export default async function EngineOverview() {
  const [source, drafts] = await Promise.all([getSource(), listDrafts()]);
  const waiting = drafts.filter((d) => d.status === "review" || d.status === "changes").length;

  return (
    <>
      <div className="eng-kicker">The 10am Engine · Phase Two</div>
      <h1 className="eng-h1">One edit in. Every channel out.</h1>
      <p className="eng-lede">
        A private workspace built around how 10am already works. Your Instagram post and website edit become a TikTok,
        a Threads conversation and a newsletter section, written in your voice. Nothing goes out until one of you approves it.
      </p>

      <div className="eng-grid3">
        <Link href="/engine/aeo" className="eng-card eng-deliv">
          <div className="eng-deliv-num">01</div>
          <span className="eng-pill ok" style={{ alignSelf: "flex-start", marginBottom: 14 }}>Live on the site</span>
          <div className="eng-deliv-title">Answer Engine Optimisation</div>
          <p>So ChatGPT, Perplexity, Claude and Google&apos;s AI answers can read, understand and cite 10am. Includes the question calendar and the monthly citation tracker.</p>
          <span className="eng-deliv-go">See what&apos;s in place</span>
        </Link>
        <Link href="/engine/content" className="eng-card eng-deliv">
          <div className="eng-deliv-num">02</div>
          <span className="eng-pill info" style={{ alignSelf: "flex-start", marginBottom: 14 }}>
            {waiting ? `${waiting} draft${waiting === 1 ? "" : "s"} waiting for you` : "Ready"}
          </span>
          <div className="eng-deliv-title">The Content Engine</div>
          <p>Your latest Instagram post, adapted for TikTok, Threads and the email newsletter by a drafting assistant trained on your voice, with an approval gate on every piece.</p>
          <span className="eng-deliv-go">Open the review board</span>
        </Link>
        <Link href="/engine/growth" className="eng-card eng-deliv">
          <div className="eng-deliv-num">03</div>
          <span className="eng-pill warn" style={{ alignSelf: "flex-start", marginBottom: 14 }}>Phase Three preview</span>
          <div className="eng-deliv-title">The Growth Engine</div>
          <p>What comes next: AI UGC reels, carousels and stories, TikTok Shop, Pinterest and a daily posting rhythm built to turn more of your edits into sales.</p>
          <span className="eng-deliv-go">See the preview</span>
        </Link>
      </div>

      {source ? (
        <section className="eng-section">
          <h2 className="eng-h2">This week&apos;s source</h2>
          <p className="eng-h2-sub">
            Pulled from @{source.handle} automatically. The engine always starts from what you last published.
          </p>
          <div className="eng-card" style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, alignItems: "center" }}>
            {source.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={source.image} alt="" className="eng-src-img" style={{ marginBottom: 0 }} />
            ) : <div />}
            <div>
              <div className="eng-meta">Instagram · {fmtDate(source.postedAt)}{source.edit ? ` · Linked to the ${source.edit.title} edit` : ""}</div>
              <p style={{ fontSize: 17, lineHeight: 1.5, margin: 0 }}>{source.caption.split("\n")[0]}</p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
