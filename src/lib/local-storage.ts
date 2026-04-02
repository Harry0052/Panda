/**
 * Local Storage Service
 *
 * Abstraction layer for all local data operations. This is the single
 * gateway for persistence — everything goes through here or through
 * the db/queries module (which uses the same SQLite database).
 *
 * Architecture:
 * - SQLite database at data/panda.db (via better-sqlite3)
 * - Local filesystem at data/ for uploads and exports
 * - No cloud, no remote, no SaaS
 */

import { getDb } from "@/db/schema";
import * as queries from "@/db/queries";
import {
  getAcademicModels,
  getCommunicationModel,
  getEngagementModel,
  getRecentEvents,
  getAdaptationHistory,
} from "@/lib/learner-brain";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const EXPORTS_DIR = path.join(DATA_DIR, "exports");

// ══════════════════════════════════════════════════════════════
// Directory Management
// ══════════════════════════════════════════════════════════════

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function initializeStorage(): void {
  ensureDir(DATA_DIR);
  ensureDir(UPLOADS_DIR);
  ensureDir(EXPORTS_DIR);
  // Ensure DB is initialized
  getDb();
}

// ══════════════════════════════════════════════════════════════
// File Storage Helpers
// ══════════════════════════════════════════════════════════════

export function saveUpload(profileId: string, filename: string, data: Buffer): string {
  const profileDir = path.join(UPLOADS_DIR, profileId);
  ensureDir(profileDir);

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const finalName = `${timestamp}-${safeName}`;
  const filePath = path.join(profileDir, finalName);

  fs.writeFileSync(filePath, data);
  return filePath;
}

export function getUploadPath(profileId: string, filename: string): string {
  return path.join(UPLOADS_DIR, profileId, filename);
}

export function listUploads(profileId: string): string[] {
  const profileDir = path.join(UPLOADS_DIR, profileId);
  if (!fs.existsSync(profileDir)) return [];
  return fs.readdirSync(profileDir).sort().reverse();
}

export function deleteUpload(profileId: string, filename: string): boolean {
  const filePath = path.join(UPLOADS_DIR, profileId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
// Data Export — Full profile export as JSON
// ══════════════════════════════════════════════════════════════

export type ExportedProfile = {
  exportVersion: number;
  exportedAt: string;
  profile: ReturnType<typeof queries.getProfile>;
  streak: ReturnType<typeof queries.getStreak>;
  achievements: ReturnType<typeof queries.getAchievements>;
  sessions: ReturnType<typeof queries.getRecentSessions>;
  academicModels: ReturnType<typeof getAcademicModels>;
  communicationModel: ReturnType<typeof getCommunicationModel>;
  engagementModel: ReturnType<typeof getEngagementModel>;
  recentEvents: ReturnType<typeof getRecentEvents>;
  adaptationHistory: ReturnType<typeof getAdaptationHistory>;
  accessibilitySettings: ReturnType<typeof queries.getAccessibilitySettings>;
};

export function exportProfileData(profileId: string): ExportedProfile | null {
  const profile = queries.getProfile(profileId);
  if (!profile) return null;

  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    profile,
    streak: queries.getStreak(profileId),
    achievements: queries.getAchievements(profileId),
    sessions: queries.getRecentSessions(profileId, 100),
    academicModels: getAcademicModels(profileId),
    communicationModel: getCommunicationModel(profileId),
    engagementModel: getEngagementModel(profileId),
    recentEvents: getRecentEvents(profileId, 200),
    adaptationHistory: getAdaptationHistory(profileId, 50),
    accessibilitySettings: queries.getAccessibilitySettings(profileId),
  };
}

export function exportProfileToFile(profileId: string): string | null {
  const data = exportProfileData(profileId);
  if (!data) return null;

  ensureDir(EXPORTS_DIR);
  const name = (data.profile?.nickname || data.profile?.name || "student").replace(/\s+/g, "-").toLowerCase();
  const filename = `panda-export-${name}-${Date.now()}.json`;
  const filePath = path.join(EXPORTS_DIR, filename);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

// ══════════════════════════════════════════════════════════════
// Data Import — Restore from exported JSON
// ══════════════════════════════════════════════════════════════

export function importProfileData(jsonData: string): { success: boolean; profileId?: string; error?: string } {
  try {
    const data = JSON.parse(jsonData) as ExportedProfile;

    if (!data.exportVersion || !data.profile) {
      return { success: false, error: "Invalid export file format" };
    }

    const profile = data.profile;
    if (!profile) {
      return { success: false, error: "No profile data found in export" };
    }

    // Create the profile (generates new ID to avoid conflicts)
    const imported = queries.createProfile({
      name: profile.name,
      nickname: profile.nickname,
      age: profile.age,
      grade: profile.grade,
      school_level: profile.school_level,
      favorite_subjects: profile.favorite_subjects,
      least_favorite_subjects: profile.least_favorite_subjects,
      reading_level: profile.reading_level,
      writing_confidence: profile.writing_confidence,
      math_confidence: profile.math_confidence,
      attention_span: profile.attention_span,
      pace_preference: profile.pace_preference,
      favorite_animals: profile.favorite_animals,
      favorite_colors: profile.favorite_colors,
      favorite_topics: profile.favorite_topics,
      goals: profile.goals,
      parent_notes: profile.parent_notes,
      learning_support_needs: profile.learning_support_needs,
      interests: profile.interests,
      preferred_teaching_style: profile.preferred_teaching_style,
    });

    // Restore streak data
    if (data.streak) {
      const db = getDb();
      db.prepare(
        "UPDATE streaks SET current_streak = ?, longest_streak = ?, last_active_date = ?, total_sessions = ?, total_minutes = ?, bamboo_height = ? WHERE profile_id = ?"
      ).run(
        data.streak.current_streak, data.streak.longest_streak,
        data.streak.last_active_date, data.streak.total_sessions,
        data.streak.total_minutes, data.streak.bamboo_height,
        imported.id,
      );
    }

    // Restore achievements
    if (data.achievements) {
      for (const a of data.achievements) {
        queries.addAchievement(imported.id, a.type, a.title, a.description || undefined, a.icon || undefined);
      }
    }

    // Restore accessibility settings
    if (data.accessibilitySettings) {
      const settings = { ...data.accessibilitySettings };
      delete settings.profile_id;
      queries.updateAccessibilitySettings(imported.id, settings);
    }

    return { success: true, profileId: imported.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════
// Data Reset — Clean slate
// ══════════════════════════════════════════════════════════════

export function resetAllData(): void {
  const db = getDb();

  // Drop all data in reverse dependency order
  db.exec(`
    DELETE FROM adaptation_log;
    DELETE FROM interaction_events;
    DELETE FROM messages;
    DELETE FROM lesson_progress;
    DELETE FROM achievements;
    DELETE FROM academic_model;
    DELETE FROM learner_model;
    DELETE FROM sessions;
    DELETE FROM engagement_model;
    DELETE FROM communication_model;
    DELETE FROM accessibility_settings;
    DELETE FROM streaks;
    DELETE FROM profiles;
  `);

  // Clean uploads
  if (fs.existsSync(UPLOADS_DIR)) {
    fs.rmSync(UPLOADS_DIR, { recursive: true, force: true });
    ensureDir(UPLOADS_DIR);
  }
}

export function resetProfileData(profileId: string): void {
  const db = getDb();

  db.prepare("DELETE FROM adaptation_log WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM interaction_events WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM messages WHERE profile_id IN (SELECT id FROM sessions WHERE profile_id = ?)").run(profileId);
  db.prepare("DELETE FROM lesson_progress WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM achievements WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM academic_model WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM learner_model WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM sessions WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM engagement_model WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM communication_model WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM accessibility_settings WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM streaks WHERE profile_id = ?").run(profileId);
  db.prepare("DELETE FROM profiles WHERE id = ?").run(profileId);

  // Clean profile uploads
  const profileUploads = path.join(UPLOADS_DIR, profileId);
  if (fs.existsSync(profileUploads)) {
    fs.rmSync(profileUploads, { recursive: true, force: true });
  }
}

// ══════════════════════════════════════════════════════════════
// Database Health
// ══════════════════════════════════════════════════════════════

export function getDatabaseStats() {
  const db = getDb();
  const profileCount = (db.prepare("SELECT COUNT(*) as c FROM profiles").get() as { c: number }).c;
  const sessionCount = (db.prepare("SELECT COUNT(*) as c FROM sessions").get() as { c: number }).c;
  const messageCount = (db.prepare("SELECT COUNT(*) as c FROM messages").get() as { c: number }).c;
  const eventCount = (db.prepare("SELECT COUNT(*) as c FROM interaction_events").get() as { c: number }).c;
  const achievementCount = (db.prepare("SELECT COUNT(*) as c FROM achievements").get() as { c: number }).c;

  // Database file size
  const dbPath = path.join(DATA_DIR, "panda.db");
  const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

  // Uploads size
  let uploadsSize = 0;
  if (fs.existsSync(UPLOADS_DIR)) {
    const walkDir = (dir: string): number => {
      let size = 0;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) size += walkDir(fullPath);
        else size += fs.statSync(fullPath).size;
      }
      return size;
    };
    uploadsSize = walkDir(UPLOADS_DIR);
  }

  return {
    profiles: profileCount,
    sessions: sessionCount,
    messages: messageCount,
    events: eventCount,
    achievements: achievementCount,
    databaseSizeBytes: dbSize,
    uploadsSizeBytes: uploadsSize,
    totalSizeBytes: dbSize + uploadsSize,
    databaseSizeMB: Math.round(dbSize / 1024 / 1024 * 100) / 100,
    totalSizeMB: Math.round((dbSize + uploadsSize) / 1024 / 1024 * 100) / 100,
  };
}
