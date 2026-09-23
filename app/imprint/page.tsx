import type { Metadata } from "next";

export const metadata: Metadata = { title: "Imprint · 10am" };

// Impressum, required by §5 TMG. Details provided by the client (10am anywhere UG).
// Registergericht inferred from the Berlin address (all Berlin HRB sit at AG
// Charlottenburg) — confirm with the client. VAT is applied for and added once issued.
export default function ImprintPage() {
  return (
    <>
      <header className="page-head">
        <div className="page-kicker">Legal</div>
        <h1 className="page-title">Imprint</h1>
      </header>
      <section className="legal">
        <div className="prose-inner">
          <h2>Information pursuant to §5 TMG</h2>
          <p>10am anywhere UG (haftungsbeschränkt)</p>
          <p>
            c/o Dacapo2 GmbH
            <br />
            Kurfürstendamm 196
            <br />
            10707 Berlin, Germany
          </p>

          <h2>Represented by</h2>
          <p>
            Geschäftsführung: Silke Rumpelhardt, Alexandra Cukierman, Corinna Möell
          </p>

          <h2>Contact</h2>
          <p>Email: info@10amanywhere.com</p>

          <h2>Registration</h2>
          <p>
            Registergericht: Amtsgericht Charlottenburg
            <br />
            Registernummer: HRB 283885 B
          </p>

          <h2>VAT</h2>
          <p>
            VAT identification number pursuant to §27a UStG: applied for, added here once issued.
          </p>

          <h2>Responsible for content</h2>
          <p>Silke Rumpelhardt, address as above.</p>

          <h2>Affiliate links</h2>
          <p>
            This site contains affiliate links. 10am earns a small commission on items purchased
            through these links. It never influences what we recommend.
          </p>
        </div>
      </section>
    </>
  );
}
