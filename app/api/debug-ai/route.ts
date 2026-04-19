import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "@/lib/prompt";
import { matchProduct } from "@/lib/products";

const SECRET = "ydn2026";

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ keyPresent: false });

  const client = new GoogleGenerativeAI(key);

  // Use the real prompt from the app
  const testInput = "I finished a difficult project at work after weeks of effort";
  const product = matchProduct(testInput);
  const realPrompt = buildPrompt(testInput, product);

  const results: Record<string, unknown> = {
    promptLength: realPrompt.length,
    product: product.name,
  };

  for (const modelId of ["gemini-2.0-flash-lite", "gemini-2.5-flash"]) {
    try {
      const model = client.getGenerativeModel({
        model: modelId,
        generationConfig: { maxOutputTokens: 500, temperature: 0.9 },
      });
      const result = await Promise.race([
        model.generateContent(realPrompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 12000)),
      ]);
      const res = (result as Awaited<ReturnType<typeof model.generateContent>>).response;
      const candidate = res.candidates?.[0];
      const text = res.text();
      results[modelId] = {
        finishReason: candidate?.finishReason,
        chars: text.length,
        text,
      };
    } catch (err) {
      results[modelId] = { error: err instanceof Error ? err.message.slice(0, 300) : String(err) };
    }
  }

  return NextResponse.json(results);
}
