"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

type ParentData = {
  profileName: string;
  age: number | null;
  grade: string | null;
  streak: { current_streak: number; total_sessions: number; total_minutes: number };
  subjectProficiency: Record<string, number>;
  achievements: Array<{ title: string; earned_at: string }>;
  recentSessions: Array<{
    subject: string | null;
    started_at: string;
    topics_covered: string[];
    topics_confused: string[];
    engagement_score: number;
    duration_minutes: number;
  }>;
  learnerModels: Array<{
    subject: string;
    subtopic: string | null;
    proficiency: number;
    confidence: number;
    attempts: number;
    mastery_level: string;
  }>;
  totalLessonsCompleted: number;
};

function ProficiencyBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 0.7 ? "bg-[#4F7C57]" : value >= 0.4 ? "bg-[#F4C95D]" : "bg-orange-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#2F2F2F] font-medium">{label}</span>
        <span className="text-[#6B7280]">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-2.5 bg-[#F0EDE6] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

export function ParentDashboard({ data }: { data: ParentData }) {
  const strongSubjects = Object.entries(data.subjectProficiency)
    .filter(([, v]) => v >= 0.7)
    .map(([k]) => k);
  const weakSubjects = Object.entries(data.subjectProficiency)
    .filter(([, v]) => v < 0.4)
    .map(([k]) => k);

  const avgEngagement =
    data.recentSessions.length > 0
      ? data.recentSessions.reduce((sum, s) => sum + s.engagement_score, 0) /
        data.recentSessions.length
      : 0;

  const confusedTopics = data.recentSessions.flatMap((s) => s.topics_confused);
  const uniqueConfused = [...new Set(confusedTopics)].slice(0, 5);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2F2F2F]">Parent Dashboard</h1>
          <p className="text-[#6B7280]">
            {data.profileName}&apos;s learning overview
            {data.age && data.grade && ` (Age ${data.age}, ${data.grade})`}
          </p>
        </div>
        <Badge className="bg-[#DDEED5] text-[#4F7C57] px-3 py-1">
          {data.streak.current_streak} day streak
        </Badge>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-2 border-[#E5E2DA]">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
            <BookOpen size={14} />
            Total Sessions
          </div>
          <p className="text-2xl font-bold text-[#2F2F2F]">{data.streak.total_sessions}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-2 border-[#E5E2DA]">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
            <Clock size={14} />
            Total Time
          </div>
          <p className="text-2xl font-bold text-[#2F2F2F]">{data.streak.total_minutes}m</p>
        </Card>
        <Card className="p-4 rounded-2xl border-2 border-[#E5E2DA]">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
            <CheckCircle size={14} />
            Lessons Done
          </div>
          <p className="text-2xl font-bold text-[#2F2F2F]">{data.totalLessonsCompleted}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-2 border-[#E5E2DA]">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
            <BarChart3 size={14} />
            Engagement
          </div>
          <p className="text-2xl font-bold text-[#2F2F2F]">{Math.round(avgEngagement * 100)}%</p>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#F0EDE6] rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-lg data-[state=active]:bg-white">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
              <h3 className="font-bold text-[#2F2F2F] mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#4F7C57]" />
                Strengths
              </h3>
              {strongSubjects.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {strongSubjects.map((s) => (
                    <Badge key={s} className="bg-[#DDEED5] text-[#4F7C57]">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">Building mastery across subjects...</p>
              )}
            </Card>

            {/* Needs attention */}
            <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
              <h3 className="font-bold text-[#2F2F2F] mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-400" />
                Areas for Growth
              </h3>
              {weakSubjects.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {weakSubjects.map((s) => (
                    <Badge key={s} className="bg-orange-50 text-orange-600">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">No weak areas identified yet</p>
              )}
            </Card>
          </div>

          {/* Confused topics */}
          {uniqueConfused.length > 0 && (
            <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
              <h3 className="font-bold text-[#2F2F2F] mb-3 flex items-center gap-2">
                <TrendingDown size={16} className="text-[#6B7280]" />
                Recent Struggles
              </h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Topics where {data.profileName} needed extra help recently:
              </p>
              <div className="flex gap-2 flex-wrap">
                {uniqueConfused.map((t) => (
                  <Badge key={t} variant="outline" className="border-[#E5E2DA]">{t}</Badge>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
            <h3 className="font-bold text-[#2F2F2F] mb-4">Subject Proficiency</h3>
            <div className="space-y-4">
              {Object.entries(data.subjectProficiency).length > 0 ? (
                Object.entries(data.subjectProficiency)
                  .sort(([, a], [, b]) => b - a)
                  .map(([subject, level]) => (
                    <ProficiencyBar key={subject} value={level} label={subject} />
                  ))
              ) : (
                <p className="text-[#6B7280] text-center py-4">No subject data yet</p>
              )}
            </div>
          </Card>

          {/* Detailed mastery */}
          {data.learnerModels.filter((m) => m.subtopic).length > 0 && (
            <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
              <h3 className="font-bold text-[#2F2F2F] mb-4">Detailed Mastery</h3>
              <div className="space-y-3">
                {data.learnerModels
                  .filter((m) => m.subtopic)
                  .map((m) => (
                    <div
                      key={`${m.subject}-${m.subtopic}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5EF]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#2F2F2F]">
                          {m.subject} / {m.subtopic}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {m.attempts} attempts &middot; {m.mastery_level}
                        </p>
                      </div>
                      <Badge
                        className={
                          m.proficiency >= 0.7
                            ? "bg-[#DDEED5] text-[#4F7C57]"
                            : m.proficiency >= 0.4
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-orange-50 text-orange-600"
                        }
                      >
                        {Math.round(m.proficiency * 100)}%
                      </Badge>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-5 rounded-2xl border-2 border-[#E5E2DA]">
            <h3 className="font-bold text-[#2F2F2F] mb-4">Recent Sessions</h3>
            {data.recentSessions.length > 0 ? (
              <div className="space-y-3">
                {data.recentSessions.map((session, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#F7F5EF] space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#2F2F2F]">
                          {session.subject || "General Learning"}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {new Date(session.started_at).toLocaleDateString()} &middot;{" "}
                          {session.duration_minutes}min
                        </p>
                      </div>
                      <Badge className="bg-[#DDEED5] text-[#4F7C57]">
                        {Math.round(session.engagement_score * 100)}% engaged
                      </Badge>
                    </div>
                    {session.topics_covered.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {session.topics_covered.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs border-[#E5E2DA]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6B7280] text-center py-4">No sessions yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
