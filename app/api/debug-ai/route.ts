import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SECRET = "ydn2026";

export async function GET(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== SECRET) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "no key" });

  const client = new GoogleGenerativeAI(key);
  const testPrompt = `You are a scientist. Write 3 funny sentences about why someone who cleaned their apartment deserves a scented candle. Be specific and deadpan.`;

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 400,
      temperature: 0.9,
      // @ts-expect-error thinkingConfig not in SDK types yet
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const result = await model.generateContent(testPrompt);
  const response = result.response;
  const candidate = response.candidates?.[0];

  const parts = candidate?.content?.parts ?? [];
  const partsInfo = parts.map((p, i) => ({
    index: i,
    hasText: "text" in p,
    isThought: "thought" in p ? (p as { thought?: boolean }).thought : false,
    textLength: "text" in p ? (p as { text: string }).text.length : 0,
    textPreview: "text" in p ? (p as { text: string }).text.slice(0, 200) : null,
  }));

  const nonThoughtText = parts
    .filter((p) => !("thought" in p && (p as { thought?: boolean }).thought))
    .map((p) => ("text" in p ? (p as { text: string }).text : ""))
    .join("");

  return NextResponse.json({
    finishReason: candidate?.finishReason,
    totalParts: parts.length,
    parts: partsInfo,
    nonThoughtTextLength: nonThoughtText.length,
    nonThoughtText,
    responseTextLength: response.text().length,
    responseText: response.text(),
  });
}
