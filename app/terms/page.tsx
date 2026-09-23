import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms · 10am" };

export default function TermsPage() {
  return (
    <>
      <header className="page-head">
        <div className="page-kicker">Legal</div>
        <h1 className="page-title">Terms of use</h1>
      </header>
      <section className="legal">
        <div className="prose-inner">
          <p>By using 10amanywhere.com you agree to these terms. A working draft for legal review.</p>

          <h2>The edit</h2>
          <p>
            10am is an editorial publication. We do not sell products. Every product card links to a
            third-party retailer, and any purchase is a contract between you and that retailer on
            their terms.
          </p>

          <h2>Affiliate links</h2>
          <p>
            We earn a commission on some purchases made through our links. This never affects what
            we choose to feature.
          </p>

          <h2>Prices and availability</h2>
          <p>
            Prices and stock are set by the retailer and can change at any time. We make every
            effort to keep the edit current but cannot guarantee a piece is still available.
          </p>

          <h2>Accounts</h2>
          <p>
            You are responsible for the email address you use to join. Keep it current so you can
            access your wishlist and the newsletter.
          </p>

          <h2>Contact</h2>
          <p>info@10amanywhere.com</p>
        </div>
      </section>
    </>
  );
}
