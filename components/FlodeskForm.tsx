"use client";

import { useEffect, useId, useRef, useState } from "react";

// Native Flodesk inline form. Runs Flodesk's own double opt-in -> confirm ->
// segment -> welcome flow, so the welcome email fires correctly (the only path
// that triggers the workflow — API segment adds do not). Supports multiple
// instances on one page via a unique container id per render.
//
// Every placement (homepage, menu, popup, members gate) also handles membership:
// before Flodesk sees an email we ask /api/members whether it is already on the
// list. A member is let straight in and Flodesk is never contacted, so nobody gets
// the opt-in or welcome email twice. A new email goes through Flodesk as normal
// and is unlocked once Flodesk shows its success state. Either way the page hears
// a "10am:member" event (the gate refreshes to show the content).
const FORM_ID = "6aa0ae9d7f5858181ac2e7a0";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MEMBER_EVENT = "10am:member";

declare global {
  interface Window {
    fd?: (...args: unknown[]) => void;
    FlodeskObject?: string;
  }
}

async function postMembers(body: object): Promise<boolean> {
  try {
    const r = await fetch("/api/members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return ((await r.json()) as { member?: boolean }).member === true;
  } catch {
    return false;
  }
}

export default function FlodeskForm() {
  const rawId = useId();
  const containerId = `fd-form-${FORM_ID}-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [welcomeBack, setWelcomeBack] = useState(false);

  useEffect(() => {
    // Inject the Flodesk universal script into the document once.
    const existingScript = document.querySelector('script[src*="flodesk"]');
    if (!existingScript) {
      /* eslint-disable */
      // prettier-ignore
      (function (w: any, d: any, t: any, h: any, s: any, n: any) {
        w.FlodeskObject = n;
        var fn = function () { (w[n].q = w[n].q || []).push(arguments); };
        w[n] = w[n] || fn;
        var f = d.getElementsByTagName(t)[0];
        var v = "?v=" + Math.floor(new Date().getTime() / (120 * 1000)) * 60;
        var sm = d.createElement(t); sm.async = true; sm.type = "module"; sm.src = h + s + ".mjs" + v;
        f.parentNode.insertBefore(sm, f);
        var sn = d.createElement(t); sn.async = true; sn.noModule = true; sn.src = h + s + ".js" + v;
        f.parentNode.insertBefore(sn, f);
      })(window, document, "script", "https://assets.flodesk.com", "/universal", "fd");
      /* eslint-enable */
    }

    // Render the form into this instance's container.
    window.fd?.("form", { formId: FORM_ID, containerEl: "#" + containerId });
  }, [containerId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let passThrough = false; // true only while we hand a new signup on to Flodesk
    let pendingEmail: string | null = null;
    let unlocked = false;

    const announce = () => {
      unlocked = true;
      window.dispatchEvent(new Event(MEMBER_EVENT));
    };

    // Flodesk obfuscates its field names, so the email is whichever field holds one.
    const typedEmail = () =>
      Array.from(el.querySelectorAll<HTMLInputElement>("input"))
        .map((i) => i.value.trim().toLowerCase())
        .find((v) => EMAIL_RE.test(v)) ?? null;

    // Runs in the capture phase, before Flodesk's own handlers. Pressing Enter
    // fires a click on the submit button too, so clicks cover both.
    const intercept = (e: Event) => {
      if (passThrough || unlocked) return;
      const form = el.querySelector("form");
      if (!form) return;
      if (e.type === "click") {
        const btn = (e.target as Element | null)?.closest("button");
        if (!btn || !form.contains(btn) || btn.type !== "submit") return;
      } else if (e.target !== form) {
        return;
      }
      const email = typedEmail();
      if (!email) return; // let Flodesk show its own validation
      e.preventDefault();
      e.stopImmediatePropagation();
      postMembers({ email }).then((member) => {
        if (member) {
          setWelcomeBack(true);
          announce();
          return;
        }
        // Not on the list yet: let this submission through to Flodesk.
        pendingEmail = email;
        passThrough = true;
        const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submit) submit.click();
        else form.requestSubmit();
        passThrough = false;
      });
    };

    // Flodesk accepted a new signup: unlock (optimistic, as the reader still
    // confirms through the opt-in email).
    const onChange = () => {
      if (unlocked || !pendingEmail) return;
      const success = el.querySelector('[data-ff-el="success"]') as HTMLElement | null;
      const root = el.querySelector('[data-ff-el="root"]');
      const isSuccess =
        (success && success.offsetParent !== null) || root?.getAttribute("data-ff-stage") === "success";
      if (!isSuccess) return;
      const email = pendingEmail;
      pendingEmail = null;
      postMembers({ email, joined: true, source: window.location.pathname }).then(announce);
    };

    el.addEventListener("click", intercept, true);
    el.addEventListener("submit", intercept, true);
    const obs = new MutationObserver(onChange);
    obs.observe(el, { subtree: true, childList: true, attributes: true });
    return () => {
      el.removeEventListener("click", intercept, true);
      el.removeEventListener("submit", intercept, true);
      obs.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="fd-wrap">
      <div id={containerId} hidden={welcomeBack}></div>
      {welcomeBack ? (
        <p className="fd-welcome-back">
          <em>Welcome back.</em> You are already on the list, so Travel and Culture are open to you.
        </p>
      ) : null}
    </div>
  );
}
