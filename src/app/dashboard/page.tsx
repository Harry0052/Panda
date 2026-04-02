"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChildDashboard } from "@/components/dashboard/ChildDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "child";
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();
        if (!profileData?.id) {
          router.push("/onboarding");
          return;
        }
        setProfile(profileData);

        const progressRes = await fetch(`/api/progress?profileId=${profileData.id}`);
        const progressData = await progressRes.json();
        setData(progressData);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading || !data || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce-gentle">🐼</div>
          <p className="text-[#6B7280] text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const childData = {
    profileName: (profile.nickname as string) || (profile.name as string),
    streak: (data.streak as { current_streak: number; longest_streak: number; bamboo_height: number; total_sessions: number }) || {
      current_streak: 0,
      longest_streak: 0,
      bamboo_height: 0,
      total_sessions: 0,
    },
    achievements: (data.achievements as Array<{ id: string; title: string; icon: string | null; earned_at: string }>) || [],
    subjectProficiency: (data.subjectProficiency as Record<string, number>) || {},
    totalLessonsCompleted: (data.totalLessonsCompleted as number) || 0,
    recentSessions: (data.recentSessions as Array<{ id: string; subject: string | null; started_at: string; topics_covered: string[] }>) || [],
    suggestedTopics: (data.suggestedTopics as string[]) || [],
  };

  const parentData = {
    ...childData,
    age: profile.age as number | null,
    grade: profile.grade as string | null,
    learnerModels: (data.learnerModels as Array<{
      subject: string;
      subtopic: string | null;
      proficiency: number;
      confidence: number;
      attempts: number;
      mastery_level: string;
    }>) || [],
    recentSessions: (data.recentSessions as Array<{
      subject: string | null;
      started_at: string;
      topics_covered: string[];
      topics_confused: string[];
      engagement_score: number;
      duration_minutes: number;
    }>) || [],
    streak: {
      ...childData.streak,
      total_minutes: ((data.streak as Record<string, unknown>)?.total_minutes as number) || 0,
    },
  };

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex justify-center pt-6 px-4">
        <Tabs value={tab} className="w-auto">
          <TabsList className="bg-[#F0EDE6] rounded-xl p-1">
            <TabsTrigger
              value="child"
              onClick={() => router.push("/dashboard?tab=child")}
              className="rounded-lg px-6 data-[state=active]:bg-white"
            >
              🐼 My Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="parent"
              onClick={() => router.push("/dashboard?tab=parent")}
              className="rounded-lg px-6 data-[state=active]:bg-white"
            >
              👨‍👩‍👧 Parent View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "parent" ? (
        <ParentDashboard data={parentData} />
      ) : (
        <ChildDashboard data={childData} />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-5xl animate-bounce-gentle">🐼</div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </AppShell>
  );
}
