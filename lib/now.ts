// Server clock. In local development FAKE_NOW (an ISO time) moves it, to check
// time-limited things such as the promotion banner before they start. The clock
// still ticks from that point. Ignored in production.
const fake = process.env.NODE_ENV !== "production" && process.env.FAKE_NOW ? Date.parse(process.env.FAKE_NOW) : NaN;
const boot = Date.now();

export function nowMs(): number {
  return Number.isFinite(fake) ? fake + (Date.now() - boot) : Date.now();
}
