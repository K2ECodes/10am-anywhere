import Link from "next/link";
import FooterSubscribe from "./FooterSubscribe";
import AffiliateDisclosure from "./AffiliateDisclosure";
import CookiePrefsLink from "./CookiePrefsLink";

const SHOP: [string, string][] = [
  ["Fashion", "/category/fashion"],
  ["Interior", "/category/interior"],
  ["Beauty", "/category/beauty"],
  ["Culture", "/category/culture"],
  ["Travel", "/category/travel"],
  ["Men", "/men"],
];
const TENAM: [string, string][] = [
  ["The founders", "/the-editors"],
  ["Contact", "mailto:info@10amanywhere.com"],
];
const CARE: [string, string][] = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Imprint", "/imprint"],
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-sub">
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/10am_logo.png" alt="10am" />
          </div>
          <div className="footer-nl-label">the newsletter</div>
          <FooterSubscribe />
        </div>
        <div className="footer-links">
          <FooterCol title="Shop" links={SHOP} />
          <FooterCol title="10am" links={TENAM}>
            <a href="/10am-media-pack.pdf" target="_blank" rel="noopener noreferrer">
              Media Pack
            </a>
            <a
              className="footer-ig"
              href="https://www.instagram.com/10am_anywhere/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="10am on Instagram"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
              </svg>
            </a>
          </FooterCol>
          <FooterCol title="Care" links={CARE}>
            <CookiePrefsLink />
          </FooterCol>
        </div>
      </div>
      <AffiliateDisclosure />
      <div className="footer-bottom">
        <span>© 2026 10am · Berlin</span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  children,
}: {
  title: string;
  links: [string, string][];
  children?: React.ReactNode;
}) {
  return (
    <div className="footer-col">
      <div className="footer-col-title">{title}</div>
      {links.map(([label, href]) =>
        href.startsWith("/") ? (
          <Link key={label + href} href={href}>
            {label}
          </Link>
        ) : (
          <a key={label + href} href={href}>
            {label}
          </a>
        )
      )}
      {children}
    </div>
  );
}
