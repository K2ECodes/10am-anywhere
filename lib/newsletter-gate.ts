import { cookies } from "next/headers";

// Travel and Culture are members-only: visible once the reader has subscribed to
// the newsletter (which sets the `nl_ok` cookie in the subscribe action). Server
// components call this to decide whether to render the content or the gate.
export function isSubscribed(): boolean {
  return cookies().get("nl_ok")?.value === "1";
}
