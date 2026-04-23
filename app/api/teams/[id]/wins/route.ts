import { NextRequest, NextResponse } from "next/server";
import { recordTeamWin, getTeamWins, TeamWin } from "@/lib/db";
import { nanoid } from "nanoid";
import type { Product } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teams/[id]/wins
 * Get team wins/prescriptions
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    const wins = await getTeamWins(teamId, limit);

    return NextResponse.json({
      success: true,
      wins,
    });
  } catch (error) {
    console.error("[team wins GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams/[id]/wins
 * Record a team win/prescription
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const { description, category, product, createdBy } = await req.json();

    if (!description || !category || !createdBy) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const winId = nanoid();
    const win: TeamWin = {
      id: winId,
      teamId,
      description,
      category,
      product,
      createdAt: new Date().toISOString(),
      createdBy,
      shares: 0,
    };

    await recordTeamWin(win);

    return NextResponse.json({ success: true, win });
  } catch (error) {
    console.error("[team wins POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to record win" },
      { status: 500 }
    );
  }
}
