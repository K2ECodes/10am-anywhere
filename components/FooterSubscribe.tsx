"use client";

// Subscribe box in the footer. Opens the newsletter overlay (owned by Nav) via a
// window event, so we keep the full Flodesk form out of the cramped footer column.
export default function FooterSubscribe() {
  return (
    <button
      type="button"
      className="footer-sub-btn"
      onClick={() => window.dispatchEvent(new CustomEvent("open-subscribe"))}
    >
      Subscribe
    </button>
  );
}
