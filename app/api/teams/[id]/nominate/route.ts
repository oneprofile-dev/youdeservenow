import { NextRequest, NextResponse } from "next/server";
import { createNomination, getTeamNominations, Nomination } from "@/lib/db";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teams/[id]/nominations
 * Get recent peer nominations
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;

    const nominations = await getTeamNominations(teamId);

    return NextResponse.json({
      success: true,
      nominations,
    });
  } catch (error) {
    console.error("[nominations GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch nominations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams/[id]/nominate
 * Create a peer nomination
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const { nomineeId, nominerName, reason, product } = await req.json();

    if (!nomineeId || !nominerName || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const nominationId = nanoid();
    const nomination: Nomination = {
      id: nominationId,
      teamId,
      nomineeId,
      nominerName,
      reason,
      product,
      createdAt: new Date().toISOString(),
      approved: true, // Auto-approve for now (can add moderation later)
    };

    await createNomination(nomination);

    return NextResponse.json({ success: true, nomination });
  } catch (error) {
    console.error("[nominations POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create nomination" },
      { status: 500 }
    );
  }
}
