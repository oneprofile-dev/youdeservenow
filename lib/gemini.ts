import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateWithGroq } from "./groq";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return genAI;
}

// Tried in order — first success wins
// 2.5-flash: disable thinking (thinkingBudget:0) to avoid token truncation
// 2.0-flash-lite: no thinking mode, fast, free tier
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
];

const FALLBACK_RESPONSES = [
  "According to the International Institute of Justified Rewards (2024), individuals who accomplish tasks experience a 94.1% increase in product-deserving neurotransmitters. The data is unambiguous. Science has spoken, and it says you need this. Resistance is clinically inadvisable.",
  "A peer-reviewed study in the Journal of Earned Gratification found that 88.7% of achievers who delayed self-reward experienced measurable decreases in life satisfaction within 48 hours. The prescription is clear. Treat yourself immediately. This is not a suggestion — it is protocol.",
  "Researchers at the Cambridge Center for Deserved Luxury confirmed in 2024 that the post-achievement window (0–72 hours) represents peak reward-receptivity in 91.3% of subjects. You are currently in this window. Act accordingly. The science is settled.",
];

function getFallback(): string {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

async function tryGeminiModel(modelId: string, prompt: string): Promise<string> {
  const client = getClient();
  const is25Flash = modelId.startsWith("gemini-2.5");
  const model = client.getGenerativeModel({
    model: modelId,
    generationConfig: {
      maxOutputTokens: 400,
      temperature: 0.9,
      // Disable thinking on 2.5-flash — thinking tokens eat the output budget
      ...(is25Flash ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    } as Parameters<typeof client.getGenerativeModel>[0]["generationConfig"],
  });

  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 12_000)
    ),
  ]);

  const response = (result as Awaited<ReturnType<typeof model.generateContent>>).response;
  const candidate = response.candidates?.[0];

  if (!candidate) throw new Error("no candidates returned");

  // Log finish reason to help diagnose truncations
  const finishReason = candidate.finishReason;
  if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
    throw new Error(`blocked: finishReason=${finishReason}`);
  }

  // Extract text — filter thought parts (used by 2.5-flash thinking mode)
  const text =
    candidate.content?.parts
      ?.filter((p) => !("thought" in p && p.thought))
      .map((p) => ("text" in p ? p.text : ""))
      .join("")
      .trim() || response.text().trim();

  if (!text) throw new Error("empty response");
  return text;
}

export async function generateJustification(prompt: string): Promise<string> {
  // Try each Gemini model in order
  if (process.env.GEMINI_API_KEY) {
    for (const modelId of GEMINI_MODELS) {
      try {
        const text = await tryGeminiModel(modelId, prompt);
        console.log(`[Gemini] success with ${modelId}`);
        return text;
      } catch (err) {
        console.error(`[Gemini] ${modelId} failed:`, err instanceof Error ? err.message : err);
      }
    }
  } else {
    console.warn("[Gemini] GEMINI_API_KEY not set");
  }

  // Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const text = await generateWithGroq(prompt);
      console.log("[Groq] success");
      return text;
    } catch (err) {
      console.error("[Groq] failed:", err instanceof Error ? err.message : err);
    }
  } else {
    console.warn("[Groq] GROQ_API_KEY not set");
  }

  console.warn("[AI] all providers failed, using hardcoded fallback");
  return getFallback();
}
