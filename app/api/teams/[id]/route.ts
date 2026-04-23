import { NextRequest, NextResponse } from "next/server";
import { getTeam, addTeamMember, getTeamMembers, recordTeamWin, getTeamWins, TeamMember, TeamWin } from "@/lib/db";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teams/[id]
 * Get team details with members and recent wins
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const team = await getTeam(teamId);

    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    const members = await getTeamMembers(teamId);
    const wins = await getTeamWins(teamId, 10);

    return NextResponse.json({
      success: true,
      team,
      members,
      wins,
    });
  } catch (error) {
    console.error("[teams GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch team" }, { status: 500 });
  }
}

/**
 * POST /api/teams/[id]/members
 * Add a member to team
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: teamId } = await params;
    const { userId, displayName } = await req.json();

    if (!userId || !displayName) {
      return NextResponse.json(
        { success: false, error: "Missing userId or displayName" },
        { status: 400 }
      );
    }

    const team = await getTeam(teamId);
    if (!team) {
      return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
    }

    const member: TeamMember = {
      teamId,
      userId,
      role: "member",
      joinedAt: new Date().toISOString(),
      displayName,
    };

    await addTeamMember(member);

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("[team members POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to add member" },
      { status: 500 }
    );
  }
}
