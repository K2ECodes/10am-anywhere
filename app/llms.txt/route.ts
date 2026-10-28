import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, INSTAGRAM } from "@/lib/seo";
import { sanityEnabled } from "@/lib/sanity/client";

// /llms.txt: a plain-language map of the site for AI assistants (llmstxt.org).
// Built live from Sanity so every new edit, story and city guide appears here.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const clean = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();

export async function GET() {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "10am anywhere is run by three founders in Berlin: Silke Rumpelhardt, Alexandra Cukierman and Corinna Möll. Each week they publish an edit, a short themed selection of pieces they would buy themselves, across fashion, interior, beauty and menswear, plus notes on culture and city guides for travel. Products are sold by the original retailers; links to them are affiliate links.",
    "",
    "## Sections",
    `- [Latest edit and homepage](${SITE_URL}/): the current weekly edit, Our Picks of the Week, What's On and the Men edit`,
    `- [Fashion](${SITE_URL}/category/fashion)`,
    `- [Interior](${SITE_URL}/category/interior)`,
    `- [Beauty](${SITE_URL}/category/beauty)`,
    `- [Men](${SITE_URL}/men)`,
    `- [Culture](${SITE_URL}/category/culture): what to read, watch, listen to and see`,
    `- [Travel](${SITE_URL}/category/travel): city guides with where to stay, eat, do and shop`,
    `- [The founders](${SITE_URL}/the-editors)`,
  ];
  if (sanityEnabled) {
    try {
      const { fetchSiteIndex } = await import("@/lib/sanity/queries");
      const idx = await fetchSiteIndex();
      if (idx) {
        lines.push("", "## Edits");
        idx.edits.forEach((e) => lines.push(`- [${clean(e.title)}](${SITE_URL}/edit/${e.slug})${e.description ? `: ${clean(e.description)}` : ""}`));
        lines.push("", "## Stories");
        idx.articles.forEach((a) => lines.push(`- [${clean(a.title)}](${SITE_URL}/article/${a.slug})${a.dek ? `: ${clean(a.dek)}` : ""}`));
        lines.push("", "## City guides");
        idx.guides.forEach((g) => lines.push(`- [10am in ${g.city}](${SITE_URL}/guide/${g.slug})${g.country ? `: ${g.country}` : ""}`));
      }
    } catch (err) {
      console.error("[llms.txt] Sanity index failed:", err);
    }
  }
  lines.push("", "## Optional", `- [Instagram](${INSTAGRAM})`, `- Contact: info@10amanywhere.com`, "");
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
