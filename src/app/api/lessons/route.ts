import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/db/queries";
import {
  getRecommendedLessons,
  getLessonById,
  getLessonsBySubject,
  adaptLesson,
} from "@/lib/lesson-engine";
import { processInteraction } from "@/lib/learner-brain";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const lessonId = searchParams.get("id");
    const subject = searchParams.get("subject");

    // Get specific lesson
    if (lessonId) {
      const lesson = getLessonById(lessonId);
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      // Adapt if profile provided
      if (profileId) {
        const profile = getProfile(profileId);
        if (profile) {
          const adapted = adaptLesson(lesson, profileId, profile);
          return NextResponse.json(adapted);
        }
      }
      return NextResponse.json(lesson);
    }

    // Get recommended lessons for a profile
    if (profileId) {
      const profile = getProfile(profileId);
      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      if (subject) {
        const subjectLessons = getLessonsBySubject(subject);
        return NextResponse.json(subjectLessons);
      }

      const recommendations = getRecommendedLessons(profileId, profile);
      return NextResponse.json(recommendations);
    }

    return NextResponse.json({ error: "profileId or id required" }, { status: 400 });
  } catch (err) {
    console.error("Lessons GET error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, sessionId, lessonId, action, blockResult } = body;

    if (!profileId || !lessonId) {
      return NextResponse.json({ error: "profileId and lessonId required" }, { status: 400 });
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (action === "complete_block" && blockResult) {
      // Record interaction event for the brain
      processInteraction({
        profileId,
        sessionId: sessionId || "",
        eventType: blockResult.wasCorrect !== undefined ? "answer" : "task_complete",
        subject: lesson.subject,
        subtopic: lesson.subtopic,
        wasCorrect: blockResult.wasCorrect,
        difficulty: lesson.difficulty === "easy" ? 0.3 : lesson.difficulty === "medium" ? 0.5 : 0.7,
        timeSpentMs: blockResult.timeSpentMs,
        hintsOffered: blockResult.hintsUsed > 0 ? 1 : 0,
        hintsUsed: blockResult.hintsUsed,
        formatUsed: blockResult.blockType,
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "complete_lesson") {
      // Record lesson completion
      processInteraction({
        profileId,
        sessionId: sessionId || "",
        eventType: "task_complete",
        subject: lesson.subject,
        subtopic: lesson.subtopic,
        wasCorrect: (blockResult?.overallScore ?? 0) >= 0.5,
        difficulty: lesson.difficulty === "easy" ? 0.3 : lesson.difficulty === "medium" ? 0.5 : 0.7,
        timeSpentMs: blockResult?.totalTimeMs,
        formatUsed: "lesson",
        engagementSignals: ["completed_lesson"],
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Lessons POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
