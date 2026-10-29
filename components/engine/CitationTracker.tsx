"use client";

import { useState } from "react";

const OPTIONS = [
  { v: "", label: "Not checked" },
  { v: "cited", label: "Cited with link" },
  { v: "mentioned", label: "Mentioned" },
  { v: "absent", label: "Not there" },
];

export default function CitationTracker({
  questions,
  engines,
  month,
  initial,
}: {
  questions: { id: string; q: string }[];
  engines: { id: string; label: string }[];
  month: string;
  initial: Record<string, string>;
}) {
  const [results, setResults] = useState(initial);
  const label = new Date(month + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  async function save(key: string, value: string) {
    setResults((r) => ({ ...r, [key]: value }));
    await fetch("/api/engine/citations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  }

  const cells = questions.flatMap((q) => engines.map((e) => results[`${q.id}|${e.id}|${month}`] ?? ""));
  const checked = cells.filter(Boolean).length;
  const cited = cells.filter((v) => v === "cited" || v === "mentioned").length;

  return (
    <>
      <div className="eng-toolbar">
        <span className="eng-meta" style={{ margin: 0 }}>{label}</span>
        <span className="eng-pill info">
          {checked ? `${cited} of ${checked} checks show 10am` : "Baseline check due this month"}
        </span>
      </div>
      <div className="eng-table-wrap">
        <table className="eng-table">
          <thead>
            <tr>
              <th>Question</th>
              {engines.map((e) => <th key={e.id}>{e.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td style={{ minWidth: 260 }}>{q.q}</td>
                {engines.map((e) => {
                  const key = `${q.id}|${e.id}|${month}`;
                  return (
                    <td key={e.id}>
                      <select value={results[key] ?? ""} onChange={(ev) => save(key, ev.target.value)} aria-label={`${e.label}: ${q.q}`}>
                        {OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
