import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";
import { checkRateLimitCustom } from "@/lib/rate-limit";

const ID_RE = /^[a-z0-9]{6,12}$/;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !ID_RE.test(id)) return NextResponse.json({ count: 0 });

  const kv = await getKV();
  if (!kv) return NextResponse.json({ count: 0 });

  const count = (await kv.get<number>(`likes:${id}`)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { allowed } = await checkRateLimitCustom(`rl:like:${ip}`, 20, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many likes" }, { status: 429 });
  }

  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.id !== "string" || !ID_RE.test(body.id.trim())) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const id = body.id.trim();
  const kv = await getKV();

  if (!kv) {
    return NextResponse.json({ count: 1 });
  }

  const count = await kv.incr(`likes:${id}`);
  return NextResponse.json({ count });
}
