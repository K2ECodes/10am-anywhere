"use client";

import { useEffect, useState } from "react";
import type { PromoBanner as Banner } from "@/lib/types";

// Red promotion banner under the black top banner, styled after the campaign
// artwork (red ground, white italic serif, black tape strips). Counts down to the
// end time, then removes itself; appears by itself at the start time too.
// `serverNow` keeps the first client render identical to the server's.
const pad = (n: number) => String(n).padStart(2, "0");

export default function PromoBanner({ banner, serverNow }: { banner: Banner; serverNow: number }) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    // Keep time by the server's clock, not the visitor's (a phone set to the wrong
    // time would otherwise show the wrong countdown, or hide the banner).
    const skew = serverNow - Date.now();
    const tick = () => setNow(Date.now() + skew);
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [serverNow]);

  if (now < banner.start || now >= banner.end) return null;

  const left = Math.max(0, Math.floor((banner.end - now) / 1000));
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  const body = (
    <>
      <span className="promobar-text">{banner.text}</span>
      <span className="promobar-clock" role="timer" aria-label={`Ends in ${d} days ${h} hours ${m} minutes`}>
        <span className="promobar-ends">ends in</span>
        <span className="promobar-unit"><b>{d}</b>d</span>
        <span className="promobar-unit"><b>{pad(h)}</b>h</span>
        <span className="promobar-unit"><b>{pad(m)}</b>m</span>
        <span className="promobar-unit"><b>{pad(s)}</b>s</span>
      </span>
    </>
  );

  return banner.href ? (
    <a className="promobar" href={banner.href}>
      {body}
    </a>
  ) : (
    <div className="promobar">{body}</div>
  );
}
