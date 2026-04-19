import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Temporary diagnostic endpoint — remove after fixing AI issue
// Protected by secret query param: /api/debug-ai?secret=ydn2026
const SECRET = "ydn2026";

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const key = process.env.GEMINI_API_KEY;
  const results: Record<string, string> = {
    keyPresent: key ? `yes (length: ${key.length}, starts: ${key.slice(0, 8)}...)` : "NO — not set",
  };

  if (!key) return NextResponse.json(results);

  const client = new GoogleGenerativeAI(key);
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

  for (const modelId of models) {
    try {
      const model = client.getGenerativeModel({ model: modelId });
      const result = await Promise.race([
        model.generateContent("Say: ok"),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ]);
      const text = (result as Awaited<ReturnType<typeof model.generateContent>>).response.text();
      results[modelId] = `OK: ${text.slice(0, 60)}`;
    } catch (err) {
      results[modelId] = `FAIL: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return NextResponse.json(results, { status: 200 });
}
