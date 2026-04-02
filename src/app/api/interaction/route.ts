import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/db/queries";
import { processInteraction, type InteractionInput } from "@/lib/learner-brain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, sessionId, eventType, ...rest } = body as InteractionInput;

    if (!profileId || !sessionId || !eventType) {
      return NextResponse.json(
        { error: "profileId, sessionId, and eventType are required" },
        { status: 400 }
      );
    }

    const profile = getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    processInteraction({ profileId, sessionId, eventType, ...rest });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Interaction API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
