import { NextRequest, NextResponse } from "next/server";
import { getResult } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return NextResponse.json({ error: "Result ID is required." }, { status: 400 });
  }

  const result = await getResult(body.id);
  if (!result) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  return NextResponse.json({ shareUrl: result.shareUrl });
}
