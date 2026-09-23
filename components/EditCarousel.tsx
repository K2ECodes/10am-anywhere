"use client";

import { useState } from "react";
import type { Edit } from "@/lib/types";
import EditGrid from "./EditGrid";

// Homepage edit carousel: shows the latest edit (cover + product grid) and lets
// the reader toggle left/right between the two most recent edits.
export default function EditCarousel({ edits }: { edits: Edit[] }) {
  const [i, setI] = useState(0);
  if (!edits.length) return null;

  const active = edits[i];
  const many = edits.length > 1;
  const go = (d: number) => setI((p) => (p + d + edits.length) % edits.length);
  const cover = active.collage[0]?.image;
  const title = active.title.replace(/\n/g, " ");

  return (
    <div className="edit-carousel">
      <section className="hero hero-single edit-carousel-hero">
        {many ? (
          <button
            type="button"
            className="ecar-arrow ecar-prev"
            aria-label="Previous edit"
            onClick={() => go(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
        ) : null}

        {cover ? (
          <figure className="hero-single-img">
            {active.mobileCover ? (
              <picture>
                {/* Phone-only cover so a wide desktop collage doesn't shrink. */}
                <source media="(max-width: 768px)" srcSet={active.mobileCover} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={title} />
              </picture>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={title} />
            )}
          </figure>
        ) : null}

        {many ? (
          <button
            type="button"
            className="ecar-arrow ecar-next"
            aria-label="Next edit"
            onClick={() => go(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        ) : null}
      </section>

      {many ? (
        <div className="ecar-dots">
          {edits.map((e, idx) => (
            <button
              key={idx}
              type="button"
              className={`ecar-dot${idx === i ? " is-active" : ""}`}
              aria-label={`Show ${e.title.replace(/\n/g, " ")} edit`}
              aria-current={idx === i}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      ) : null}

      {/* Homepage shows one continuous grid per edit — grouped edits (Back to
          School, The New Naked) are flattened so all items flow together. */}
      <EditGrid
        products={
          active.sections && active.sections.length > 0
            ? active.sections.flatMap((s) => s.products)
            : active.products
        }
      />
    </div>
  );
}
