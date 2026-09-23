"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlodeskForm from "./FlodeskForm";
import { trackSearch } from "@/lib/track";

type OverlayName = "search" | "newsletter" | "menu" | null;

const CATEGORIES: [string, string][] = [
  ["Fashion", "/category/fashion"],
  ["Interior", "/category/interior"],
  ["Beauty", "/category/beauty"],
  ["Culture", "/category/culture"],
  ["Travel", "/category/travel"],
  ["Men", "/men"],
];
const POPULAR = ["Self-Portrait", "Khaite", "Diptyque", "Interior", "Trouser", "Men"];

export default function Nav({ edits = [] }: { edits?: { title: string; slug: string }[] }) {
  const [overlay, setOverlay] = useState<OverlayName>(null);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  function runSearch(q: string) {
    const term = q.trim();
    if (!term) return;
    trackSearch(term);
    setOverlay(null);
    setSearchValue("");
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  useEffect(() => {
    document.body.classList.toggle("is-locked", overlay !== null);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOverlay(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [overlay]);

  // The footer's Subscribe box opens this overlay via a window event.
  useEffect(() => {
    function openSub() {
      setOverlay("newsletter");
    }
    window.addEventListener("open-subscribe", openSub);
    return () => window.removeEventListener("open-subscribe", openSub);
  }, []);

  return (
    <>
      <div className="topbar">
        <span className="topbar-text">Curated. Inspired. Yours</span>
        <button type="button" className="topbar-sub" onClick={() => setOverlay("newsletter")}>
          Subscribe
        </button>
      </div>
      <nav className="nav">
        <div className="nav-row">
          <div className="nav-left">
            <button
              type="button"
              className="nav-menu"
              onClick={() => setOverlay("menu")}
              aria-label="Open menu"
            >
              <span className="nav-menu-icon">
                <span />
                <span />
                <span />
              </span>
              <span>Menu</span>
            </button>
          </div>
          <div className="logo">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/10am_logo.png" alt="10am" />
            </Link>
          </div>
          <div className="nav-right">
            <Link href="/wishlist">Wishlist</Link>
            <button
              type="button"
              className="nav-icon nav-iconbtn"
              onClick={() => setOverlay("search")}
              aria-label="Search"
            >
              ⌕
            </button>
            <span className="nav-icon" aria-hidden="true">
              ◯
            </span>
          </div>
        </div>
        <div className="nav-cats">
          {CATEGORIES.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* SEARCH */}
      <Overlay open={overlay === "search"} label="Search" onClose={() => setOverlay(null)}>
        <div className="overlay-eyebrow">search the edit</div>
        <h2 className="overlay-title">
          <em>
            What are you
            <br />
            looking for?
          </em>
        </h2>
        <form
          className="search-input-wrap"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(searchValue);
          }}
        >
          <button type="submit" className="icon" aria-label="Search">⌕</button>
          <input
            className="search-input"
            type="text"
            placeholder="A linen dress, a Murano lamp, a fragrance for July…"
            autoComplete="off"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
        <div className="search-suggest">
          <span className="search-suggest-label">Popular</span>
          {POPULAR.map((p) => (
            <a key={p} onClick={() => runSearch(p)}>
              {p}
            </a>
          ))}
        </div>
      </Overlay>

      {/* NEWSLETTER — same shortened message as the auto popup */}
      <Overlay open={overlay === "newsletter"} label="Join the 10am Club" className="subpop" onClose={() => setOverlay(null)}>
        <div className="overlay-eyebrow">the 10am club</div>
        <h2 className="overlay-title">
          <em>Welcome to the 10am Club.</em>
        </h2>
        <p className="subpop-line">Join for curated pieces and luxe recommendations.</p>
        <FlodeskForm />
      </Overlay>

      {/* MENU */}
      <Overlay open={overlay === "menu"} label="Menu" onClose={() => setOverlay(null)}>
        <div className="overlay-eyebrow">10am, anywhere</div>
        <div className="menu-grid">
          <div className="menu-col">
            <div className="menu-col-title">What We Love</div>
            {CATEGORIES.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOverlay(null)}>
                {label}
              </Link>
            ))}
          </div>
          <div className="menu-col">
            <div className="menu-col-title">What We Shop</div>
            {edits.map((e) => (
              <Link key={e.slug} href={`/edit/${e.slug}`} onClick={() => setOverlay(null)}>
                {e.title}
              </Link>
            ))}
          </div>
          <div className="menu-col">
            <div className="menu-col-title">10am</div>
            <div className="menu-sub">
              <Link href="/the-editors" onClick={() => setOverlay(null)}>The founders</Link>
              <Link href="/account" onClick={() => setOverlay(null)}>Account</Link>
              <a href="/10am-media-pack.pdf" target="_blank" rel="noopener noreferrer">Media Pack</a>
              <a href="mailto:info@10amanywhere.com">Contact</a>
            </div>
          </div>
          <div className="menu-feature">
            <div>
              <div className="club-badge" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/10am_logo.png" alt="" />
              </div>
              <div className="menu-feature-eyebrow">membership, on the house</div>
              <h3>
                Join the
                <br />
                10am Club.
              </h3>
              <p>Free to join. City guides, members-only edits, and the full archive.</p>
            </div>
            <button type="button" onClick={() => setOverlay("newsletter")}>
              Join the Club
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
}

function Overlay({
  open,
  label,
  onClose,
  children,
  className = "",
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overlay${className ? " " + className : ""}${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="overlay-panel">
        <button className="overlay-close" onClick={onClose} aria-label="Close">
          Close ×
        </button>
        {children}
      </div>
    </div>
  );
}
