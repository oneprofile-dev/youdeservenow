export interface PersonalityType {
  id: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  color: string; // tailwind-safe hex
  traits: string[];
  famousDiagnosis: string; // a funny "example" person
}

const PERSONALITY_TYPES: Record<string, PersonalityType> = {
  "comfort-maximalist": {
    id: "comfort-maximalist",
    name: "The Comfort Maximalist",
    tagline: "Scientifically engineered for maximum coziness",
    description:
      "Your neurological reward profile is oriented toward sensory pleasure and restorative experiences. The Institute classifies you as a Type-C (Comfort) achiever — someone who works hard precisely so they can do absolutely nothing, but better.",
    emoji: "🛋️",
    color: "#C8963E",
    traits: ["Blanket connoisseur", "Bath enthusiast", "Nap evangelist"],
    famousDiagnosis: "The Institute estimates Einstein was also a Comfort Maximalist.",
  },
  "productivity-hedonist": {
    id: "productivity-hedonist",
    name: "The Productivity Hedonist",
    tagline: "Works hard. Rewards harder.",
    description:
      "You optimise relentlessly — and then optimise the treat you give yourself for optimising. Peer-reviewed data indicates your reward-seeking behaviour is 3.7× more intentional than the average human. You don't stumble into deserving things. You engineer it.",
    emoji: "⚡",
    color: "#4F46E5",
    traits: ["Spreadsheet creator", "Inbox zero achiever", "Strategic napper"],
    famousDiagnosis: "The Institute suspects Elon Musk is a corrupted variant of this type.",
  },
  "tech-hedonist": {
    id: "tech-hedonist",
    name: "The Tech Hedonist",
    tagline: "The gadget is the reward",
    description:
      "You believe that every problem is a hardware problem, and every accomplishment deserves a hardware solution. The Institute's longitudinal data confirms: your dopamine response to unboxing videos is clinically significant.",
    emoji: "🤖",
    color: "#0EA5E9",
    traits: ["Early adopter", "Spec-sheet reader", "Cable organiser (ironically)"],
    famousDiagnosis: "Steve Jobs was retroactively diagnosed in 2024.",
  },
  "wellness-oracle": {
    id: "wellness-oracle",
    name: "The Wellness Oracle",
    tagline: "Your body is a temple. Science confirms it.",
    description:
      "Your reward profile indicates a deep investment in the self as a long-term project. You treat your body like a startup — constantly iterating, biohacking, and measuring. The Institute considers you highly optimised and slightly intimidating.",
    emoji: "🧘",
    color: "#10B981",
    traits: ["Cold shower enthusiast", "Supplement stacker", "Gratitude journaller"],
    famousDiagnosis: "Gwyneth Paltrow holds the all-time Institute record in this category.",
  },
  "chaos-achiever": {
    id: "chaos-achiever",
    name: "The Chaos Achiever",
    tagline: "Thrives under pressure. Somehow.",
    description:
      "You left it until the last minute, and then absolutely nailed it. The Institute's data shows your cortisol-to-output ratio is statistically impossible — yet here you are. Your reward profile skews spontaneous, bold, and slightly unhinged. This is a compliment.",
    emoji: "🌪️",
    color: "#F59E0B",
    traits: ["Deadline sprinter", "Adrenaline architect", "Professional last-minutist"],
    famousDiagnosis: "Every great artist who ever lived was diagnosed posthumously.",
  },
  "culinary-sovereign": {
    id: "culinary-sovereign",
    name: "The Culinary Sovereign",
    tagline: "The kitchen is your laboratory",
    description:
      "Food is not fuel to you — it is self-expression, self-care, and self-reward simultaneously. The Institute's nutritional psychology division classifies you as a Type-K (Kitchen) achiever, whose accomplishments are best celebrated through the medium of taste.",
    emoji: "👨‍🍳",
    color: "#EF4444",
    traits: ["Meal prep devotee", "Recipe bookmarker", "Pan season advocate"],
    famousDiagnosis: "Julia Child was a founding member of this personality class.",
  },
  "snack-philosopher": {
    id: "snack-philosopher",
    name: "The Snack Philosopher",
    tagline: "Life is short. The snack is now.",
    description:
      "You have achieved something, and your first instinct is to eat something delicious about it. The Institute's Immediate Gratification Index places you in the 94th percentile. You understand something others don't: the present moment is best enjoyed with a good snack.",
    emoji: "🍫",
    color: "#8B5CF6",
    traits: ["Pantry architect", "Flavour connoisseur", "Strategic snacker"],
    famousDiagnosis: "Napoleon carried chocolate into battle. He was one of yours.",
  },
  "aesthetic-architect": {
    id: "aesthetic-architect",
    name: "The Aesthetic Architect",
    tagline: "Your space is your sanctuary",
    description:
      "Your reward profile reveals a deep, peer-reviewed need for beauty in your environment. You don't just want nice things — you want everything to be cohesive, intentional, and highly photographable. The Institute's interior division considers you a threat to minimalism.",
    emoji: "🏛️",
    color: "#D97706",
    traits: ["Pinterest board curator", "Plant parent", "Lighting obsessive"],
    famousDiagnosis: "The Institute has confirmed this archetype since ancient Rome.",
  },
};

// Map product category → personality type ID
const CATEGORY_TO_PERSONALITY: Record<string, string> = {
  comfort: "comfort-maximalist",
  tech: "tech-hedonist",
  fitness: "wellness-oracle",
  kitchen: "culinary-sovereign",
  selfcare: "wellness-oracle",
  snacks: "snack-philosopher",
  home: "aesthetic-architect",
  trending: "productivity-hedonist",
};

// Keyword overrides — if input matches, use this type regardless of category
const KEYWORD_OVERRIDES: Array<{ keywords: string[]; type: string }> = [
  { keywords: ["deadline", "last minute", "rushed", "panic", "chaos", "forgot", "procrastinat"], type: "chaos-achiever" },
  { keywords: ["optimis", "systemat", "plann", "organised", "schedule", "inbox", "efficient", "productiv"], type: "productivity-hedonist" },
  { keywords: ["code", "programm", "develop", "deploy", "shipped", "built", "launched", "hack"], type: "tech-hedonist" },
  { keywords: ["ran", "gym", "workout", "meditat", "yoga", "hiked", "biked", "trained"], type: "wellness-oracle" },
  { keywords: ["cooked", "baked", "meal prep", "recipe", "dinner", "made food"], type: "culinary-sovereign" },
];

export function getPersonalityType(category: string, input: string): PersonalityType {
  const lower = input.toLowerCase();

  for (const override of KEYWORD_OVERRIDES) {
    if (override.keywords.some((kw) => lower.includes(kw))) {
      return PERSONALITY_TYPES[override.type];
    }
  }

  const typeId = CATEGORY_TO_PERSONALITY[category] ?? "productivity-hedonist";
  return PERSONALITY_TYPES[typeId];
}

export function getAllPersonalityTypes(): PersonalityType[] {
  return Object.values(PERSONALITY_TYPES);
}
