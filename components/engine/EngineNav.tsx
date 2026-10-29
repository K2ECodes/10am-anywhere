"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/engine", label: "Overview" },
  { href: "/engine/aeo", n: "01", label: "AEO" },
  { href: "/engine/content", n: "02", label: "Content Engine" },
  { href: "/engine/growth", n: "03", label: "Growth Engine" },
];

export default function EngineNav() {
  const path = usePathname();
  if (path === "/engine/login") return null;
  return (
    <nav className="eng-nav">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={path === l.href ? "on" : undefined}>
          {l.n ? <b>{l.n}</b> : null}
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
