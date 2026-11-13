import { cookies } from "next/headers";
import { MEMBER_COOKIE } from "./member-cookie";

// Travel and Culture are members-only: visible once the reader has subscribed to
// the newsletter, or entered an email that is already on the list (both set the
// members cookie via /api/members). Server components call this to decide
// whether to render the content or the gate.
export function isSubscribed(): boolean {
  return cookies().get(MEMBER_COOKIE)?.value === "1";
}
