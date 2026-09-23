import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Studio · 10am", robots: { index: false } };

// Sends editors to the hosted Sanity Studio. Set NEXT_PUBLIC_SANITY_STUDIO_URL
// to the deployed Studio (e.g. https://10am.sanity.studio). Until then this page
// explains how to stand it up (see /studio/README.md in the repo).
export default function StudioRedirect() {
  const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL;
  if (studioUrl) redirect(studioUrl);

  return (
    <>
      <header className="page-head">
        <div className="page-kicker">Editorial</div>
        <h1 className="page-title">The Studio</h1>
        <p className="page-dek">
          This is where the edit is published. The CMS opens here once the Sanity project is
          connected, see the studio folder in the project for setup. No code, ready in fifteen
          minutes per edit.
        </p>
      </header>
    </>
  );
}
