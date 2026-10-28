import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EditGrid from "@/components/EditGrid";
import NewsletterGate from "@/components/NewsletterGate";
import { isSubscribed } from "@/lib/newsletter-gate";
import { getArticleBySlug } from "@/lib/content";
import { JsonLd, SITE_URL, breadcrumbs } from "@/lib/seo";
import type { Article } from "@/lib/types";

function articleLd(a: Article, gated: boolean) {
  const url = `${SITE_URL}/article/${a.slug}`;
  return [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: a.title,
      description: a.dek || undefined,
      image: a.heroImage || undefined,
      articleSection: a.category,
      author: a.author ? { "@type": "Person", name: a.author } : { "@id": `${SITE_URL}/#org` },
      publisher: { "@id": `${SITE_URL}/#org` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en",
      // The section headings tell answer engines what the story covers even
      // where the full text is members-only.
      about: a.sections.filter((s) => s.heading).map((s) => ({ "@type": "Thing", name: s.heading })),
      isAccessibleForFree: !gated,
      ...(gated ? { hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: ".nl-gate" } } : {}),
    },
    breadcrumbs([{ name: "10am", path: "/" }, { name: a.category, path: `/category/${a.category.toLowerCase()}` }, { name: a.title, path: `/article/${a.slug}` }]),
  ];
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getArticleBySlug(params.slug);
  if (!a) return { title: "10am" };
  return {
    title: `${a.title} · 10am`,
    description: a.dek || undefined,
    alternates: { canonical: `/article/${params.slug}` },
    openGraph: { type: "article", title: a.title, description: a.dek || undefined, url: `/article/${params.slug}`, images: a.heroImage ? [a.heroImage] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  // Culture articles are members-only, matching the gated Culture section.
  if (article.category.toLowerCase() === "culture" && !isSubscribed()) {
    return (
      <>
        <JsonLd data={articleLd(article, true)} />
        <NewsletterGate section="Culture" />
      </>
    );
  }

  return (
    <article>
      <JsonLd data={articleLd(article, false)} />
      <header className="page-head page-narrow" style={{ textAlign: "center" }}>
        <div className="page-kicker">{article.category} · A 10am editorial</div>
        <h1 className="page-title" dangerouslySetInnerHTML={{ __html: article.titleHtml }} />
        <p className="page-dek" style={{ marginInline: "auto" }}>{article.dek}</p>
      </header>

      {article.heroImage ? (
        <figure className="article-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.heroImage} alt={article.title} />
        </figure>
      ) : null}

      <div className="article-meta">
        <span>{article.author}</span>
        <span>{article.date}</span>
        <span>{article.readingTime}</span>
      </div>

      {article.body.length > 0 ? (
        <div className="prose">
          <div className="prose-inner">
            {article.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      ) : null}

      {article.sections.length > 0 ? (
        <div className="article-sections">
          {article.sections.map((s, i) => (
            <section key={i} className="art-sec">
              {s.image ? (
                <figure className="art-sec-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.heading} loading="lazy" />
                </figure>
              ) : null}
              <div className="art-sec-body">
                {s.kicker ? <div className="art-sec-kicker">{s.kicker}</div> : null}
                {s.heading ? <h2 className="art-sec-heading">{s.heading}</h2> : null}
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {s.links.length > 0 ? (
                  <div className="art-sec-links">
                    {s.links.map((l, k) => (
                      <a
                        key={k}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="art-sec-link"
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {article.shopThisStory.length > 0 ? (
        <section className="shop-rail">
          <div className="shop-rail-head">Shop this story</div>
          <EditGrid products={article.shopThisStory} />
        </section>
      ) : null}
    </article>
  );
}
