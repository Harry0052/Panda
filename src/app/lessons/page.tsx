"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { LessonDefinition, LessonState } from "@/lib/lesson-schema";

type LessonRecommendation = {
  lesson: LessonDefinition;
  reason: string;
  priority: number;
};

const subjectEmojis: Record<string, string> = {
  Math: "🔢",
  Reading: "📖",
  Writing: "✏️",
  Science: "🔬",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-[#DDEED5] text-[#4F7C57]",
  medium: "bg-[#F4C95D]/20 text-[#B8860B]",
  hard: "bg-[#F5A6C0]/20 text-[#C2185B]",
};

function LessonBrowser({
  profileId,
  sessionId,
  onSelectLesson,
}: {
  profileId: string;
  sessionId: string;
  onSelectLesson: (lesson: LessonDefinition) => void;
}) {
  const [recommendations, setRecommendations] = useState<LessonRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/lessons?profileId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setRecommendations(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecommendations([]))
      .finally(() => setLoading(false));
  }, [profileId]);

  const subjects = [...new Set(recommendations.map((r) => r.lesson.subject))];
  const filtered = filter
    ? recommendations.filter((r) => r.lesson.subject === filter)
    : recommendations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-gentle">🐼</div>
          <p className="text-[#6B7280]">Finding the best lessons for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2F2F]">Lessons 🎋</h1>
          <p className="text-[#6B7280] mt-1">Pick a lesson — Panda picked these just for you!</p>
        </div>
      </div>

      {/* Subject filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !filter ? "bg-[#4F7C57] text-white" : "bg-white text-[#6B7280] border border-[#E5E2DA] hover:border-[#A8D08D]"
          }`}
        >
          All
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === s ? "bg-[#4F7C57] text-white" : "bg-white text-[#6B7280] border border-[#E5E2DA] hover:border-[#A8D08D]"
            }`}
          >
            {subjectEmojis[s] || "📚"} {s}
          </button>
        ))}
      </div>

      {/* Lesson cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((rec, i) => (
          <motion.div
            key={rec.lesson.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-5 rounded-2xl border-2 border-[#E5E2DA] hover:border-[#A8D08D] transition-all cursor-pointer group"
              onClick={() => onSelectLesson(rec.lesson)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{subjectEmojis[rec.lesson.subject] || "📚"}</span>
                  <div>
                    <h3 className="font-bold text-[#2F2F2F] group-hover:text-[#4F7C57] transition-colors">
                      {rec.lesson.title}
                    </h3>
                    <p className="text-xs text-[#6B7280]">{rec.lesson.subject} / {rec.lesson.subtopic}</p>
                  </div>
                </div>
                <Badge className={difficultyColors[rec.lesson.difficulty]}>
                  {rec.lesson.difficulty}
                </Badge>
              </div>

              <p className="text-sm text-[#6B7280] mb-3">{rec.lesson.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {rec.lesson.estimatedMinutes}min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {rec.lesson.blocks.length} activities
                  </span>
                </div>
                <ChevronRight size={18} className="text-[#A8D08D] group-hover:text-[#4F7C57] transition-colors" />
              </div>

              {rec.reason && (
                <p className="text-xs text-[#4F7C57] mt-2 flex items-center gap-1">
                  <Sparkles size={10} />
                  {rec.reason}
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No lessons found. Try a different subject!</p>
        </div>
      )}
    </div>
  );
}

function LessonsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id");

  const [profileId, setProfileId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonDefinition | null>(null);
  const [completed, setCompleted] = useState(false);
  const [finalState, setFinalState] = useState<LessonState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();
        if (!profileData?.id) {
          router.push("/onboarding");
          return;
        }
        setProfileId(profileData.id);

        const sessionRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profileData.id }),
        });
        const sessionData = await sessionRes.json();
        setSessionId(sessionData.id);

        // Load specific lesson if ID provided
        if (lessonId) {
          const lessonRes = await fetch(`/api/lessons?id=${lessonId}&profileId=${profileData.id}`);
          const lessonData = await lessonRes.json();
          if (lessonData && !lessonData.error) {
            setActiveLesson(lessonData);
          }
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, lessonId]);

  const handleLessonComplete = async (state: LessonState) => {
    setFinalState(state);
    setCompleted(true);

    // Report to API
    if (profileId && activeLesson) {
      await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          sessionId,
          lessonId: activeLesson.id,
          action: "complete_lesson",
          blockResult: {
            overallScore: state.overallScore,
            totalTimeMs: state.completedAt ? state.completedAt - state.startedAt : 0,
          },
        }),
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-5xl animate-bounce-gentle">🐼</div>
      </div>
    );
  }

  if (!profileId || !sessionId) return null;

  // Lesson completion screen
  if (completed && finalState && activeLesson) {
    const scorePct = Math.round(finalState.overallScore * 100);
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="text-6xl">
            {scorePct >= 80 ? "🎉" : scorePct >= 50 ? "👏" : "🌱"}
          </div>
          <h2 className="text-3xl font-bold text-[#2F2F2F]">Lesson Complete!</h2>
          <p className="text-lg text-[#6B7280]">{activeLesson.title}</p>

          <div className="flex justify-center gap-4">
            <div className="bg-white rounded-2xl border-2 border-[#E5E2DA] px-6 py-4">
              <p className="text-3xl font-bold text-[#4F7C57]">{scorePct}%</p>
              <p className="text-sm text-[#6B7280]">Score</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-[#E5E2DA] px-6 py-4">
              <p className="text-3xl font-bold text-[#F4C95D]">
                {finalState.completedAt
                  ? Math.round((finalState.completedAt - finalState.startedAt) / 60000)
                  : 0}m
              </p>
              <p className="text-sm text-[#6B7280]">Time</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setActiveLesson(null);
                setCompleted(false);
                setFinalState(null);
              }}
              className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg py-6 rounded-2xl"
            >
              <Star size={18} className="mr-2" />
              Try Another Lesson
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-[#E5E2DA] text-[#6B7280] py-5 rounded-2xl"
            >
              View Progress
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active lesson
  if (activeLesson) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        profileId={profileId}
        sessionId={sessionId}
        onComplete={handleLessonComplete}
        onExit={() => {
          setActiveLesson(null);
          setCompleted(false);
        }}
      />
    );
  }

  // Lesson browser
  return (
    <AppShell>
      <LessonBrowser
        profileId={profileId}
        sessionId={sessionId}
        onSelectLesson={setActiveLesson}
      />
    </AppShell>
  );
}

export default function LessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#F7F5EF]">
          <div className="text-5xl animate-bounce-gentle">🐼</div>
        </div>
      }
    >
      <LessonsContent />
    </Suspense>
  );
}
