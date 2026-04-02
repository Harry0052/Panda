"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Star,
  Trophy,
  BookOpen,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

type DashboardData = {
  profileName: string;
  streak: { current_streak: number; longest_streak: number; bamboo_height: number; total_sessions: number };
  achievements: Array<{ id: string; title: string; icon: string | null; earned_at: string }>;
  subjectProficiency: Record<string, number>;
  totalLessonsCompleted: number;
  recentSessions: Array<{ id: string; subject: string | null; started_at: string; topics_covered: string[] }>;
  suggestedTopics: string[];
};

function BambooGrowth({ height }: { height: number }) {
  const segments = Math.min(Math.floor(height / 10), 20);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="w-8 mx-auto"
            style={{ originY: 1 }}
          >
            <div className="h-6 bg-[#A8D08D] rounded-sm border-b-2 border-[#4F7C57]/20 relative">
              {i % 3 === 0 && (
                <div className="absolute -right-3 top-0 w-4 h-2 bg-[#A8D08D] rounded-r-full" />
              )}
            </div>
            <div className="h-1 bg-[#4F7C57]/30 rounded-full mx-1" />
          </motion.div>
        ))}
        <div className="w-8 h-3 bg-[#8B6914] rounded-b-md mx-auto" />
      </div>
      <p className="text-xs text-[#6B7280] mt-2 font-medium">{height}cm tall!</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} className="flex-1">
      <Card className="p-4 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#2F2F2F]">{value}</p>
            <p className="text-xs text-[#6B7280]">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ChildDashboard({ data }: { data: DashboardData }) {
  const subjectColors: Record<string, string> = {
    Math: "bg-[#87CEEB]",
    Reading: "bg-[#A8D08D]",
    Writing: "bg-[#F5A6C0]",
    Science: "bg-[#F4C95D]",
    "Social Studies": "bg-[#C4B5E0]",
    Art: "bg-[#F5A6C0]",
    Music: "bg-[#87CEEB]",
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2F2F]">
            Hi {data.profileName}! 🐼
          </h1>
          <p className="text-[#6B7280] mt-1">Here&apos;s how you&apos;re doing!</p>
        </div>
        <Link href="/learn">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#4F7C57] text-white px-6 py-3 rounded-2xl font-medium shadow-md flex items-center gap-2"
          >
            <Sparkles size={18} />
            Start Learning
          </motion.button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Flame size={20} className="text-orange-500" />}
          label="Day Streak"
          value={data.streak.current_streak}
          color="bg-orange-50"
        />
        <StatCard
          icon={<Star size={20} className="text-[#F4C95D]" />}
          label="Achievements"
          value={data.achievements.length}
          color="bg-yellow-50"
        />
        <StatCard
          icon={<BookOpen size={20} className="text-[#4F7C57]" />}
          label="Lessons Done"
          value={data.totalLessonsCompleted}
          color="bg-green-50"
        />
        <StatCard
          icon={<Trophy size={20} className="text-[#C4B5E0]" />}
          label="Best Streak"
          value={data.streak.longest_streak}
          color="bg-purple-50"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Bamboo growth */}
        <Card className="p-6 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold text-[#2F2F2F] mb-4 flex items-center gap-2">
            🎋 Your Bamboo
          </h3>
          <div className="flex justify-center py-4">
            <BambooGrowth height={data.streak.bamboo_height} />
          </div>
          <p className="text-center text-sm text-[#6B7280] mt-2">
            Keep learning to grow your bamboo!
          </p>
        </Card>

        {/* Subject mastery */}
        <Card className="p-6 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm md:col-span-2">
          <h3 className="font-bold text-[#2F2F2F] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#4F7C57]" />
            Subject Confidence
          </h3>
          <div className="space-y-4">
            {Object.entries(data.subjectProficiency).length > 0 ? (
              Object.entries(data.subjectProficiency).map(([subject, level]) => (
                <div key={subject}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-[#2F2F2F]">{subject}</span>
                    <span className="text-sm text-[#6B7280]">{Math.round(level * 100)}%</span>
                  </div>
                  <div className="h-4 bg-[#F0EDE6] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${level * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full", subjectColors[subject] || "bg-[#A8D08D]")}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#6B7280] text-center py-8">
                Start learning to see your progress here! 🌱
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm">
        <h3 className="font-bold text-[#2F2F2F] mb-4 flex items-center gap-2">
          <Star size={18} className="text-[#F4C95D]" />
          Achievements
        </h3>
        {data.achievements.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {data.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#DDEED5] border border-[#A8D08D]"
              >
                <span className="text-xl">{achievement.icon || "⭐"}</span>
                <span className="text-sm font-medium text-[#2F2F2F]">{achievement.title}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B7280] text-center py-6">
            Complete lessons to earn your first achievement! 🌟
          </p>
        )}
      </Card>

      {/* Suggested topics */}
      {data.suggestedTopics.length > 0 && (
        <Card className="p-6 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold text-[#2F2F2F] mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[#4F7C57]" />
            Recommended Next
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.suggestedTopics.map((topic) => (
              <Link key={topic} href={`/learn?topic=${encodeURIComponent(topic)}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F5EF] border border-[#E5E2DA] hover:border-[#A8D08D] transition-colors"
                >
                  <span className="font-medium text-[#2F2F2F]">{topic}</span>
                  <ChevronRight size={18} className="text-[#6B7280]" />
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Recent activity */}
      {data.recentSessions.length > 0 && (
        <Card className="p-6 border-2 border-[#E5E2DA] rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold text-[#2F2F2F] mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {data.recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7F5EF]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#DDEED5] flex items-center justify-center">
                    <BookOpen size={14} className="text-[#4F7C57]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2F2F2F]">
                      {session.subject || "General Learning"}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(session.started_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {session.topics_covered.length > 0 && (
                  <div className="flex gap-1">
                    {session.topics_covered.slice(0, 2).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="bg-[#DDEED5] text-[#4F7C57] text-xs"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
