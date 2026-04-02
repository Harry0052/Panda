import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/db/queries";
import {
  getLearnerDiagnostics,
  getAdaptationHistory,
  assembleTutorContext,
} from "@/lib/learner-brain";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const view = searchParams.get("view") || "diagnostics";

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const profile = getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    switch (view) {
      case "diagnostics": {
        const diagnostics = getLearnerDiagnostics(profileId);
        return NextResponse.json(diagnostics);
      }

      case "adaptation-history": {
        const limit = parseInt(searchParams.get("limit") || "20");
        const history = getAdaptationHistory(profileId, limit);
        return NextResponse.json({ history });
      }

      case "context": {
        const subject = searchParams.get("subject") || undefined;
        const subtopic = searchParams.get("subtopic") || undefined;
        const context = assembleTutorContext(profile, null, subject, subtopic);
        return NextResponse.json({
          profile: context.profile,
          academic: context.academicSnapshot,
          communication: context.communicationSnapshot,
          engagement: context.engagementSnapshot,
          currentGoal: context.currentGoal,
          recentMistakes: context.recentMistakes,
          successfulStrategies: context.successfulStrategies,
          relatedMasteredConcepts: context.relatedMasteredConcepts,
          adaptation: context.adaptation,
          explainability: context.explainability,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown view: ${view}` }, { status: 400 });
    }
  } catch (err) {
    console.error("Brain API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
