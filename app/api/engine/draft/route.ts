import { NextResponse } from "next/server";
import { getSource, getDraft, createDraft, type Format } from "@/lib/engine/store";
import { VOICE_GUIDE, FORMATS, SHAPES, DISCLOSURE, houseStyle } from "@/lib/engine/voice";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Drafts one platform format from the latest Instagram post and the edit it
// promotes, in 10am's voice. With `reviseId` + `note` it rewrites an earlier
// draft against the reviewer's note. The draft lands in "review": nothing is
// ever published from here.
export async function POST(req: Request) {
  const { format, reviseId, note } = (await req.json()) as { format: Format; reviseId?: string; note?: string };
  if (!(format in FORMATS)) return NextResponse.json({ error: "unknown format" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "drafting_offline" }, { status: 503 });

  const source = await getSource();
  if (!source) return NextResponse.json({ error: "no source post yet" }, { status: 409 });
  const previous = reviseId ? await getDraft(reviseId) : null;

  const utm = (s: string) => `utm_source=${s}&utm_medium=${s === "newsletter" ? "email" : "social"}&utm_campaign=${source.edit?.slug ?? "instagram"}`;
  const channel = format === "email" ? "newsletter" : format;
  const editUrl = source.edit ? `${SITE_URL}/edit/${source.edit.slug}?${utm(channel)}` : SITE_URL;
  const products = (source.edit?.products ?? [])
    .map((p) => `- ${p.brand}, ${p.name}, ${p.price} ${p.currency} [slug: ${p.slug}]`)
    .join("\n");

  const system = [
    `You are the drafting assistant for 10am (10amanywhere.com), a Berlin-based lifestyle publication run by three friends.`,
    `Voice: ${VOICE_GUIDE.summary}`,
    `Principles:\n${VOICE_GUIDE.principles.map((p) => `- ${p}`).join("\n")}`,
    `Never use these words: ${VOICE_GUIDE.avoid.join(", ")}.`,
    `House rules: never use em dashes or en dashes; no exclamation marks; German law requires the affiliate disclosure "${DISCLOSURE}" on anything that links to products.`,
    `Only mention products from the edit list provided, with their real prices. Never invent facts.`,
    `Reply with JSON only, no commentary, no code fences.`,
  ].join("\n\n");

  const brief: Record<Format, string> = {
    tiktok: `Adapt the post into a faceless TikTok photo post (TikTok's photo carousel mode) that reuses the ${source.slides.length || 1} images from the Instagram carousel, shown above in order as image 1, 2, 3 and so on. Nobody films or appears on camera. Choose and order 5 to 8 of the images for TikTok, opening on the strongest one, and write short on-screen text for each (under 70 characters, TikTok style, more direct than the Instagram caption). The first slide's text is the hook. The caption starts with "${DISCLOSURE}" and ends with: Comment ${source.keyword ?? "the keyword"} and we'll send you the link. At most 5 hashtags. Suggest a sound that suits the mood.`,
    threads: `Adapt the post into a Threads thread of 3 or 4 posts, each under 400 characters, that reads like Silke talking. The last post includes "${DISCLOSURE}" and the link ${editUrl}.`,
    email: `Adapt the post into a section for the Saturday email newsletter. Pick 4 products across the price range from the edit. Include "disclosure": "${DISCLOSURE}" and "slug" on each pick.`,
  };

  const user = [
    `Source: Instagram post by @${source.handle} on ${source.postedAt.slice(0, 10)}:\n"""${source.caption}"""`,
    source.edit ? `It promotes the website edit "${source.edit.title}" (Issue ${source.edit.issueNumber ?? ""}): ${editUrl}\nProducts in the edit:\n${products}` : "",
    `Task: ${brief[format]}`,
    `Return JSON in exactly this shape: ${SHAPES[format]}`,
    previous ? `This is a rewrite. The previous draft was:\n${JSON.stringify(previous.content)}\nThe reviewer's note: "${note ?? previous.note ?? ""}". Keep what works and fix what the note asks for.` : "",
  ].filter(Boolean).join("\n\n");

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ENGINE_MODEL || "claude-sonnet-5-5",
      max_tokens: 8000,
      system,
      // The assistant sees the carousel itself, so slide text matches each image.
      messages: [{
        role: "user",
        content: [
          ...(format === "tiktok"
            ? source.slides.slice(0, 10).map((url) => ({ type: "image", source: { type: "url", url: `${url.replace("auto=format", "fm=jpg")}&w=800` } }))
            : []),
          { type: "text", text: user },
        ],
      }],
    }),
  });
  if (!r.ok) return NextResponse.json({ error: "drafting_failed", detail: (await r.text()).slice(0, 300) }, { status: 502 });
  const out = await r.json();
  const text: string = (out.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
  let content: Record<string, unknown>;
  try {
    content = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch {
    return NextResponse.json({ error: "drafting_failed", detail: "unreadable draft", stop: out.stop_reason }, { status: 502 });
  }
  content = houseStyle(content);
  if (format === "email" && Array.isArray(content.picks)) {
    content.picks = (content.picks as { slug?: string }[]).map((p) => ({ ...p, url: p.slug ? `${SITE_URL}/go/${p.slug}` : editUrl }));
  }
  content.link = editUrl;

  const draft = await createDraft({ format, content, sourceCode: source.code, version: previous ? previous.version + 1 : 1 });
  return NextResponse.json({ draft });
}
