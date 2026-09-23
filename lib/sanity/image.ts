import imageUrlBuilder from "@sanity/image-url";
import { sanityClient, sanityConfig } from "./client";

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

// Returns a CDN url for a Sanity image, or null when Sanity is not configured.
// `source` is a Sanity image object/ref; typed loosely to avoid coupling to the
// package's internal type path.
export function urlForImage(source: unknown): string | null {
  if (!builder || !sanityConfig.projectId) return null;
  return builder.image(source as never).auto("format").fit("max").url();
}
