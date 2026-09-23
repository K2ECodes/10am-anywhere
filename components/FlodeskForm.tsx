"use client";

import { useEffect, useId } from "react";

// Native Flodesk inline form. Runs Flodesk's own double opt-in -> confirm ->
// segment -> welcome flow, so the welcome email fires correctly (the only path
// that triggers the workflow — API segment adds do not). Supports multiple
// instances on one page via a unique container id per render.
const FORM_ID = "6aa0ae9d7f5858181ac2e7a0";

declare global {
  interface Window {
    fd?: (...args: unknown[]) => void;
    FlodeskObject?: string;
  }
}

export default function FlodeskForm() {
  const rawId = useId();
  const containerId = `fd-form-${FORM_ID}-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

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

  return <div id={containerId}></div>;
}
