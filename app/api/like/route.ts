import { NextRequest, NextResponse } from "next/server";
import { getKV } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ count: 0 });

  const kv = await getKV();
  if (!kv) return NextResponse.json({ count: 0 });

  const count = (await kv.get<number>(`likes:${id}`)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const id = body.id.trim();
  const kv = await getKV();

  if (!kv) {
    // No KV in local dev — return optimistic count
    return NextResponse.json({ count: 1 });
  }

  const count = await kv.incr(`likes:${id}`);
  // No expiry needed — likes are permanent
  return NextResponse.json({ count });
}
