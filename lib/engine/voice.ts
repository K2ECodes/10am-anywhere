// 10am's editorial voice, the three Phase Two formats, and the guardrails every
// draft is checked against before a person sees it. Shared by the drafting route
// (server) and the review board (client), so both apply the same rules.

export const VOICE_GUIDE = {
  summary:
    "Three friends with very good taste, writing to a friend. Warm, curious and quietly witty. Curated, never pushy, and always at every price point.",
  principles: [
    "Write like a note from a friend, not an ad. \"We\" are 10am; the reader is \"you\".",
    "Short sentences, sensory detail, one light turn of wit. \"A little less Saint-Tropez. A little more Slim Aarons.\"",
    "Show the range: mention one accessible piece next to one splurge.",
    "British English spelling (colour, favourite, jewellery).",
    "Name brands and pieces exactly as they appear in the edit.",
    "End with one clear, gentle invitation: the comment keyword, the link, or the edit.",
  ],
  avoid: ["must-have", "obsessed", "game-changer", "slay", "you need this", "run don't walk", "insane", "hurry", "limited time"],
};

export const FORMATS = {
  tiktok: {
    label: "TikTok",
    blurb: "A 20 to 30 second film script the team shoots on a phone, with on-screen text, caption and keyword.",
  },
  threads: {
    label: "Threads",
    blurb: "A short thread of three or four posts, conversational, with the link in the last post.",
  },
  email: {
    label: "Email newsletter",
    blurb: "A Flodesk-ready section: subject line, preview text, intro and four product picks with links.",
  },
} as const;

export type FormatKey = keyof typeof FORMATS;

// JSON shapes the drafting assistant must return, one per format.
export const SHAPES: Record<FormatKey, string> = {
  tiktok: `{"hook": "on-screen text for the first two seconds", "shots": [{"shot": "what the camera sees", "voiceover": "what is said", "onScreen": "text overlay"}], "caption": "the post caption", "hashtags": ["#10am"], "sound": "music or sound suggestion"}`,
  threads: `{"posts": ["post 1", "post 2", "post 3"]}`,
  email: `{"subject": "under 60 characters", "preheader": "under 90 characters", "headline": "section headline", "intro": "two or three sentences", "picks": [{"product": "Brand, Product", "line": "one sentence on why", "price": "€29.99"}], "cta": "button label", "signoff": "one line"}`,
};

export const DISCLOSURE = "Anzeige. Enthält Affiliate-Links.";

export type Check = { id: string; label: string; ok: boolean; level: "fail" | "warn" };

// Every string in a draft, flattened, so the checks see all of it.
export function draftText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(draftText).join("\n");
  if (content && typeof content === "object") return Object.values(content).map(draftText).join("\n");
  return "";
}

export function runChecks(format: FormatKey, content: Record<string, unknown>, keyword: string | null): Check[] {
  const text = draftText(content);
  const lower = text.toLowerCase();
  const checks: Check[] = [
    { id: "dash", label: "No em or en dashes", ok: !/[–—]/.test(text), level: "fail" },
    { id: "bang", label: "No exclamation marks", ok: !text.includes("!"), level: "warn" },
    { id: "hype", label: "No hype words", ok: !VOICE_GUIDE.avoid.some((w) => lower.includes(w)), level: "warn" },
    { id: "anzeige", label: "Affiliate disclosure (Anzeige)", ok: lower.includes("anzeige"), level: "fail" },
  ];
  if (format !== "email" && keyword) {
    checks.push({ id: "keyword", label: `Comment keyword ${keyword}`, ok: text.toUpperCase().includes(keyword), level: "warn" });
  }
  if (format === "threads") {
    const posts = (content.posts as string[] | undefined) ?? [];
    checks.push({ id: "len", label: "Each post under 500 characters", ok: posts.length > 0 && posts.every((p) => p.length <= 500), level: "fail" });
  }
  if (format === "tiktok") {
    const tags = (content.hashtags as string[] | undefined) ?? [];
    checks.push({ id: "tags", label: "Five hashtags or fewer", ok: tags.length <= 5, level: "warn" });
  }
  if (format === "email") {
    const subject = String(content.subject ?? "");
    checks.push({ id: "subject", label: "Subject under 60 characters", ok: subject.length > 0 && subject.length <= 60, level: "fail" });
  }
  return checks;
}

// Last-line safety net applied to every model draft before it is saved: the
// house style has no long dashes, so they become commas.
export function houseStyle<T>(v: T): T {
  if (typeof v === "string") return v.replace(/\s*[–—]\s*/g, ", ") as T;
  if (Array.isArray(v)) return v.map(houseStyle) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, houseStyle(x)])) as T;
  return v;
}
