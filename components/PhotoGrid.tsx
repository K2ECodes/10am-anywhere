// A simple square photo grid (used for the Travel section and city guides).
export default function PhotoGrid({ photos, label }: { photos: string[]; label?: string }) {
  if (!photos.length) return null;
  return (
    <section className="photo-band">
      {label ? (
        <div className="photo-head">
          <div className="page-kicker">{label}</div>
        </div>
      ) : null}
      <div className="photo-grid">
        {photos.map((src, i) => (
          <figure className="photo-cell" key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  );
}
