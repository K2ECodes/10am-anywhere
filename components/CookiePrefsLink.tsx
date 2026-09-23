"use client";

// Reopens the consent banner from the footer.
export default function CookiePrefsLink() {
  return (
    <a
      role="button"
      tabIndex={0}
      onClick={() => window.dispatchEvent(new Event("open-consent"))}
      onKeyDown={(e) => {
        if (e.key === "Enter") window.dispatchEvent(new Event("open-consent"));
      }}
    >
      Cookies
    </a>
  );
}
