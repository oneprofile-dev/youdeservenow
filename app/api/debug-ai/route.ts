import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SECRET = "ydn2026";

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ keyPresent: false });

  const client = new GoogleGenerativeAI(key);
  const testPrompt = `You are a scientist. Write 3 funny sentences about why someone who cleaned their house deserves a scented candle. Be specific and deadpan. Under 200 words.`;
  const results: Record<string, string> = {
    keyPresent: `yes (len=${key.length}, prefix=${key.slice(0, 8)}...)`,
  };

  for (const modelId of ["gemini-2.0-flash-lite", "gemini-2.5-flash"]) {
    try {
      const model = client.getGenerativeModel({
        model: modelId,
        generationConfig: { maxOutputTokens: 500, temperature: 0.9 },
      });
      const result = await Promise.race([
        model.generateContent(testPrompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 10000)),
      ]);
      const response = (result as Awaited<ReturnType<typeof model.generateContent>>).response;
      const text = response.text();
      results[modelId] = `OK (${text.length} chars): ${text.slice(0, 300)}`;
    } catch (err) {
      results[modelId] = `FAIL: ${err instanceof Error ? err.message.slice(0, 200) : String(err)}`;
    }
  }

  return NextResponse.json(results);
}
