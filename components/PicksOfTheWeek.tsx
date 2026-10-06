"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { trackAffiliateClick } from "@/lib/track";

// "Our Picks of the Week": a coloured band with a script headline and a white
// square that shows three products one after another, in a loop. Each product
// links out through /go like every other card. The loop pauses while the reader
// hovers or focuses it, and stays still for anyone who prefers reduced motion
// (the dots remain, so every pick is still reachable).
export default function PicksOfTheWeek({
  title,
  seconds,
  products,
}: {
  title: string;
  seconds: number;
  products: Product[];
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const n = products.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (n < 2 || paused || reduced) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), Math.max(500, seconds * 1000));
    return () => clearInterval(t);
  }, [n, paused, reduced, seconds]);

  if (n === 0) return null;
  const active = products[i];

  return (
    <section className="picks" aria-label={title}>
      <div className="picks-inner">
        <h2 className="picks-title">{title}</h2>

        <div
          className="picks-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <a
            className="picks-square"
            href={`/go/${active.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            aria-label={`${active.brand} ${active.name}, ${formatPrice(active.price, active.currency)}`}
            onClick={() => trackAffiliateClick(active)}
          >
            {products.map((p, idx) =>
              p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.slug}
                  src={p.image}
                  alt=""
                  className={`picks-img${idx === i ? " is-active" : ""}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              ) : (
                <span key={p.slug} className={`picks-img picks-ph${idx === i ? " is-active" : ""}`}>
                  10am
                </span>
              )
            )}
          </a>

          <div className="picks-meta" aria-live="off">
            <div className="ec-brand">{active.brand}</div>
            <div className="ec-name">{active.name}</div>
            <div className="ec-price">{formatPrice(active.price, active.currency)}</div>
          </div>

          {n > 1 ? (
            <div className="picks-dots">
              {products.map((p, idx) => (
                <button
                  key={p.slug}
                  type="button"
                  className={`ecar-dot${idx === i ? " is-active" : ""}`}
                  aria-label={`Show ${p.brand} ${p.name}`}
                  aria-current={idx === i}
                  onClick={() => setI(idx)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
