// Silke's AI voice: a HeyGen Voice instant clone made on 2026-11-14 from her own
// English recordings (voice test plus the December reel takes, about 2 minutes).
// The id is not a secret; the HeyGen key is (HEYGEN_API_KEY, server only).
export const SILKE_VOICE_ID = "7987ae58c5c449c3bf675c70d934b40e";

// Voices the studio offers: Silke's clone, plus a stock HeyGen voice with an easy,
// conversational read for when a reel wants a presenter rather than one of you.
export type VoiceKey = "silke" | "joanna";
export const VOICES: Record<VoiceKey, { label: string; id: string; note: string }> = {
  silke: { label: "Silke", id: SILKE_VOICE_ID, note: "Cloned from Silke's recordings" },
  joanna: { label: "Joanna", id: "776f9d2ff401499a8f1f2bcb4ca46004", note: "Stock voice, warm and chatty" },
};
export const MAX_CHARS = 1200;

export type Delivery = "calm" | "natural" | "lively";
export const DELIVERY: Record<Delivery, { label: string; boost: number; hint: string }> = {
  calm: { label: "Calm", boost: 0.4, hint: "Low and even, for slow, moody edits" },
  natural: { label: "Natural", boost: 0.7, hint: "A straight, easy read" },
  lively: { label: "Chatty", boost: 1, hint: "Like talking to a friend. How the December reel was voiced" },
};

export const VOICE_TIPS = [
  "Write it the way you would tell a friend. A throwaway aside lands better than a big setup: “ideally with a martini in it”.",
  "Commas keep it flowing. Save full stops for where you really want a beat, or it starts to sound like a performance.",
  "Keep it short, around 15 words a slide. The December reel is 90 words in about 30 seconds.",
  "Write the whole reel as one piece and generate it in one go. One take flows better than lines stitched together.",
];
