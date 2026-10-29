export default function EngineLogin({ searchParams }: { searchParams: { wrong?: string } }) {
  return (
    <form className="eng-login" method="post" action="/api/engine/login">
      <div className="eng-kicker">Private workspace</div>
      <h1 className="eng-h1">Welcome back.</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 16 }}>Enter the team password to open the 10am Engine.</p>
      <input type="password" name="password" placeholder="Team password" autoFocus required />
      {searchParams.wrong ? <p style={{ color: "#7A2A22", fontSize: 14, marginTop: 0 }}>That password didn&apos;t match.</p> : null}
      <button className="eng-btn" type="submit" style={{ width: "100%" }}>Open the engine</button>
    </form>
  );
}
