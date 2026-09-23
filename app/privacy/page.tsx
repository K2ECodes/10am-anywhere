import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy · 10am" };

// GDPR privacy policy scaffold. Final wording is reviewed by the client's legal
// counsel; bilingual (German primary) is added in a later pass.
export default function PrivacyPage() {
  return (
    <>
      <header className="page-head">
        <div className="page-kicker">Legal</div>
        <h1 className="page-title">Privacy</h1>
      </header>
      <section className="legal">
        <div className="prose-inner">
          <p>
            This policy explains what we collect, why, and the rights you hold under the GDPR. It is
            a working draft for legal review before launch.
          </p>

          <h2>Who is responsible</h2>
          <p>10am anywhere UG (haftungsbeschränkt), info@10amanywhere.com. See the Imprint for full details.</p>

          <h2>What we collect</h2>
          <p>
            Account email and name when you join the 10am Club. Items you save to your wishlist.
            Anonymised affiliate click data (which product, when, from which page) so we understand
            what readers respond to. Cookie-free analytics where possible.
          </p>

          <h2>Why</h2>
          <p>
            To send the newsletter you asked for, to keep your wishlist, and to understand which
            pieces resonate. We never sell your data.
          </p>

          <h2>Cookies and consent</h2>
          <p>
            Essential cookies keep the site working. Analytics and marketing cookies stay off until
            you accept them in the consent banner. You can change your choice at any time from the
            footer.
          </p>
          <p>
            When you accept marketing, we use the Meta (Facebook) Pixel to measure visits and
            newsletter sign-ups so we can understand how the site is found and improve it. It loads
            only after you accept, and never before. If you decline, it is not loaded at all.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access, correction, deletion, or export of your data, and you may
            withdraw consent at any time. To delete your account, write to info@10amanywhere.com;
            we remove your account and wishlist and anonymise any remaining click data.
          </p>

          <h2>Processors</h2>
          <p>
            We use Sanity (content), Supabase (accounts and data), Resend (email), and Vercel
            (hosting). Each processes data on our instructions under a data processing agreement.
          </p>
        </div>
      </section>
    </>
  );
}
