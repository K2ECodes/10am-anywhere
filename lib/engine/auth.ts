// Cookie value for the engine's shared team password: a hash of ENGINE_PASSWORD,
// so the password itself is never stored in the browser. Edge- and Node-safe.
export async function engineToken(): Promise<string> {
  const pw = process.env.ENGINE_PASSWORD;
  if (!pw) return "unset:" + crypto.randomUUID(); // no password configured: nobody gets in
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("10am-engine:" + pw));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
