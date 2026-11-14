// Silke's AI voice: a HeyGen Voice instant clone made on 2026-11-14 from her own
// English recordings (voice test plus the December reel takes, about 2 minutes).
// The id is not a secret; the HeyGen key is (HEYGEN_API_KEY, server only).
export const SILKE_VOICE_ID = "7987ae58c5c449c3bf675c70d934b40e";
export const MAX_CHARS = 1200;

export type Delivery = "calm" | "natural" | "lively";
export const DELIVERY: Record<Delivery, { label: string; boost: number; hint: string }> = {
  calm: { label: "Calm", boost: 0.4, hint: "Low and even, for slow, moody edits" },
  natural: { label: "Natural", boost: 0.75, hint: "How the December reel was voiced" },
  lively: { label: "Lively", boost: 1, hint: "More lift and play, for quick, funny cuts" },
};

export const VOICE_TIPS = [
  "Write it the way you would say it. Short sentences sound most like you.",
  "Full stops make pauses. “Every. Single. Year.” is read with a beat on each word.",
  "A question mark lifts the line at the end, a comma keeps it moving.",
  "One line per slide works best: generate each one, then lay them on the edit.",
];
