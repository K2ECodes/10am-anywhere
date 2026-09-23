"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase, supabaseEnabled } from "@/lib/supabase/client";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setReady(true);
    });
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  return (
    <>
      <header className="page-head">
        <div className="page-kicker">The 10am Club</div>
        <h1 className="page-title">Your account</h1>
        <p className="page-dek">No passwords. We send a link, you click it, you are in.</p>
      </header>

      <div className="account-wrap">
        {!supabaseEnabled ? (
          <p className="account-note">
            Accounts open at launch. Your wishlist is saved on this device in the meantime, the
            heart on any piece keeps it for you.
          </p>
        ) : !ready ? (
          <p className="account-note">One moment…</p>
        ) : userEmail ? (
          <div className="account-form">
            <p style={{ fontFamily: "'Bembo', serif", fontSize: 18, marginBottom: 20 }}>
              Signed in as {userEmail}.
            </p>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        ) : sent ? (
          <p className="account-note">Check your inbox. The link signs you straight in.</p>
        ) : (
          <form className="account-form" onSubmit={sendLink}>
            <label htmlFor="acc-email">Email</label>
            <input
              id="acc-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
            />
            <button type="submit">Send me a link</button>
            {error ? <p className="account-note">{error}</p> : null}
          </form>
        )}
      </div>
    </>
  );
}
