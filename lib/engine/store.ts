import { createClient } from "@sanity/client";
import { sanityConfig } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";

// Engine data lives in the same Sanity dataset as the site, in its own document
// types (engineSource, engineDraft, engineAeo). Dotted ids keep them out of the
// public read role, and every read/write goes through the server-side token.
const client = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: "raw",
});
const fetchLive = <T,>(q: string, params: Record<string, unknown> = {}) =>
  client.fetch<T>(q, params, { cache: "no-store" } as never);

export type Format = "tiktok" | "threads" | "email";
export type Status = "review" | "changes" | "approved" | "rejected" | "published";

export type Source = {
  handle: string;
  code: string;
  url: string;
  caption: string;
  postedAt: string;
  keyword: string | null;
  image: string | null;
  slides: string[]; // the post's carousel images, in order
  syncedAt: string;
  edit: null | {
    slug: string;
    title: string;
    issueNumber?: number;
    cover: string | null;
    products: { slug: string; brand: string; name: string; price: number; currency: string; image: string | null }[];
  };
};

export type Draft = {
  _id: string;
  format: Format;
  status: Status;
  content: Record<string, unknown>;
  note: string | null;
  sourceCode: string;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  version: number;
  generatedBy: "engine" | "team";
};

export async function getSource(): Promise<Source | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = await fetchLive<any>(`*[_id == "engineSource.instagram"][0]{
    ..., "edit": *[_type == "edit" && slug.current == ^.editSlug][0]{
      "slug": slug.current, title, issueNumber, "cover": heroCoverImage,
      "products": coalesce(featuredProducts, sections[].products)[]->{ "slug": coalesce(slug.current, _id), brand, "name": productName, price, currency, "image": primaryImage }
    }
  }`);
  if (!s) return null;
  return {
    handle: s.handle,
    code: s.code,
    url: s.url,
    caption: s.caption,
    postedAt: s.postedAt,
    keyword: s.keyword ?? null,
    image: s.image ? urlForImage(s.image) : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slides: (s.slides ?? []).map((i: any) => urlForImage(i)).filter(Boolean) as string[],
    syncedAt: s.syncedAt,
    edit: s.edit
      ? {
          slug: s.edit.slug,
          title: s.edit.title,
          issueNumber: s.edit.issueNumber,
          cover: s.edit.cover ? urlForImage(s.edit.cover) : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products: (s.edit.products ?? []).filter(Boolean).map((p: any) => ({
            slug: p.slug, brand: p.brand ?? "", name: p.name ?? "", price: p.price ?? 0,
            currency: p.currency ?? "EUR", image: p.image ? urlForImage(p.image) : null,
          })),
        }
      : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDraft = (d: any): Draft => ({
  _id: d._id,
  format: d.format,
  status: d.status,
  content: safeJson(d.content),
  note: d.note ?? null,
  sourceCode: d.sourceCode,
  createdAt: d.createdAt,
  decidedAt: d.decidedAt ?? null,
  decidedBy: d.decidedBy ?? null,
  version: d.version ?? 1,
  generatedBy: d.generatedBy ?? "engine",
});

function safeJson(s: unknown): Record<string, unknown> {
  if (typeof s !== "string") return {};
  try { return JSON.parse(s); } catch { return {}; }
}

export async function listDrafts(): Promise<Draft[]> {
  const rows = await fetchLive<unknown[]>(`*[_type == "engineDraft"] | order(createdAt desc)`);
  return rows.map(toDraft);
}

export async function getDraft(id: string): Promise<Draft | null> {
  const d = await fetchLive<unknown>(`*[_type == "engineDraft" && _id == $id][0]`, { id });
  return d ? toDraft(d) : null;
}

export async function createDraft(d: { format: Format; content: object; sourceCode: string; version?: number }) {
  const doc = await client.create({
    _id: `engineDraft.${crypto.randomUUID()}`,
    _type: "engineDraft",
    format: d.format,
    status: "review",
    content: JSON.stringify(d.content),
    sourceCode: d.sourceCode,
    createdAt: new Date().toISOString(),
    version: d.version ?? 1,
    generatedBy: "engine",
  });
  return toDraft(doc);
}

export async function updateDraft(id: string, set: Partial<{ status: Status; note: string | null; decidedBy: string | null; content: object }>) {
  const patch: Record<string, unknown> = { ...set };
  if (set.content) patch.content = JSON.stringify(set.content);
  if (set.status) patch.decidedAt = new Date().toISOString();
  return toDraft(await client.patch(id).set(patch).commit());
}

// AEO citation tracker: one doc, results keyed "<questionId>|<engine>|<YYYY-MM>".
export async function getCitations(): Promise<Record<string, string>> {
  const d = await fetchLive<{ results?: { k: string; v: string }[] } | null>(`*[_id == "engineAeo.citations"][0]`);
  return Object.fromEntries((d?.results ?? []).map((r) => [r.k, r.v]));
}

export async function setCitation(k: string, v: string) {
  const current = await getCitations();
  current[k] = v;
  const results = Object.entries(current).map(([key, val]) => ({ _key: key.replace(/[^a-zA-Z0-9]/g, "_"), k: key, v: val }));
  await client.createOrReplace({ _id: "engineAeo.citations", _type: "engineAeo", results });
}

export async function getShowcase(): Promise<{ reel: string | null; poster: string | null }> {
  const d = await fetchLive<{ reel?: string; poster?: string } | null>(
    `*[_id == "engineShowcase.phase3"][0]{ "reel": reel.asset->url, "poster": poster.asset->url }`
  );
  return { reel: d?.reel ?? null, poster: d?.poster ?? null };
}
