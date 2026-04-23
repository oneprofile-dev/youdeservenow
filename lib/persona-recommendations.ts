/**
 * Persona-Aware Product Recommendation Engine
 * Maps justifications to products that reinforce/enable the desired behavior
 * Creates satirical immersion by recommending items that "enable" the purchase
 */

export interface PersonaContext {
  keywords: string[];
  category: string;
  enablerItems: string[]; // Items that reinforce the behavior
  satire: string; // Playful framing
}

// Map keywords to persona contexts
const PERSONA_CONTEXTS: Record<string, PersonaContext> = {
  sleep: {
    keywords: ["nap", "sleep", "rest", "tired", "exhausted", "siesta", "slumber"],
    category: "Sleep & Comfort",
    enablerItems: [
      "Luxury Silk Sleep Mask",
      "Premium Blackout Curtains",
      "White Noise Machine",
      "Weighted Sleep Blanket",
      "Memory Foam Pillow",
      "Sleep Tech Tracker",
      "Aromatherapy Diffuser",
      "Do Not Disturb Sign",
    ],
    satire: "Every respectable nap deserves premium infrastructure",
  },
  productivity: {
    keywords: ["focus", "work", "productive", "hustle", "grind", "deadline", "deep work"],
    category: "Productivity & Focus",
    enablerItems: [
      "Blue Light Blocking Glasses",
      "Noise-Canceling Headphones",
      "Standing Desk",
      "Premium Mechanical Keyboard",
      "Monitor Arm",
      "Focus Timer App Subscription",
      "Ergonomic Mouse",
      "Task Management System",
    ],
    satire: "Maximum productivity requires maximum equipment",
  },
  snacking: {
    keywords: ["snack", "eat", "food", "hungry", "treat", "candy", "chips", "cookies"],
    category: "Food & Beverages",
    enablerItems: [
      "Mini Fridge for Desk",
      "Snack Subscription Box",
      "Gourmet Snack Sampler",
      "Smart Vending Machine",
      "Premium Nuts & Dried Fruits",
      "Artisan Chocolate Collection",
      "Organic Popcorn Maker",
      "Beverage Cooler",
    ],
    satire: "Strategic snacking requires strategic supplies",
  },
  fitness: {
    keywords: ["gym", "workout", "exercise", "run", "walk", "health", "fit", "athlete"],
    category: "Fitness & Sports",
    enablerItems: [
      "Premium Fitness Tracker",
      "Wireless Earbuds",
      "Moisture-Wicking Apparel",
      "Foam Roller",
      "Yoga Mat Premium Edition",
      "Gym Bag with Organization",
      "Smart Water Bottle",
      "Recovery Compression Sleeves",
    ],
    satire: "Peak performance demands premium gear",
  },
  relaxation: {
    keywords: ["relax", "chill", "unwind", "peace", "calm", "meditate", "yoga"],
    category: "Wellness & Self-Care",
    enablerItems: [
      "Meditation Cushion",
      "Aromatherapy Essential Oils",
      "Bath Bomb Set",
      "Soft Meditation Shawl",
      "Himalayan Salt Lamp",
      "Spa Toolkit",
      "Relaxation Tea Set",
      "Weighted Eye Pillow",
    ],
    satire: "True peace requires the right environment",
  },
  gaming: {
    keywords: ["game", "gaming", "play", "stream", "esports", "rpg", "console", "pc"],
    category: "Gaming & Entertainment",
    enablerItems: [
      "Gaming Chair",
      "RGB Lighting Setup",
      "Gaming Headset",
      "4K Gaming Monitor",
      "Gaming PC Upgrade",
      "Console Controller",
      "Game Pass Subscription",
      "Stream Deck",
    ],
    satire: "Serious gaming requires serious equipment",
  },
  coffee: {
    keywords: ["coffee", "caffeine", "espresso", "latte", "cappuccino", "morning"],
    category: "Beverages",
    enablerItems: [
      "Premium Coffee Maker",
      "Burr Grinder",
      "Specialty Coffee Subscription",
      "Espresso Machine",
      "Pour Over Coffee Set",
      "Insulated Travel Mug",
      "Coffee Bean Roaster",
      "Milk Frother",
    ],
    satire: "A true coffee aficionado deserves artisan equipment",
  },
  travel: {
    keywords: ["travel", "vacation", "trip", "adventure", "destination", "explore"],
    category: "Travel & Experiences",
    enablerItems: [
      "Premium Travel Backpack",
      "Travel Pillow",
      "Universal Power Adapter",
      "TSA-Approved Luggage",
      "Travel Organizer Set",
      "GoPro Camera",
      "Travel Insurance Package",
      "Portable WiFi Device",
    ],
    satire: "Exploration requires the right equipment",
  },
};

/**
 * Get persona context based on justification text
 * Matches keywords to find the most relevant persona
 */
export function getPersonaContext(justification: string, input: string): PersonaContext | null {
  const combinedText = `${justification} ${input}`.toLowerCase();

  let bestMatch: PersonaContext | null = null;
  let bestMatchCount = 0;

  for (const context of Object.values(PERSONA_CONTEXTS)) {
    const matchCount = context.keywords.filter((keyword) =>
      combinedText.includes(keyword)
    ).length;

    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      bestMatch = context;
    }
  }

  return bestMatch;
}

/**
 * Filter product recommendations based on persona context
 * Preferentially returns enabler items for the identified persona
 */
export function filterProductsForPersona(
  products: Array<any>,
  personaContext: PersonaContext | null
): Array<any> {
  if (!personaContext) {
    return products; // Return all if no persona detected
  }

  // Try to match products to enabler items first
  const categoryMatches = products.filter((p) =>
    personaContext.enablerItems.some((item) =>
      p.name.toLowerCase().includes(item.toLowerCase().split(" ")[0])
    )
  );

  if (categoryMatches.length > 0) {
    return categoryMatches;
  }

  // Fall back to products in the same category
  const fallbackMatches = products.filter((p) =>
    p.category?.toLowerCase().includes(personaContext.category.toLowerCase())
  );

  return fallbackMatches.length > 0 ? fallbackMatches : products;
}

/**
 * Get a satirical message about the recommended product
 */
export function getPersonaSatire(personaContext: PersonaContext | null): string {
  if (!personaContext) {
    return "You deserve this.";
  }
  return personaContext.satire;
}
