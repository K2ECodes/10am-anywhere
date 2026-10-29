import { SITE_URL } from "@/lib/seo";
import { QUESTIONS, ENGINES, currentMonthKey } from "@/lib/engine/aeo";
import { getCitations } from "@/lib/engine/store";
import CitationTracker from "@/components/engine/CitationTracker";

export const dynamic = "force-dynamic";

type LiveCheck = { label: string; detail: string; ok: boolean };

async function get(path: string): Promise<{ ok: boolean; text: string }> {
  try {
    const r = await fetch(`${SITE_URL}${path}`, { cache: "no-store", headers: { cookie: "nl_ok=1" }, signal: AbortSignal.timeout(8000) });
    return { ok: r.ok, text: r.ok ? await r.text() : "" };
  } catch {
    return { ok: false, text: "" };
  }
}

// Checks the live site, so this page always shows what AI engines see today.
async function liveChecks(): Promise<LiveCheck[]> {
  const [robots, sitemap, llms, home, edit, article] = await Promise.all([
    get("/robots.txt"), get("/sitemap.xml"), get("/llms.txt"), get("/"), get("/edit/dinner-parties"), get("/article/three-rooms-worth-the-trip"),
  ]);
  const bots = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"].filter((b) => robots.text.includes(b));
  const urls = (sitemap.text.match(/<loc>/g) ?? []).length;
  return [
    { label: "AI crawlers explicitly welcome", detail: bots.length ? `robots.txt names ${bots.join(", ")}` : "robots.txt does not name the AI crawlers yet", ok: bots.length >= 4 },
    { label: "Every page listed for crawlers", detail: urls ? `sitemap.xml lists ${urls} pages, updated live from Sanity` : "No sitemap yet", ok: urls > 10 },
    { label: "A guide written for AI assistants", detail: llms.ok ? "/llms.txt maps every edit, article and guide in plain language" : "No /llms.txt yet", ok: llms.ok && llms.text.length > 200 },
    { label: "10am described as an organisation", detail: home.text.includes('"Organization"') ? "Founders, Berlin, Instagram and site search, in schema.org" : "Not found on the homepage", ok: home.text.includes('"Organization"') },
    { label: "Every edit readable as a product list", detail: edit.text.includes('"ItemList"') ? "Products with brand, image and price on every edit page" : "Not found on edit pages", ok: edit.text.includes('"ItemList"') },
    { label: "Articles and guides marked up as articles", detail: article.text.includes('"Article"') ? "Headline, topics and members-only sections declared" : "Not found on articles", ok: article.text.includes('"Article"') },
  ];
}

export default async function AeoPage() {
  const [checks, citations] = await Promise.all([liveChecks(), getCitations()]);
  const passed = checks.filter((c) => c.ok).length;
  const month = currentMonthKey();

  return (
    <>
      <div className="eng-kicker">Deliverable 01 · Answer Engine Optimisation</div>
      <h1 className="eng-h1">When someone asks AI, 10am is the answer.</h1>
      <p className="eng-lede">
        More of your readers now ask ChatGPT or Perplexity what to buy, wear or book before they search. These
        foundations make 10amanywhere.com easy for those engines to read, trust and cite, with a calendar of the questions
        to own and a monthly record of where you appear.
      </p>

      <section className="eng-section">
        <div className="eng-toolbar">
          <div>
            <h2 className="eng-h2">Live on 10amanywhere.com</h2>
            <p className="eng-h2-sub" style={{ marginBottom: 0 }}>Checked against the live site every time this page loads.</p>
          </div>
          <span className={`eng-pill ${passed === checks.length ? "ok" : "warn"}`}>{passed} of {checks.length} in place</span>
        </div>
        <div className="eng-card">
          <ul className="eng-checks">
            {checks.map((c) => (
              <li key={c.label}>
                <span>{c.label}<small>{c.detail}</small></span>
                <span className={`eng-pill ${c.ok ? "ok" : "warn"}`}>{c.ok ? "Live" : "Pending"}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="eng-section">
        <h2 className="eng-h2">The biggest next win</h2>
        <div className="eng-card" style={{ fontSize: 17, lineHeight: 1.6 }}>
          Culture and the city guides sit behind the members gate, so AI engines only see their summaries, not your
          writing. Opening them, or opening one article per guide, would let engines quote 10am directly on questions like
          &ldquo;where to stay in Palma&rdquo;. The newsletter sign-up can stay on the page as an invitation instead of a wall.
          It&apos;s your call, and we can switch it either way in a minute.
        </div>
      </section>

      <section className="eng-section">
        <h2 className="eng-h2">The question calendar</h2>
        <p className="eng-h2-sub">The questions your readers ask AI assistants, the page that answers each one, and when it needs to be fresh. New questions become briefs for the edits you&apos;re already planning.</p>
        <div className="eng-table-wrap">
          <table className="eng-table">
            <thead><tr><th>When</th><th>The question</th><th>Answered by</th><th>Status</th></tr></thead>
            <tbody>
              {QUESTIONS.map((q) => (
                <tr key={q.id}>
                  <td>{q.month}</td>
                  <td>{q.q}{q.note ? <small>{q.note}</small> : null}</td>
                  <td>{q.page ? <a href={`${SITE_URL}${q.page}`} target="_blank" rel="noreferrer">{q.page}</a> : <span style={{ color: "var(--ink-soft)" }}>Page to write</span>}</td>
                  <td><span className={`eng-pill ${q.status === "live" ? "ok" : "info"}`}>{q.status === "live" ? "Live" : "Brief"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="eng-section">
        <h2 className="eng-h2">Citation tracker</h2>
        <p className="eng-h2-sub">
          Once a month each question is asked in every engine, in a fresh logged-out window, and the result is recorded
          here. It becomes the AEO line in your monthly report.
        </p>
        <CitationTracker
          questions={QUESTIONS.filter((q) => q.status === "live").map((q) => ({ id: q.id, q: q.q }))}
          engines={ENGINES.map((e) => ({ id: e.id, label: e.label }))}
          month={month}
          initial={citations}
        />
      </section>
    </>
  );
}
