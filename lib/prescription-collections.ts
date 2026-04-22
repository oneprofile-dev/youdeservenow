import type { Product } from "./products";

/** Curated themes that map real catalogue items to emotional intents (not separate verticals). */
export type CollectionId = "couples-rest" | "wind-down-sleep" | "reset-energy";

export interface PrescriptionCollectionDef {
  id: CollectionId;
  emoji: string;
  title: string;
  subtitle: string;
  /** Matched against product keywords, name, category (substring, lowercase). */
  keywordHints: string[];
  /** Small boost when category matches (still requires keyword overlap or fallback). */
  categoriesHint?: string[];
}

export const PRESCRIPTION_COLLECTIONS: PrescriptionCollectionDef[] = [
  {
    id: "couples-rest",
    emoji: "💞",
    title: "Partners & closeness",
    subtitle: "Comfort-first picks when the win is shared downtime—not another gadget pile.",
    keywordHints: [
      "cozy",
      "comfort",
      "sleep",
      "bedroom",
      "warm",
      "massage",
      "rest",
      "relax",
      "couple",
      "together",
      "hot",
      "cold",
      "blanket",
      "stress",
    ],
    categoriesHint: ["comfort", "selfcare"],
  },
  {
    id: "wind-down-sleep",
    emoji: "🌙",
    title: "Wind-down & sleep",
    subtitle: "For screen-fatigue days and nights when your brain will not stop tabulating.",
    keywordHints: [
      "sleep",
      "tired",
      "exhausted",
      "eye",
      "strain",
      "screen",
      "night",
      "late",
      "stress",
      "headache",
      "rest",
      "routine",
      "reset",
    ],
    categoriesHint: ["selfcare", "comfort"],
  },
  {
    id: "reset-energy",
    emoji: "⚡",
    title: "Morning & momentum",
    subtitle: "Small upgrades that reward showing up—commutes, desks, and meals that actually happen.",
    keywordHints: [
      "morning",
      "coffee",
      "work",
      "office",
      "productivity",
      "commute",
      "routine",
      "desk",
      "walk",
      "fitness",
      "meal",
      "lunch",
      "coding",
      "travel",
    ],
    categoriesHint: ["kitchen", "tech", "fitness"],
  },
];

function scoreProduct(product: Product, def: PrescriptionCollectionDef): number {
  let score = 0;
  const blob = [...product.keywords, product.name, product.category].join(" ").toLowerCase();

  for (const hint of def.keywordHints) {
    if (blob.includes(hint)) {
      score += 2;
    }
  }

  if (def.categoriesHint?.includes(product.category)) {
    score += 1;
  }

  return score;
}

/**
 * Top sample products for a theme; falls back to category hints so the UI never renders empty.
 */
export function getProductsForCollection(
  products: Product[],
  def: PrescriptionCollectionDef,
  limit = 3
): Product[] {
  const scored = products.map((p) => ({
    product: p,
    score: scoreProduct(p, def),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.product.id.localeCompare(b.product.id);
  });

  const positive = scored.filter((s) => s.score > 0);
  const pool = positive.length >= limit ? positive : scored;

  return pool.slice(0, limit).map((s) => s.product);
}
