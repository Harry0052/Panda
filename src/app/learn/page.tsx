"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { TutorialOverlay, useTutorial } from "@/components/tutorial/TutorialOverlay";
import type { TutorialStep } from "@/components/tutorial/TutorialOverlay";

type ProfileData = {
  id: string;
  name: string;
  nickname: string | null;
};

type SessionData = {
  id: string;
};

const LEARN_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='chat-input']",
    title: "Ask Panda Anything!",
    description: "Type your question here. You can ask about any subject — math, reading, science, and more!",
    position: "top",
  },
  {
    target: "[data-tutorial='suggested-prompts']",
    title: "Quick Start Ideas",
    description: "Not sure what to ask? Click one of these suggestions to get started!",
    position: "top",
  },
  {
    target: "[data-tutorial='nav-progress']",
    title: "Track Your Progress",
    description: "Check your learning progress, streaks, and achievements here!",
    position: "right",
  },
];

export default function LearnPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<Array<{ text: string; icon: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { showTutorial, completeTutorial } = useTutorial("learn");

  useEffect(() => {
    async function init() {
      try {
        // Get profile
        const profileRes = await fetch("/api/profile");
        const profileData = await profileRes.json();

        if (!profileData?.id) {
          router.push("/onboarding");
          return;
        }
        setProfile(profileData);

        // Create session
        const sessionRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profileData.id }),
        });
        const sessionData = await sessionRes.json();
        setSession(sessionData);

        // Get suggested prompts
        const progressRes = await fetch(`/api/progress?profileId=${profileData.id}`);
        const progressData = await progressRes.json();
        setSuggestedPrompts(
          progressData.suggestedPrompts || [
            { text: "Teach me something new about math!", icon: "🔢" },
            { text: "Can we practice reading together?", icon: "📖" },
            { text: "Help me with spelling!", icon: "✏️" },
            { text: "Tell me a fun science fact!", icon: "🔬" },
            { text: "Let's do a quiz!", icon: "🎯" },
            { text: "Draw something cool with me!", icon: "🎨" },
          ]
        );
      } catch {
        router.push("/onboarding");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !profile || !session) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce-gentle">🐼</div>
            <p className="text-[#6B7280] text-lg">Panda is getting ready...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
        <div data-tutorial="chat-input" className="flex-1 flex flex-col min-h-0">
          <div data-tutorial="suggested-prompts" className="flex-1 flex flex-col min-h-0">
            <ChatInterface
              profileId={profile.id}
              sessionId={session.id}
              profileName={profile.nickname || profile.name}
              suggestedPrompts={suggestedPrompts}
            />
          </div>
        </div>
      </div>

      {showTutorial && (
        <TutorialOverlay
          steps={LEARN_TUTORIAL_STEPS}
          onComplete={completeTutorial}
          onSkip={completeTutorial}
        />
      )}
    </AppShell>
  );
}
