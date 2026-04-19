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
  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const client = getClient();
      const model = client.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
        generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      try {
        const result = await model.generateContent(prompt);
        clearTimeout(timeout);
        const text = result.response.text().trim();
        if (text) return text;
      } catch (geminiErr: unknown) {
        clearTimeout(timeout);
        const status = (geminiErr as { status?: number })?.status;
        // Only fall through to Groq on rate limit or quota errors
        if (status !== 429 && status !== 503) throw geminiErr;
      }
    } catch {
      // Fall through to Groq
    }
  }

  // Try Groq fallback
  if (process.env.GROQ_API_KEY) {
    try {
      return await generateWithGroq(prompt);
    } catch {
      // Fall through to hardcoded fallback
    }
  }

  return getFallback();
}
