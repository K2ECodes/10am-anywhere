// Homepage hero: a single self-contained edit poster (headline + models are
// baked into the image). Swap the image below to change the cover.
export default function Hero() {
  return (
    <section className="hero hero-single">
      <figure className="hero-single-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-vacation-essentials.jpg" alt="Vacation Essentials" />
      </figure>
    </section>
  );
}
