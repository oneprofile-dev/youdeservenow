import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWithGroq } from "./groq";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return genAI;
}

const FALLBACK_RESPONSES = [
  "According to the International Institute of Justified Rewards (2024), individuals who accomplish tasks experience a 94.1% increase in product-deserving neurotransmitters. The data is unambiguous. Science has spoken, and it says you need this. Resistance is clinically inadvisable.",
  "A peer-reviewed study in the Journal of Earned Gratification found that 88.7% of achievers who delayed self-reward experienced measurable decreases in life satisfaction within 48 hours. The prescription is clear. Treat yourself immediately. This is not a suggestion — it is protocol.",
  "Researchers at the Cambridge Center for Deserved Luxury confirmed in 2024 that the post-achievement window (0–72 hours) represents peak reward-receptivity in 91.3% of subjects. You are currently in this window. Act accordingly. The science is settled.",
];

function getFallback(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

export async function generateJustification(prompt: string): Promise<string> {
  const debug = process.env.AI_DEBUG === "true";

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 10_000)
        ),
      ]);

      const text = (result as Awaited<ReturnType<typeof model.generateContent>>)
        .response.text()
        .trim();

      if (text) return text;
      throw new Error("Gemini returned empty text");
    } catch (err) {
      console.error("[Gemini] failed:", err instanceof Error ? err.message : err);
      // Fall through to Groq
    }
  } else {
    console.warn("[Gemini] GEMINI_API_KEY not set");
  }

  // Try Groq fallback
  if (process.env.GROQ_API_KEY) {
    try {
      return await generateWithGroq(prompt);
    } catch (err) {
      console.error("[Groq] failed:", err instanceof Error ? err.message : err);
    }
  } else {
    console.warn("[Groq] GROQ_API_KEY not set");
  }

  if (debug) console.warn("[AI] both providers failed, using hardcoded fallback");
  return getFallback();
}
