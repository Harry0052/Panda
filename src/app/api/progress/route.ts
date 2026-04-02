import { NextRequest, NextResponse } from "next/server";
import {
  getProfileStats,
  getProfile,
  getLearnerModels,
} from "@/db/queries";
import { getSuggestedPrompts } from "@/lib/adaptive-engine";

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

    const stats = getProfileStats(profileId);
    const learnerModels = getLearnerModels(profileId);

    // Generate personalized suggested prompts with icons
    const promptTexts = getSuggestedPrompts(profile, learnerModels);
    const icons = ["🔢", "📖", "✏️", "🔬", "🎯", "🎨", "🌍", "🧠"];
    const suggestedPrompts = promptTexts.map((text, i) => ({
      text,
      icon: icons[i % icons.length],
    }));

    return NextResponse.json({
      ...stats,
      suggestedPrompts,
    });
  } catch (err) {
    console.error("Progress GET error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
