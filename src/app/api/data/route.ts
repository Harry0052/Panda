import { NextRequest, NextResponse } from "next/server";
import {
  exportProfileData,
  importProfileData,
  resetProfileData,
  resetAllData,
  getDatabaseStats,
  initializeStorage,
} from "@/lib/local-storage";
import { getFirstProfile } from "@/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "stats") {
      initializeStorage();
      const stats = getDatabaseStats();
      return NextResponse.json(stats);
    }

    if (action === "export") {
      const profileId = searchParams.get("profileId");
      const profile = profileId ? { id: profileId } : getFirstProfile();
      if (!profile) {
        return NextResponse.json({ error: "No profile found" }, { status: 404 });
      }

      const data = exportProfileData(profile.id);
      if (!data) {
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
      }

      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="panda-export-${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json({ error: "action parameter required (stats, export)" }, { status: 400 });
  } catch (err) {
    console.error("Data API GET error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "import") {
      const body = await request.text();
      const result = importProfileData(body);
      if (result.success) {
        return NextResponse.json({ ok: true, profileId: result.profileId });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (action === "reset-profile") {
      const body = await request.json();
      const { profileId } = body;
      if (!profileId) {
        return NextResponse.json({ error: "profileId required" }, { status: 400 });
      }
      resetProfileData(profileId);
      return NextResponse.json({ ok: true });
    }

    if (action === "reset-all") {
      resetAllData();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action parameter required (import, reset-profile, reset-all)" }, { status: 400 });
  } catch (err) {
    console.error("Data API POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
