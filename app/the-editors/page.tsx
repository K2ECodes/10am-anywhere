import type { Metadata } from "next";

export const metadata: Metadata = { title: "The founders · 10am" };

// The founders. A single editorial statement (no individual founder boxes) with
// the group portrait. Copy supplied verbatim by the client; the two em/en dashes
// in the original are rendered as commas per the no-dash house rule.
export default function TheEditorsPage() {
  return (
    <>
      <header className="page-head page-narrow" style={{ textAlign: "center" }}>
        <div className="page-kicker">Who we are</div>
        <h1 className="page-title" style={{ fontStyle: "italic" }}>
          The founders
        </h1>
      </header>

      <figure className="editors-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/editors.jpg" alt="The three founders of 10am anywhere" />
      </figure>

      <div className="prose">
        <div className="prose-inner editors-prose">
          <p>
            10am anywhere is a curated destination for those who appreciate style with substance.
            Founded by three women with backgrounds in fashion, design, and creative industries, the
            platform is built on a shared perspective: a discerning eye, an appreciation for quality,
            and an instinct for what feels relevant beyond the moment.
          </p>
          <p>
            We search widely and edit rigorously. From emerging niche labels to established houses,
            from attainable everyday finds to future heirlooms, every piece is selected for a reason.
            Not because it is trending, but because it has lasting appeal.
          </p>
          <p>
            We believe the era of dressing alike is over. The future of style is personal, shaped by
            individuality, curiosity, and the confidence to choose pieces that feel uniquely your own.
            Discovering niche brands, uncovering unexpected finds, and creating distinctive
            combinations is where we feel most at home.
          </p>
          <p>
            Our approach is guided by quality, craftsmanship, character, and a certain effortless
            coolness that cannot be manufactured. We believe the best pieces are the ones you return
            to season after season, objects that elevate everyday life without demanding attention.
          </p>
          <p className="editors-statement">10am anywhere is not about more. It is about better.</p>
          <p>
            A thoughtful edit of fashion, interiors, beauty, and lifestyle, chosen for those who value
            enduring style over passing trends.
          </p>

          <div className="founders-signoff">
            <p className="signoff-warm">Warmly,</p>
            <div className="signoff-row">
              <figure className="signoff">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sig-alexandra.png" alt="Alexandra Cukierman signature" />
                <figcaption>Alexandra Cukierman</figcaption>
              </figure>
              <figure className="signoff">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sig-corinna.png" alt="Corinna Möell signature" />
                <figcaption>Corinna Möell</figcaption>
              </figure>
              <figure className="signoff">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/sig-silke.png" alt="Silke Rumpelhardt signature" />
                <figcaption>Silke Rumpelhardt</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
