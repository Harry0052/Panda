import { getDb } from "./schema";
import { v4 as uuid } from "uuid";
import type { Profile, LearnerModel, Session, Message, Achievement, Streak } from "./schema";

// ── Helpers ──
function parseJsonFields<T>(row: Record<string, unknown> | undefined, fields: string[]): T | null {
  if (!row) return null;
  const parsed = { ...row };
  for (const f of fields) {
    if (typeof parsed[f] === "string") {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = []; }
    }
  }
  return parsed as T;
}

function stringifyJsonFields(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const result = { ...data };
  for (const f of fields) {
    if (Array.isArray(result[f]) || (typeof result[f] === "object" && result[f] !== null)) {
      result[f] = JSON.stringify(result[f]);
    }
  }
  return result;
}

const PROFILE_JSON_FIELDS = [
  "favorite_subjects", "least_favorite_subjects", "favorite_animals",
  "favorite_colors", "favorite_topics", "goals", "interests",
];

// ── Profiles ──
export function getProfile(id: string): Profile | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return parseJsonFields<Profile>(row, PROFILE_JSON_FIELDS);
}

export function getFirstProfile(): Profile | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1").get() as Record<string, unknown> | undefined;
  return parseJsonFields<Profile>(row, PROFILE_JSON_FIELDS);
}

export function getAllProfiles(): Profile[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM profiles ORDER BY created_at ASC").all() as Record<string, unknown>[];
  return rows.map((r) => parseJsonFields<Profile>(r, PROFILE_JSON_FIELDS)!);
}

export function createProfile(data: Partial<Profile>): Profile {
  const db = getDb();
  const id = data.id || uuid();
  const processed = stringifyJsonFields({ ...data, id }, PROFILE_JSON_FIELDS);

  const fields = Object.keys(processed);
  const placeholders = fields.map(() => "?").join(", ");
  const values = fields.map((f) => processed[f]);

  db.prepare(`INSERT INTO profiles (${fields.join(", ")}) VALUES (${placeholders})`).run(...values);

  // Create streak record
  db.prepare("INSERT INTO streaks (id, profile_id) VALUES (?, ?)").run(uuid(), id);

  // Create accessibility settings
  db.prepare("INSERT INTO accessibility_settings (profile_id) VALUES (?)").run(id);

  // Create communication model
  db.prepare("INSERT OR IGNORE INTO communication_model (profile_id) VALUES (?)").run(id);

  // Create engagement model
  db.prepare("INSERT OR IGNORE INTO engagement_model (profile_id) VALUES (?)").run(id);

  return getProfile(id)!;
}

export function updateProfile(id: string, data: Partial<Profile>): Profile {
  const db = getDb();
  const processed = stringifyJsonFields({ ...data, updated_at: new Date().toISOString() }, PROFILE_JSON_FIELDS);
  delete processed.id;

  const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
  const values = [...Object.values(processed), id];

  db.prepare(`UPDATE profiles SET ${sets} WHERE id = ?`).run(...values);
  return getProfile(id)!;
}

// ── Learner Model ──
export function getLearnerModels(profileId: string): LearnerModel[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM learner_model WHERE profile_id = ?").all(profileId) as Record<string, unknown>[];
  return rows.map((r) => parseJsonFields<LearnerModel>(r, ["error_patterns"])!);
}

export function getLearnerModel(profileId: string, subject: string, subtopic?: string): LearnerModel | null {
  const db = getDb();
  const row = subtopic
    ? db.prepare("SELECT * FROM learner_model WHERE profile_id = ? AND subject = ? AND subtopic = ?").get(profileId, subject, subtopic)
    : db.prepare("SELECT * FROM learner_model WHERE profile_id = ? AND subject = ? AND subtopic IS NULL").get(profileId, subject);
  return parseJsonFields<LearnerModel>(row as Record<string, unknown> | undefined, ["error_patterns"]);
}

export function upsertLearnerModel(profileId: string, subject: string, subtopic: string | null, data: Partial<LearnerModel>): LearnerModel {
  const db = getDb();
  const existing = getLearnerModel(profileId, subject, subtopic || undefined);

  if (existing) {
    const processed = stringifyJsonFields({ ...data, updated_at: new Date().toISOString() }, ["error_patterns"]);
    delete processed.id;
    delete processed.profile_id;
    delete processed.subject;
    delete processed.subtopic;

    const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
    const values = [...Object.values(processed), existing.id];
    db.prepare(`UPDATE learner_model SET ${sets} WHERE id = ?`).run(...values);
    return getLearnerModel(profileId, subject, subtopic || undefined)!;
  }

  const id = uuid();
  const processed = stringifyJsonFields({ ...data, id, profile_id: profileId, subject, subtopic }, ["error_patterns"]);
  const fields = Object.keys(processed);
  const placeholders = fields.map(() => "?").join(", ");
  db.prepare(`INSERT INTO learner_model (${fields.join(", ")}) VALUES (${placeholders})`).run(...Object.values(processed));
  return getLearnerModel(profileId, subject, subtopic || undefined)!;
}

// ── Sessions ──
export function createSession(profileId: string, subject?: string): Session {
  const db = getDb();
  const id = uuid();
  db.prepare("INSERT INTO sessions (id, profile_id, subject) VALUES (?, ?, ?)").run(id, profileId, subject || null);

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const streak = db.prepare("SELECT * FROM streaks WHERE profile_id = ?").get(profileId) as Record<string, unknown> | undefined;
  if (streak) {
    const lastDate = streak.last_active_date as string | null;
    let currentStreak = (streak.current_streak as number) || 0;
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      currentStreak = lastDate === yesterday ? currentStreak + 1 : 1;
      const longest = Math.max(currentStreak, (streak.longest_streak as number) || 0);
      db.prepare(
        "UPDATE streaks SET current_streak = ?, longest_streak = ?, last_active_date = ?, total_sessions = total_sessions + 1 WHERE profile_id = ?"
      ).run(currentStreak, longest, today, profileId);
    } else {
      db.prepare("UPDATE streaks SET total_sessions = total_sessions + 1 WHERE profile_id = ?").run(profileId);
    }
  }

  return getSession(id)!;
}

export function getSession(id: string): Session | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return parseJsonFields<Session>(row, ["topics_covered", "topics_confused", "topics_mastered", "what_worked", "review_next"]);
}

export function getRecentSessions(profileId: string, limit = 10): Session[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM sessions WHERE profile_id = ? ORDER BY started_at DESC LIMIT ?").all(profileId, limit) as Record<string, unknown>[];
  return rows.map((r) => parseJsonFields<Session>(r, ["topics_covered", "topics_confused", "topics_mastered", "what_worked", "review_next"])!);
}

export function updateSession(id: string, data: Partial<Session>): Session {
  const db = getDb();
  const processed = stringifyJsonFields({ ...data }, ["topics_covered", "topics_confused", "topics_mastered", "what_worked", "review_next"]);
  delete processed.id;
  const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE sessions SET ${sets} WHERE id = ?`).run(...Object.values(processed), id);
  return getSession(id)!;
}

// ── Messages ──
export function addMessage(sessionId: string, profileId: string, role: string, content: string, type = "text", metadata = {}): Message {
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO messages (id, session_id, profile_id, role, content, message_type, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, sessionId, profileId, role, content, type, JSON.stringify(metadata));
  db.prepare("UPDATE sessions SET messages_count = messages_count + 1 WHERE id = ?").run(sessionId);
  const row = db.prepare("SELECT * FROM messages WHERE id = ?").get(id) as Record<string, unknown>;
  return parseJsonFields<Message>(row, ["metadata"])!;
}

export function getSessionMessages(sessionId: string): Message[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC").all(sessionId) as Record<string, unknown>[];
  return rows.map((r) => parseJsonFields<Message>(r, ["metadata"])!);
}

// ── Achievements ──
export function addAchievement(profileId: string, type: string, title: string, description?: string, icon?: string): Achievement {
  const db = getDb();
  const id = uuid();
  db.prepare("INSERT INTO achievements (id, profile_id, type, title, description, icon) VALUES (?, ?, ?, ?, ?, ?)").run(id, profileId, type, title, description || null, icon || null);
  return db.prepare("SELECT * FROM achievements WHERE id = ?").get(id) as Achievement;
}

export function getAchievements(profileId: string): Achievement[] {
  const db = getDb();
  return db.prepare("SELECT * FROM achievements WHERE profile_id = ? ORDER BY earned_at DESC").all(profileId) as Achievement[];
}

// ── Streaks ──
export function getStreak(profileId: string): Streak | null {
  const db = getDb();
  return db.prepare("SELECT * FROM streaks WHERE profile_id = ?").get(profileId) as Streak | null;
}

export function updateBambooHeight(profileId: string, increment: number): void {
  const db = getDb();
  db.prepare("UPDATE streaks SET bamboo_height = bamboo_height + ? WHERE profile_id = ?").run(increment, profileId);
}

// ── Accessibility ──
export function getAccessibilitySettings(profileId: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM accessibility_settings WHERE profile_id = ?").get(profileId) as Record<string, unknown> | null;
}

export function updateAccessibilitySettings(profileId: string, settings: Record<string, unknown>) {
  const db = getDb();
  const sets = Object.keys(settings).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE accessibility_settings SET ${sets} WHERE profile_id = ?`).run(...Object.values(settings), profileId);
}

// ── Stats ──
export function getProfileStats(profileId: string) {
  const db = getDb();
  const streak = getStreak(profileId);
  const achievements = getAchievements(profileId);
  const models = getLearnerModels(profileId);
  const recentSessions = getRecentSessions(profileId, 5);

  const subjectProficiency: Record<string, number> = {};
  for (const m of models) {
    if (!m.subtopic) {
      subjectProficiency[m.subject] = m.proficiency;
    }
  }

  const totalLessons = db.prepare("SELECT COUNT(*) as count FROM lesson_progress WHERE profile_id = ? AND completed = 1").get(profileId) as { count: number };

  return {
    streak,
    achievements,
    subjectProficiency,
    recentSessions,
    totalLessonsCompleted: totalLessons.count,
    learnerModels: models,
  };
}
