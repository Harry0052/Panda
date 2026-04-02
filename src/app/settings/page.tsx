"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, Type, Zap, Contrast, RotateCcw } from "lucide-react";

type AccessibilitySettings = {
  dyslexia_font: number;
  larger_text: number;
  reduced_motion: number;
  high_contrast: number;
};

function ToggleSetting({
  label,
  description,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F5EF]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-medium text-[#2F2F2F]">{label}</p>
          <p className="text-sm text-[#6B7280]">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-14 h-8 rounded-full transition-colors relative ${
          enabled ? "bg-[#4F7C57]" : "bg-[#E5E2DA]"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    dyslexia_font: 0,
    larger_text: 0,
    reduced_motion: 0,
    high_contrast: 0,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      const profile = await res.json();
      if (!profile?.id) {
        router.push("/onboarding");
        return;
      }
      setProfileId(profile.id);

      // Load settings from localStorage (also stored in DB)
      const saved = localStorage.getItem("panda-accessibility");
      if (saved) {
        setSettings(JSON.parse(saved));
        applySettings(JSON.parse(saved));
      }
    }
    load();
  }, [router]);

  function applySettings(s: AccessibilitySettings) {
    const body = document.body;
    body.classList.toggle("dyslexia-font", !!s.dyslexia_font);
    body.classList.toggle("larger-text", !!s.larger_text);
    body.classList.toggle("reduced-motion", !!s.reduced_motion);
    body.classList.toggle("high-contrast", !!s.high_contrast);
  }

  function updateSetting(key: keyof AccessibilitySettings) {
    const newSettings = { ...settings, [key]: settings[key] ? 0 : 1 };
    setSettings(newSettings);
    localStorage.setItem("panda-accessibility", JSON.stringify(newSettings));
    applySettings(newSettings);
  }

  function resetTutorials() {
    localStorage.removeItem("tutorial-learn");
    localStorage.removeItem("tutorial-dashboard");
    alert("Tutorials have been reset! They will show next time you visit those pages.");
  }

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#2F2F2F]">Settings</h1>

        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-4">
          <h2 className="text-xl font-bold text-[#2F2F2F]">Accessibility</h2>
          <p className="text-[#6B7280] text-sm">
            Make Panda more comfortable for your child.
          </p>

          <div className="space-y-3">
            <ToggleSetting
              label="Dyslexia-Friendly Font"
              description="Uses wider, more readable letter spacing"
              icon={<Type size={18} className="text-[#4F7C57]" />}
              enabled={!!settings.dyslexia_font}
              onToggle={() => updateSetting("dyslexia_font")}
            />
            <ToggleSetting
              label="Larger Text"
              description="Increases text size throughout the app"
              icon={<Eye size={18} className="text-[#4F7C57]" />}
              enabled={!!settings.larger_text}
              onToggle={() => updateSetting("larger_text")}
            />
            <ToggleSetting
              label="Reduced Motion"
              description="Disables animations for less visual distraction"
              icon={<Zap size={18} className="text-[#4F7C57]" />}
              enabled={!!settings.reduced_motion}
              onToggle={() => updateSetting("reduced_motion")}
            />
            <ToggleSetting
              label="High Contrast"
              description="Increases contrast for better readability"
              icon={<Contrast size={18} className="text-[#4F7C57]" />}
              enabled={!!settings.high_contrast}
              onToggle={() => updateSetting("high_contrast")}
            />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-4">
          <h2 className="text-xl font-bold text-[#2F2F2F]">Tutorials</h2>
          <p className="text-[#6B7280] text-sm">
            Reset the guided tours to see them again.
          </p>
          <Button
            variant="outline"
            onClick={resetTutorials}
            className="rounded-xl border-[#E5E2DA]"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset All Tutorials
          </Button>
        </Card>

        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-3">
          <h2 className="text-xl font-bold text-[#2F2F2F]">About Panda</h2>
          <p className="text-[#6B7280] text-sm">
            Panda is a local-first AI tutor. All your data stays on this computer.
            No information is sent to any server except the AI tutoring requests (sent to OpenAI).
          </p>
          <p className="text-[#6B7280] text-sm">
            Requires an OpenAI API key set as the OPENAI_API_KEY environment variable.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
