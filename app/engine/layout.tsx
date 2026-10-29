import type { Metadata } from "next";
import "./engine.css";
import EngineNav from "@/components/engine/EngineNav";

export const metadata: Metadata = {
  title: "10am Engine",
  robots: { index: false, follow: false },
};

export default function EngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="eng">
      <header className="eng-top">
        <a href="/engine" className="eng-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png?v=2" alt="10am" className="eng-logo" />
          <span>
            <span className="eng-brand-name">The 10am Engine</span>
            <br />
            <span className="eng-brand-sub">Built for 10am · Private workspace</span>
          </span>
        </a>
        <EngineNav />
      </header>
      <main className="eng-main">{children}</main>
    </div>
  );
}
