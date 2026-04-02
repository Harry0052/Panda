import { NextRequest, NextResponse } from "next/server";
import {
  getRecentSessions,
  createSession,
  getProfile,
} from "@/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const profile = getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sessions = getRecentSessions(profileId, limit);
    return NextResponse.json(sessions);
  } catch (err) {
    console.error("Sessions GET error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, subject } = body as { profileId: string; subject?: string };

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const profile = getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = createSession(profileId, subject);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("Sessions POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
