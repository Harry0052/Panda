import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "panda.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initializeSchema(_db);
  return _db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT,
      age INTEGER,
      grade TEXT,
      school_level TEXT,
      avatar_seed TEXT,
      favorite_subjects TEXT DEFAULT '[]',
      least_favorite_subjects TEXT DEFAULT '[]',
      reading_level TEXT DEFAULT 'medium',
      writing_confidence TEXT DEFAULT 'medium',
      math_confidence TEXT DEFAULT 'medium',
      attention_span TEXT DEFAULT 'medium',
      pace_preference TEXT DEFAULT 'medium',
      favorite_animals TEXT DEFAULT '[]',
      favorite_colors TEXT DEFAULT '[]',
      favorite_topics TEXT DEFAULT '[]',
      goals TEXT DEFAULT '[]',
      parent_notes TEXT,
      learning_support_needs TEXT,
      interests TEXT DEFAULT '[]',
      preferred_teaching_style TEXT DEFAULT 'visual',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learner_model (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      subject TEXT NOT NULL,
      subtopic TEXT,
      proficiency REAL DEFAULT 0.5,
      confidence REAL DEFAULT 0.5,
      attempts INTEGER DEFAULT 0,
      successes INTEGER DEFAULT 0,
      error_patterns TEXT DEFAULT '[]',
      best_format TEXT DEFAULT 'visual',
      last_practiced TEXT,
      mastery_level TEXT DEFAULT 'novice',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(profile_id, subject, subtopic)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT,
      subject TEXT,
      topics_covered TEXT DEFAULT '[]',
      topics_confused TEXT DEFAULT '[]',
      topics_mastered TEXT DEFAULT '[]',
      what_worked TEXT DEFAULT '[]',
      review_next TEXT DEFAULT '[]',
      mood_start TEXT,
      mood_end TEXT,
      engagement_score REAL DEFAULT 0.5,
      messages_count INTEGER DEFAULT 0,
      duration_minutes INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      earned_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      total_sessions INTEGER DEFAULT 0,
      total_minutes INTEGER DEFAULT 0,
      bamboo_height INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      lesson_type TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      score REAL,
      completed INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 1,
      time_spent_seconds INTEGER DEFAULT 0,
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accessibility_settings (
      profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
      dyslexia_font INTEGER DEFAULT 0,
      larger_text INTEGER DEFAULT 0,
      reduced_motion INTEGER DEFAULT 0,
      high_contrast INTEGER DEFAULT 0,
      text_scale REAL DEFAULT 1.0
    );

    -- ── Deep Learner Model Tables ──

    CREATE TABLE IF NOT EXISTS academic_model (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      subject TEXT NOT NULL,
      subtopic TEXT,
      exposure_count INTEGER DEFAULT 0,
      mastery_estimate REAL DEFAULT 0.3,
      confidence_estimate REAL DEFAULT 0.5,
      avg_speed_seconds REAL DEFAULT 0,
      correctness_rate REAL DEFAULT 0,
      hint_dependence REAL DEFAULT 0,
      hints_given INTEGER DEFAULT 0,
      hints_used INTEGER DEFAULT 0,
      retry_count INTEGER DEFAULT 0,
      frustration_risk REAL DEFAULT 0,
      boredom_risk REAL DEFAULT 0,
      retention_strength REAL DEFAULT 0.5,
      last_correct_at TEXT,
      last_incorrect_at TEXT,
      consecutive_correct INTEGER DEFAULT 0,
      consecutive_incorrect INTEGER DEFAULT 0,
      misconceptions TEXT DEFAULT '[]',
      successful_formats TEXT DEFAULT '[]',
      failed_formats TEXT DEFAULT '[]',
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(profile_id, subject, subtopic)
    );

    CREATE TABLE IF NOT EXISTS communication_model (
      profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
      vocab_complexity_tolerance REAL DEFAULT 0.5,
      sentence_length_tolerance REAL DEFAULT 0.5,
      prefers_stories INTEGER DEFAULT 0,
      prefers_steps INTEGER DEFAULT 0,
      prefers_visuals INTEGER DEFAULT 1,
      prefers_analogies INTEGER DEFAULT 0,
      prefers_quizzes INTEGER DEFAULT 0,
      prefers_direct_answer INTEGER DEFAULT 0,
      prefers_guided_discovery INTEGER DEFAULT 1,
      preferred_praise_style TEXT DEFAULT 'enthusiastic',
      preferred_lesson_length TEXT DEFAULT 'medium',
      response_verbosity_preference REAL DEFAULT 0.5,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS engagement_model (
      profile_id TEXT PRIMARY KEY REFERENCES profiles(id),
      task_completion_rate REAL DEFAULT 0,
      tasks_started INTEGER DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      avg_time_on_activity_seconds REAL DEFAULT 0,
      avg_response_latency_ms REAL DEFAULT 0,
      dropout_points TEXT DEFAULT '[]',
      most_engaging_formats TEXT DEFAULT '[]',
      least_engaging_formats TEXT DEFAULT '[]',
      session_length_trend TEXT DEFAULT 'stable',
      engagement_by_subject TEXT DEFAULT '{}',
      engagement_by_format TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interaction_events (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      session_id TEXT REFERENCES sessions(id),
      event_type TEXT NOT NULL,
      subject TEXT,
      subtopic TEXT,
      was_correct INTEGER,
      difficulty REAL,
      hints_offered INTEGER DEFAULT 0,
      hints_used INTEGER DEFAULT 0,
      time_spent_ms INTEGER DEFAULT 0,
      response_latency_ms INTEGER DEFAULT 0,
      format_used TEXT,
      frustration_signals TEXT DEFAULT '[]',
      engagement_signals TEXT DEFAULT '[]',
      misconception_detected TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS adaptation_log (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      session_id TEXT REFERENCES sessions(id),
      chosen_level TEXT NOT NULL,
      chosen_format TEXT NOT NULL,
      reason_difficulty TEXT NOT NULL,
      reason_format TEXT NOT NULL,
      reason_examples TEXT,
      reason_review_or_challenge TEXT,
      tone TEXT NOT NULL,
      complexity_level REAL NOT NULL,
      context_snapshot TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_academic_model_profile ON academic_model(profile_id);
    CREATE INDEX IF NOT EXISTS idx_interaction_events_profile ON interaction_events(profile_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_interaction_events_subject ON interaction_events(profile_id, subject, subtopic);
    CREATE INDEX IF NOT EXISTS idx_adaptation_log_profile ON adaptation_log(profile_id, created_at);
  `);
}

export type Profile = {
  id: string;
  name: string;
  nickname: string | null;
  age: number | null;
  grade: string | null;
  school_level: string | null;
  avatar_seed: string | null;
  favorite_subjects: string[];
  least_favorite_subjects: string[];
  reading_level: string;
  writing_confidence: string;
  math_confidence: string;
  attention_span: string;
  pace_preference: string;
  favorite_animals: string[];
  favorite_colors: string[];
  favorite_topics: string[];
  goals: string[];
  parent_notes: string | null;
  learning_support_needs: string | null;
  interests: string[];
  preferred_teaching_style: string;
  created_at: string;
  updated_at: string;
};

export type LearnerModel = {
  id: string;
  profile_id: string;
  subject: string;
  subtopic: string | null;
  proficiency: number;
  confidence: number;
  attempts: number;
  successes: number;
  error_patterns: string[];
  best_format: string;
  last_practiced: string | null;
  mastery_level: string;
  updated_at: string;
};

export type Session = {
  id: string;
  profile_id: string;
  started_at: string;
  ended_at: string | null;
  subject: string | null;
  topics_covered: string[];
  topics_confused: string[];
  topics_mastered: string[];
  what_worked: string[];
  review_next: string[];
  mood_start: string | null;
  mood_end: string | null;
  engagement_score: number;
  messages_count: number;
  duration_minutes: number;
};

export type Message = {
  id: string;
  session_id: string;
  profile_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  message_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Achievement = {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
};

export type Streak = {
  id: string;
  profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_sessions: number;
  total_minutes: number;
  bamboo_height: number;
};

export type AcademicModel = {
  id: string;
  profile_id: string;
  subject: string;
  subtopic: string | null;
  exposure_count: number;
  mastery_estimate: number;
  confidence_estimate: number;
  avg_speed_seconds: number;
  correctness_rate: number;
  hint_dependence: number;
  hints_given: number;
  hints_used: number;
  retry_count: number;
  frustration_risk: number;
  boredom_risk: number;
  retention_strength: number;
  last_correct_at: string | null;
  last_incorrect_at: string | null;
  consecutive_correct: number;
  consecutive_incorrect: number;
  misconceptions: string[];
  successful_formats: string[];
  failed_formats: string[];
  updated_at: string;
};

export type CommunicationModel = {
  profile_id: string;
  vocab_complexity_tolerance: number;
  sentence_length_tolerance: number;
  prefers_stories: boolean;
  prefers_steps: boolean;
  prefers_visuals: boolean;
  prefers_analogies: boolean;
  prefers_quizzes: boolean;
  prefers_direct_answer: boolean;
  prefers_guided_discovery: boolean;
  preferred_praise_style: string;
  preferred_lesson_length: string;
  response_verbosity_preference: number;
  updated_at: string;
};

export type EngagementModel = {
  profile_id: string;
  task_completion_rate: number;
  tasks_started: number;
  tasks_completed: number;
  avg_time_on_activity_seconds: number;
  avg_response_latency_ms: number;
  dropout_points: string[];
  most_engaging_formats: string[];
  least_engaging_formats: string[];
  session_length_trend: string;
  engagement_by_subject: Record<string, number>;
  engagement_by_format: Record<string, number>;
  updated_at: string;
};

export type InteractionEvent = {
  id: string;
  profile_id: string;
  session_id: string | null;
  event_type: string;
  subject: string | null;
  subtopic: string | null;
  was_correct: boolean | number | null;
  difficulty: number | null;
  hints_offered: number;
  hints_used: number;
  time_spent_ms: number;
  response_latency_ms: number;
  format_used: string | null;
  frustration_signals: string[];
  engagement_signals: string[];
  misconception_detected: string | null;
  created_at: string;
};

export type AdaptationLogEntry = {
  id: string;
  profile_id: string;
  session_id: string | null;
  chosen_level: string;
  chosen_format: string;
  reason_difficulty: string;
  reason_format: string;
  reason_examples: string | null;
  reason_review_or_challenge: string | null;
  tone: string;
  complexity_level: number;
  context_snapshot: Record<string, unknown>;
  created_at: string;
};
