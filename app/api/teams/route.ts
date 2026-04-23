import { NextRequest, NextResponse } from "next/server";
import { createTeam, getPublicTeams, Team } from "@/lib/db";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/teams?page=0&perPage=12
 * List public teams
 */
export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const perPage = parseInt(req.nextUrl.searchParams.get("perPage") || "12");

    const { teams, total } = await getPublicTeams(page, perPage);

    return NextResponse.json({ success: true, teams, total, page, perPage });
  } catch (error) {
    console.error("[teams GET]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch teams" }, { status: 500 });
  }
}

/**
 * POST /api/teams
 * Create a new team
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, industry, description, userId, displayName, isPublic = true, tone = "playful" } = body;

    if (!name || !industry || !userId || !displayName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const teamId = nanoid();
    const now = new Date().toISOString();

    const team: Team = {
      id: teamId,
      name,
      industry,
      description: description || "",
      createdBy: userId,
      createdAt: now,
      memberCount: 1,
      isPublic,
      tone,
    };

    await createTeam(team);

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("[teams POST]", error);
    return NextResponse.json({ success: false, error: "Failed to create team" }, { status: 500 });
  }
}
