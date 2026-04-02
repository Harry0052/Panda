"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Type,
  Zap,
  Contrast,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Shield,
  HardDrive,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type AccessibilitySettings = {
  dyslexia_font: number;
  larger_text: number;
  reduced_motion: number;
  high_contrast: number;
};

type DbStats = {
  profiles: number;
  sessions: number;
  messages: number;
  events: number;
  achievements: number;
  databaseSizeMB: number;
  totalSizeMB: number;
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
  const [profileName, setProfileName] = useState("");
  const [settings, setSettings] = useState<AccessibilitySettings>({
    dyslexia_font: 0,
    larger_text: 0,
    reduced_motion: 0,
    high_contrast: 0,
  });
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile");
        const profile = await res.json();
        if (!profile?.id) {
          router.push("/onboarding");
          return;
        }
        setProfileId(profile.id);
        setProfileName(profile.nickname || profile.name);
      } catch {
        // Profile fetch failed — still show settings
      }

      const saved = localStorage.getItem("panda-accessibility");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          applySettings(parsed);
        } catch {
          // Ignore corrupt settings
        }
      }

      // Load DB stats
      try {
        const statsRes = await fetch("/api/data?action=stats");
        const stats = await statsRes.json();
        setDbStats(stats);
      } catch {
        // Stats not critical
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

  function showStatus(type: "success" | "error", text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  }

  function resetTutorials() {
    localStorage.removeItem("tutorial-learn");
    localStorage.removeItem("tutorial-dashboard");
    showStatus("success", "Tutorials reset! They'll show next time you visit those pages.");
  }

  async function handleExport() {
    try {
      const url = profileId
        ? `/api/data?action=export&profileId=${profileId}`
        : "/api/data?action=export";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `panda-export-${profileName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(a.href);

      showStatus("success", "Data exported successfully!");
    } catch {
      showStatus("error", "Export failed. Please try again.");
    }
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      // Basic validation
      const parsed = JSON.parse(text);
      if (!parsed.exportVersion || !parsed.profile) {
        showStatus("error", "Invalid export file. Make sure it's a Panda export.");
        return;
      }

      const res = await fetch("/api/data?action=import", {
        method: "POST",
        body: text,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }

      showStatus("success", `Imported ${parsed.profile.name}'s profile! Refreshing...`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      showStatus("error", message);
    }
  }

  async function handleResetAll() {
    try {
      const res = await fetch("/api/data?action=reset-all", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");

      localStorage.clear();
      showStatus("success", "All data erased. Redirecting to setup...");
      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 1500);
    } catch {
      showStatus("error", "Reset failed. Please try again.");
    }
  }

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#2F2F2F]">Settings</h1>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-[#DDEED5] text-[#4F7C57]"
                : "bg-red-50 text-red-600"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {statusMessage.text}
          </div>
        )}

        {/* Privacy & Data */}
        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-[#4F7C57]" />
            <h2 className="text-xl font-bold text-[#2F2F2F]">Privacy & Data</h2>
          </div>

          <div className="bg-[#DDEED5] rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-[#4F7C57]">🔒 Your data is 100% local</p>
            <div className="text-sm text-[#2F2F2F] space-y-2">
              <p>
                <strong>All data stays on this device.</strong> Profiles, learning progress, achievements,
                session history, and preferences are stored in a local database file on your computer.
              </p>
              <p>
                <strong>The only external connection</strong> is to the OpenAI API when your child
                chats with Panda. These requests contain the conversation text and are governed by
                {" "}OpenAI&apos;s data usage policies. No other data is ever sent anywhere.
              </p>
              <p>
                <strong>No account required.</strong> No email, no sign-up, no cloud sync, no tracking,
                no analytics, no ads. Just learning.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#6B7280]">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4F7C57]" />
              Database location: <code className="text-xs bg-[#F0EDE6] px-2 py-0.5 rounded">data/panda.db</code>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4F7C57]" />
              Uploads: <code className="text-xs bg-[#F0EDE6] px-2 py-0.5 rounded">data/uploads/</code>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4F7C57]" />
              Environment variable: <code className="text-xs bg-[#F0EDE6] px-2 py-0.5 rounded">OPENAI_API_KEY</code> (only one)
            </p>
          </div>
        </Card>

        {/* Storage Stats */}
        {dbStats && (
          <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive size={20} className="text-[#4F7C57]" />
              <h2 className="text-xl font-bold text-[#2F2F2F]">Local Storage</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F7F5EF] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#2F2F2F]">{dbStats.sessions}</p>
                <p className="text-xs text-[#6B7280]">Sessions</p>
              </div>
              <div className="bg-[#F7F5EF] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#2F2F2F]">{dbStats.messages}</p>
                <p className="text-xs text-[#6B7280]">Messages</p>
              </div>
              <div className="bg-[#F7F5EF] rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#2F2F2F]">{dbStats.achievements}</p>
                <p className="text-xs text-[#6B7280]">Achievements</p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              Database size: {dbStats.databaseSizeMB} MB | Total with uploads: {dbStats.totalSizeMB} MB
            </p>
          </Card>
        )}

        {/* Accessibility */}
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

        {/* Export & Import */}
        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-4">
          <h2 className="text-xl font-bold text-[#2F2F2F]">Export & Import Data</h2>
          <p className="text-[#6B7280] text-sm">
            Back up your child&apos;s learning data or transfer it to another device.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleExport}
              className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-xl"
            >
              <Download size={16} className="mr-2" />
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#E5E2DA] rounded-xl"
            >
              <Upload size={16} className="mr-2" />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
          <p className="text-xs text-[#6B7280]">
            Export creates a JSON file with all profile data, progress, achievements, and learning history.
            Import restores from a previously exported file.
          </p>
        </Card>

        {/* Tutorials */}
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

        {/* Danger Zone */}
        <Card className="p-6 rounded-2xl border-2 border-red-200 space-y-4">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h2>
          <p className="text-[#6B7280] text-sm">
            This permanently erases all data. Consider exporting first.
          </p>

          {!showResetConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
              className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={16} className="mr-2" />
              Erase All Data
            </Button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-red-600 font-medium">
                Are you sure? This will permanently delete all profiles, progress, achievements, and learning history. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleResetAll}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                >
                  Yes, Erase Everything
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* About */}
        <Card className="p-6 rounded-2xl border-2 border-[#E5E2DA] space-y-3">
          <h2 className="text-xl font-bold text-[#2F2F2F]">About Panda</h2>
          <p className="text-[#6B7280] text-sm">
            Panda is a local-first adaptive AI tutor that helps children learn through
            personalized, interactive lessons. Built with love for curious kids everywhere.
          </p>
          <div className="text-xs text-[#6B7280] space-y-1">
            <p>Stack: Next.js, SQLite, OpenAI, Tailwind CSS, Framer Motion</p>
            <p>All data local. One env var: OPENAI_API_KEY.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
