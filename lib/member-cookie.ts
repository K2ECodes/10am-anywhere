// The members cookie that unlocks Travel and Culture. Browsers cap cookie life at
// 400 days, so the middleware renews it on every visit: a member who comes back
// at least once a year never sees the gate again.
export const MEMBER_COOKIE = "nl_ok";
export const MEMBER_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
