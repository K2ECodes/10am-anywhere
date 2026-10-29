import { getSource, getShowcase } from "@/lib/engine/store";

export const dynamic = "force-dynamic";

// One illustrative week at full Phase Three volume, built from a single edit.
const WEEK: { day: string; slots: { c: string; t: string }[] }[] = [
  { day: "Mon", slots: [{ c: "ig", t: "Reel: AI UGC, the table set in 20s" }, { c: "tt", t: "Same reel, TikTok Shop tags" }, { c: "pin", t: "6 product pins" }] },
  { day: "Tue", slots: [{ c: "ig", t: "Carousel: 8 pieces under €100" }, { c: "th", t: "Thread: hosting tips" }, { c: "pin", t: "6 product pins" }] },
  { day: "Wed", slots: [{ c: "tt", t: "Founder film from the Content Engine" }, { c: "yt", t: "Short: same film" }, { c: "ig", t: "Stories: poll + links" }] },
  { day: "Thu", slots: [{ c: "ig", t: "Reel: AI UGC, the splurge vs the save" }, { c: "tt", t: "Same reel, TikTok Shop tags" }, { c: "pin", t: "6 product pins" }] },
  { day: "Fri", slots: [{ c: "ig", t: "Carousel: German edition" }, { c: "th", t: "Thread: weekend plans" }, { c: "tt", t: "Trend remix from the radar" }] },
  { day: "Sat", slots: [{ c: "em", t: "Newsletter from the Content Engine" }, { c: "ig", t: "Stories: newsletter teaser" }] },
  { day: "Sun", slots: [{ c: "ig", t: "Reel: the week's best seller" }, { c: "pin", t: "Board refresh" }] },
];

const FEATURES = [
  { pill: "Built, in preview", tone: "ok", h: "AI UGC reels", p: "A creator-style reel from the real products in each edit: an AI presenter, a voiceover in your tone and animated captions. You approve the still, the script and the cut." },
  { pill: "Built, in preview", tone: "ok", h: "Carousels and stories", p: "Finished 1080 x 1350 slides and story frames designed from each edit, in the 10am type and layout, ready to download after approval." },
  { pill: "New", tone: "info", h: "TikTok Shop", p: "Every product in an edit listed and tagged in TikTok Shop, so a reel sells directly where it is watched, alongside your ShopMy links on Instagram." },
  { pill: "New", tone: "info", h: "Pinterest, on autopilot", p: "Each product becomes a pin linked to its edit. For fashion and interiors, Pinterest is one of the longest-living traffic sources there is: a pin keeps sending readers for months." },
  { pill: "New", tone: "info", h: "A German edition", p: "Carousels, captions and the newsletter adapted for your German readers, written in German rather than translated, through the same approval gate." },
  { pill: "New", tone: "info", h: "Trend radar", p: "Rising TikTok and Pinterest searches matched to your products each week, so you post into demand instead of guessing." },
  { pill: "New", tone: "info", h: "Comment to DM on every post", p: "The ManyChat keyword flow you already use, set up automatically for every reel and carousel the engine makes, with its own tracked link." },
  { pill: "New", tone: "info", h: "Revenue per post", p: "Affiliate clicks and earnings traced back to the post, channel and format that drove them, so the engine makes more of what sells." },
  { pill: "New", tone: "info", h: "Brand partnerships", p: "A shortlist of brands from your best-selling edits, with outreach drafts for paid placements and higher commission rates. You send them." },
];

export default async function GrowthPage() {
  const [source, show] = await Promise.all([getSource(), getShowcase()]);
  const products = (source?.edit?.products ?? []).filter((p) => p.image);
  const slides = products.slice(0, 5);

  return (
    <>
      <div className="eng-hero-dark">
        <div className="eng-kicker">Deliverable 03 · Phase Three preview · The Growth Engine</div>
        <h1 className="eng-h1">From one post a week to a presence every day.</h1>
        <p className="eng-lede">
          Phase Two gives every edit a voice on three channels. Phase Three turns each edit into a week of content across
          Instagram, TikTok, Pinterest, YouTube Shorts, Threads and email, made to sell, with the same approval gate on every piece.
        </p>
      </div>

      <section className="eng-section">
        <h2 className="eng-h2">Already built: the AI UGC reel</h2>
        <p className="eng-h2-sub">A creator-style fashion clip made entirely with AI: the model, the styling, the light and the movement. In Phase Three, clips like this are made from the real pieces in each edit and go through your approval before anything is posted.</p>
        <div className="eng-card eng-reel">
          {show.reel ? (
            <video src={show.reel} poster={show.poster ?? undefined} autoPlay muted loop playsInline controls preload="auto" />
          ) : <div className="eng-empty">Reel not uploaded</div>}
          <div>
            <div className="eng-meta">How a reel is made</div>
            <ul className="eng-checks">
              <li><span>Pick the pieces<small>The engine chooses two or three hero products from the edit</small></span><span className="eng-pill">Automatic</span></li>
              <li><span>The look<small>An AI model styled in the real pieces, in a 10am setting</small></span><span className="eng-pill info">You approve</span></li>
              <li><span>The motion<small>Movement, light and camera, with an optional voiceover in the 10am voice</small></span><span className="eng-pill info">You approve</span></li>
              <li><span>The cut<small>Vertical 9:16 with captions and music, sized for Reels, TikTok and Shorts</small></span><span className="eng-pill info">You approve</span></li>
            </ul>
          </div>
        </div>
      </section>

      {slides.length ? (
        <section className="eng-section">
          <h2 className="eng-h2">Already built: carousels from every edit</h2>
          <p className="eng-h2-sub">A cover, the pieces, and a closing slide with the keyword. Designed automatically, downloaded as finished images once approved.</p>
          <div className="eng-slides">
            <div className="eng-slide cover"><div className="eng-slide-cap">{source?.edit?.title}</div></div>
            {slides.map((p) => (
              <div key={p.slug} className="eng-slide prod">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image!} alt="" />
                <div className="eng-slide-cap"><b>{p.brand}</b>{p.name} · €{p.price}</div>
              </div>
            ))}
            <div className="eng-slide cover"><div className="eng-slide-cap" style={{ fontFamily: "'Bembo', Georgia, serif", fontStyle: "italic", fontSize: 22 }}>Comment {source?.keyword ?? "TABLE"}<br />for every link</div></div>
          </div>
        </section>
      ) : null}

      <section className="eng-section">
        <h2 className="eng-h2">What Phase Three adds</h2>
        <p className="eng-h2-sub">Everything in the Content Engine, plus the studio and the distribution to post at volume.</p>
        <div className="eng-grid3">
          {FEATURES.map((f) => (
            <div key={f.h} className="eng-card eng-feature">
              <span className={`eng-pill ${f.tone}`}>{f.pill}</span>
              <h3>{f.h}</h3>
              <p>{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="eng-section">
        <h2 className="eng-h2">One edit, one week</h2>
        <p className="eng-h2-sub">An example of what a single edit like {source?.edit?.title ?? "Dinner Parties"} becomes at full volume. The rhythm is yours to set; everything still waits for approval.</p>
        <div className="eng-week">
          {WEEK.map((d) => (
            <div key={d.day} className="eng-day">
              <h5>{d.day}</h5>
              {d.slots.map((s, i) => <div key={i} className={`eng-slot ${s.c}`}>{s.t}</div>)}
            </div>
          ))}
        </div>
        <div className="eng-legend">
          <span className="ig">Instagram</span><span className="tt">TikTok</span><span className="pin">Pinterest</span>
          <span className="yt">YouTube Shorts</span><span className="th">Threads</span><span className="em">Newsletter</span>
        </div>
      </section>

      <section className="eng-section">
        <div className="eng-card" style={{ fontSize: 18, lineHeight: 1.6 }}>
          <div className="eng-meta">What doesn&apos;t change</div>
          Nothing is ever posted without one of you approving it. Phase Three adds batch review, so a week of content can
          be checked in one sitting, and a calendar view of everything approved and scheduled.
        </div>
      </section>
    </>
  );
}
