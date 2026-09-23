import { createClient } from "@sanity/client";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01",
};

// True only once the client has created a Sanity project and set the env vars.
export const sanityEnabled = Boolean(sanityConfig.projectId);

// useCdn: false so a just-published edit is read live from the API, not from the
// CDN's cached copy. Combined with `revalidate` on the reading pages, a product
// published in the Studio appears on the site within seconds, not at next build.
// Server-side read token. The dataset's public (tokenless) read role can read
// products, edits and guides but NOT `article` documents, so without a token the
// culture/editorial articles are invisible and the pages silently fall back to
// seed data. queries.ts is only ever imported from server components, and this is
// not a NEXT_PUBLIC_ var, so the token never reaches the browser bundle. Prefer a
// dedicated read (Viewer) token; fall back to the write token already in the env.
const readToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN || undefined;

const _client = sanityEnabled
  ? createClient({
      ...sanityConfig,
      useCdn: false,
      perspective: "published",
      token: readToken,
    })
  : null;

// Force every read to bypass Next.js's fetch cache, so newly published or edited
// content appears on the force-dynamic pages immediately. Without this a stale
// fetch snapshot can persist across requests (e.g. products cached before their
// slugs were set, which rendered every product link as /go/null).
if (_client) {
  const orig = _client.fetch.bind(_client);
  _client.fetch = ((query: string, params?: Record<string, unknown>, options?: Record<string, unknown>) =>
    orig(query, params as never, { cache: "no-store", ...(options ?? {}) } as never)) as typeof _client.fetch;
}

export const sanityClient = _client;
