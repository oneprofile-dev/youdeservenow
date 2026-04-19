import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const BadWordsFilter = require("bad-words");
import { sanitizeInput, generateId, getSiteUrl } from "@/lib/utils";
import { matchProduct } from "@/lib/products";
import { buildPrompt } from "@/lib/prompt";
import { generateJustification, getFallback } from "@/lib/gemini";
import { checkRateLimit, trackAiCall } from "@/lib/rate-limit";
import { saveResult, updateResult } from "@/lib/db";
import type { Result } from "@/lib/db";
import { generateAndUploadOgImage } from "@/lib/og-generator";

const filter = new BadWordsFilter();

function isValidJustification(text: string): boolean {
  if (text.trim().length < 60) return false;
  if (/\[(?:insert|your|name|product|here|xxx)[^\]]*\]/i.test(text)) return false;
  if (/https?:\/\/(?:example\.com|placeholder\.|lorem\.)/i.test(text)) return false;
  if (/\.\.\.$/.test(text.trim()) && text.trim().length < 100) return false;
  return true;
}

export async function POST(req: NextRequest) {
  // IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  // Per-IP rate limit
  const { allowed, remaining } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before trying again." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  // Parse body
  let body: { input?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.input !== "string" || !body.input.trim()) {
    return NextResponse.json({ error: "Input is required." }, { status: 400 });
  }

  // Sanitize
  const clean = sanitizeInput(body.input);
  if (clean.length < 3) {
    return NextResponse.json({ error: "Please tell us more about what you accomplished!" }, { status: 400 });
  }

  // Profanity filter
  let safeInput = clean;
  try {
    if (filter.isProfane(clean)) safeInput = filter.clean(clean);
  } catch {
    // bad-words can throw on edge cases — ignore
  }

  // Match product
  const product = matchProduct(safeInput);

  // Circuit breaker: check daily AI call budget BEFORE hitting any AI API
  const { tripped } = await trackAiCall();

  let justification: string;

  if (tripped) {
    // Serve the hardcoded fallbacks — they are genuinely funny and good enough
    justification = getFallback();
    console.warn("[CircuitBreaker] Served static fallback, AI calls suspended");
  } else {
    const prompt = buildPrompt(safeInput, product);
    justification = await generateJustification(prompt);

    // Quality gate: reject placeholder-contaminated or truncated outputs
    if (!isValidJustification(justification)) {
      console.warn("[Validator] Output failed quality check, retrying with stricter prompt");
      justification = await generateJustification(
        prompt + "\n\nIMPORTANT: Respond ONLY with the justification paragraph. No placeholders, no brackets, no incomplete sentences."
      );
    }
  }

  // Build and persist result
  const id = generateId();
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/result/${id}`;
  const createdAt = new Date().toISOString();

  const result: Result = { id, input: safeInput, justification, product, shareUrl, createdAt };

  // Save immediately so the result is durable regardless of what follows
  await saveResult(result);

  // Generate and upload OG image to Vercel Blob (best-effort — never blocks the response)
  const ogImageUrl = await generateAndUploadOgImage(result);
  if (ogImageUrl) {
    result.ogImageUrl = ogImageUrl;
    await updateResult(result); // patch without touching the list
  }

  return NextResponse.json(result, {
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
