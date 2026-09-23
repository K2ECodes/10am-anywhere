import type { Metadata } from "next";
import EditGrid from "@/components/EditGrid";
import { getSearchProducts } from "@/lib/content";

export const metadata: Metadata = { title: "Search · 10am" };

// Read live so newly added products are searchable the moment they publish.
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const ql = q.toLowerCase();
  const all = q ? await getSearchProducts() : [];
  const results = q
    ? all.filter(
        (p) =>
          (p.brand ?? "").toLowerCase().includes(ql) ||
          (p.name ?? "").toLowerCase().includes(ql) ||
          (p.category ?? "").toLowerCase().includes(ql) ||
          (p.department ?? "").toLowerCase().includes(ql)
      )
    : [];

  return (
    <>
      <header className="page-head">
        <div className="page-kicker">Search</div>
        <h1 className="page-title">{q || "Search"}</h1>
        <p className="page-dek">
          {q
            ? `${results.length} ${results.length === 1 ? "piece" : "pieces"}`
            : "Search the edit by brand, category, or piece."}
        </p>
      </header>

      {results.length > 0 ? (
        <EditGrid products={results} />
      ) : q ? (
        <div className="empty-edit">
          <p>Nothing matched &ldquo;{q}&rdquo;. Try a brand, a category, or a colour.</p>
        </div>
      ) : null}
    </>
  );
}
