import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitCustom } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { allowed } = await checkRateLimitCustom(`rl:subscribe:${ip}`, 3, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Silently succeed in dev / when Resend is not configured
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe]", err);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
