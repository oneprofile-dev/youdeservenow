import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const BadWordsFilter = require("bad-words");
import { sanitizeInput, generateId, getSiteUrl } from "@/lib/utils";
import { matchProduct } from "@/lib/products";
import { buildPrompt } from "@/lib/prompt";
import { generateJustification } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveResult } from "@/lib/db";
import type { Result } from "@/lib/db";

const filter = new BadWordsFilter();

function isValidJustification(text: string): boolean {
  if (text.trim().length < 60) return false;
  if (/\[(?:insert|your|name|product|here|xxx)[^\]]*\]/i.test(text)) return false;
  if (/https?:\/\/(?:example\.com|placeholder\.|lorem\.)/i.test(text)) return false;
  if (/\.\.\.$/.test(text.trim()) && text.trim().length < 100) return false; // truncated
  return true;
}

export async function POST(req: NextRequest) {
  // Get IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  // Rate limit check
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

  // Profanity check
  let safeInput = clean;
  try {
    if (filter.isProfane(clean)) {
      safeInput = filter.clean(clean);
    }
  } catch {
    // bad-words can throw on edge cases — ignore
  }

  // Match product
  const product = matchProduct(safeInput);

  // Build prompt and generate
  const prompt = buildPrompt(safeInput, product);
  let justification = await generateJustification(prompt);

  // Quality gate: reject placeholder-contaminated or truncated outputs
  if (!isValidJustification(justification)) {
    console.warn("[Validator] Output failed quality check, using fallback");
    justification = await generateJustification(prompt + "\n\nIMPORTANT: Respond ONLY with the justification paragraph. No placeholders, no brackets, no incomplete sentences.");
  }

  // Save to DB
  const id = generateId();
  const siteUrl = getSiteUrl();
  const shareUrl = `${siteUrl}/result/${id}`;
  const createdAt = new Date().toISOString();

  const result: Result = {
    id,
    input: safeInput,
    justification,
    product,
    shareUrl,
    createdAt,
  };

  await saveResult(result);

  return NextResponse.json(result, {
    headers: { "X-RateLimit-Remaining": String(remaining) },
  });
}
