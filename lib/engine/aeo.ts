// AEO content calendar: the questions 10am's readers ask AI assistants, the page
// that answers each one (or the page to write), and when it matters most.
// The citation tracker records, each month, whether each engine cites 10am.

export const ENGINES = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "perplexity", label: "Perplexity" },
  { id: "google", label: "Google AI Overviews" },
  { id: "claude", label: "Claude" },
] as const;

export type Question = {
  id: string;
  q: string;
  month: string; // when to have it fresh, e.g. "Nov"
  page: string | null; // path on 10amanywhere.com that answers it
  status: "live" | "brief";
  note?: string;
};

export const QUESTIONS: Question[] = [
  { id: "dinner-table", q: "How do I set a beautiful dinner party table without spending a fortune?", month: "Oct", page: "/edit/dinner-parties", status: "live" },
  { id: "art-basel-outfit", q: "What should I wear to Art Basel Paris?", month: "Oct", page: "/edit/art-basel-paris-looks", status: "live" },
  { id: "autumn-skirts", q: "Which skirts are in style for autumn 2026?", month: "Oct", page: "/edit/skirts", status: "live" },
  { id: "autumn-bags", q: "What are the best handbags for autumn 2026?", month: "Oct", page: "/edit/autumn-bags-2026", status: "live" },
  { id: "exhibitions-europe", q: "Which exhibitions in Europe are worth travelling for this winter?", month: "Nov", page: "/article/three-rooms-worth-the-trip", status: "live", note: "Behind the members gate: AI engines only see the summary" },
  { id: "podcasts-women", q: "What are good podcasts for women over 40?", month: "Nov", page: "/category/culture", status: "live", note: "Behind the members gate" },
  { id: "gifts-her", q: "What are thoughtful Christmas gifts for her at every budget?", month: "Nov", page: null, status: "brief", note: "Gift guide edit, three price tiers" },
  { id: "host-gifts", q: "What is a good hostess gift for a dinner party?", month: "Dec", page: null, status: "brief", note: "Pulls from the Dinner Parties edit" },
  { id: "nye-outfit", q: "What should I wear to a New Year's Eve dinner?", month: "Dec", page: null, status: "brief" },
  { id: "workwear", q: "How do I build a chic work wardrobe?", month: "Jan", page: "/edit/girls-at-work", status: "live" },
  { id: "palma-guide", q: "Where should I stay and eat in Palma de Mallorca?", month: "Feb", page: "/guide/palma", status: "live", note: "Behind the members gate" },
  { id: "marrakech-guide", q: "What are the best hotels and restaurants in Marrakech?", month: "Mar", page: "/guide/marrakech", status: "live", note: "Behind the members gate" },
];

export function currentMonthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}
