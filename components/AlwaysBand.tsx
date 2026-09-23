"use client";

import { useEffect, useState } from "react";
import type { ClockCity } from "@/lib/types";

// "Always 10am somewhere" band with live timezone clocks. The city closest to
// 10:00 local is highlighted. Client component: it reads the wall clock.
export default function AlwaysBand({ cities }: { cities: ClockCity[] }) {
  const [times, setTimes] = useState<string[]>(() => cities.map(() => "··"));
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    function update() {
      const now = new Date();
      let bestIdx = 0;
      let bestDiff = Infinity;
      const next = cities.map((c, i) => {
        const parts = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: c.tz,
        }).formatToParts(now);
        const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
        const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
        const minutes = parseInt(hh, 10) * 60 + parseInt(mm, 10);
        let diff = Math.abs(minutes - 10 * 60);
        diff = Math.min(diff, 24 * 60 - diff);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = i;
        }
        return `${hh}:${mm}`;
      });
      setTimes(next);
      setActiveIdx(bestIdx);
    }
    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, [cities]);

  return (
    <section className="always-band">
      <div className="always-band-kicker">a 10am ritual</div>
      <h2>
        Always <em>10am</em>
        <br />
        somewhere.
      </h2>
      <p className="always-band-tag">
        The first coffee of the day. The hour your laptop is open before the world arrives. The
        window we built this for. When shopping becomes a small, considered pleasure, and the cart
        fills the way a well-kept wardrobe should.
      </p>
      <div className="always-clocks">
        {cities.map((c, i) => (
          <div key={c.tz} className={`clock${i === activeIdx ? " is-active" : ""}`}>
            <div className="clock-city">{c.city}</div>
            <div className="clock-time">{times[i]}</div>
            <div className="clock-meta">{c.abbr}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
