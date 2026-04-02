/**
 * Panda Learner Brain — Deep Adaptive Personalization Engine
 *
 * This module owns all learner model updates, retrieval, adaptation decisions,
 * and explainability logging. Every tutor response flows through here.
 *
 * Architecture:
 * 1. InteractionEvent comes in (answer, hint usage, timing, engagement signals)
 * 2. Academic model updates (mastery, confidence, frustration, boredom, retention)
 * 3. Communication model updates (format preferences, complexity tolerance)
 * 4. Engagement model updates (completion rates, dropout patterns, latency)
 * 5. Adaptation rules fire to produce a TutorContext
 * 6. TutorContext is assembled with explainability metadata
 * 7. System prompt is built from TutorContext
 */

import { getDb } from "@/db/schema";
import { v4 as uuid } from "uuid";
import type {
  Profile,
  AcademicModel,
  CommunicationModel,
  EngagementModel,
  InteractionEvent,
  AdaptationLogEntry,
  Session,
} from "@/db/schema";

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export type InteractionInput = {
  profileId: string;
  sessionId: string;
  eventType: "answer" | "hint_request" | "retry" | "skip" | "task_complete" | "task_start" | "format_switch" | "message";
  subject?: string;
  subtopic?: string;
  wasCorrect?: boolean;
  difficulty?: number;       // 0–1 scale
  hintsOffered?: number;
  hintsUsed?: number;
  timeSpentMs?: number;
  responseLatencyMs?: number;
  formatUsed?: string;
  frustrationSignals?: string[];   // e.g. ["repeated_wrong", "long_pause", "asked_for_help"]
  engagementSignals?: string[];    // e.g. ["asked_followup", "requested_harder", "used_interest"]
  misconceptionDetected?: string;
};

export type TutorContext = {
  profile: ProfileSnapshot;
  academicSnapshot: AcademicSnapshot;
  communicationSnapshot: CommunicationSnapshot;
  engagementSnapshot: EngagementSnapshot;
  currentGoal: string;
  recentMistakes: RecentMistake[];
  successfulStrategies: string[];
  relatedMasteredConcepts: string[];
  adaptation: AdaptationDecision;
  explainability: ExplainabilityReport;
};

export type ProfileSnapshot = {
  name: string;
  nickname: string;
  age: number;
  grade: string;
  interests: string[];
  favoriteAnimals: string[];
  favoriteColors: string[];
  favoriteSubjects: string[];
  leastFavoriteSubjects: string[];
  parentNotes: string | null;
  learningSupport: string | null;
};

export type AcademicSnapshot = {
  subjectMastery: Record<string, { mastery: number; confidence: number; frustration: number; boredom: number }>;
  weakestSubtopics: Array<{ subject: string; subtopic: string; mastery: number; misconceptions: string[] }>;
  strongestSubtopics: Array<{ subject: string; subtopic: string; mastery: number }>;
  overallMastery: number;
  overallConfidence: number;
  hintDependenceAvg: number;
  retentionStrengthAvg: number;
};

export type CommunicationSnapshot = {
  vocabComplexity: number;
  sentenceLength: number;
  preferredFormats: string[];
  preferredDiscoveryStyle: "direct" | "guided";
  praiseStyle: string;
  lessonLength: string;
  verbosity: number;
};

export type EngagementSnapshot = {
  completionRate: number;
  avgTimeOnActivity: number;
  avgResponseLatency: number;
  mostEngagingFormats: string[];
  leastEngagingFormats: string[];
  sessionLengthTrend: string;
  currentSessionEngagement: number;
};

export type RecentMistake = {
  subject: string;
  subtopic: string;
  misconception: string | null;
  when: string;
};

export type AdaptationDecision = {
  difficultyLevel: "much_easier" | "easier" | "same" | "harder" | "much_harder";
  format: string;
  tone: "warm_supportive" | "balanced" | "challenging_playful";
  complexityLevel: number;         // 0–1
  scaffoldingLevel: "heavy" | "moderate" | "light" | "none";
  useInterests: boolean;
  interestToUse: string | null;
  reviewMode: boolean;
  challengeMode: boolean;
  misconceptionRemediation: string | null;
  hintStrategy: "provide_immediately" | "offer_first" | "wait_for_request" | "withhold";
  encouragementIntensity: "high" | "medium" | "low";
};

export type ExplainabilityReport = {
  chosenLevel: string;
  chosenFormat: string;
  reasonDifficulty: string;
  reasonFormat: string;
  reasonExamples: string;
  reasonReviewOrChallenge: string;
  keySignals: string[];
  timestamp: string;
};

// ══════════════════════════════════════════════════════════════
// Database Access — Deep Model Queries
// ══════════════════════════════════════════════════════════════

const ACADEMIC_JSON_FIELDS = ["misconceptions", "successful_formats", "failed_formats"];
const ENGAGEMENT_JSON_FIELDS = ["dropout_points", "most_engaging_formats", "least_engaging_formats", "engagement_by_subject", "engagement_by_format"];
const EVENT_JSON_FIELDS = ["frustration_signals", "engagement_signals"];

function parseRow<T>(row: Record<string, unknown> | undefined, jsonFields: string[]): T | null {
  if (!row) return null;
  const parsed = { ...row };
  for (const f of jsonFields) {
    if (typeof parsed[f] === "string") {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = f.endsWith("subject") || f.endsWith("format") ? {} : []; }
    }
  }
  return parsed as T;
}

export function getAcademicModels(profileId: string): AcademicModel[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM academic_model WHERE profile_id = ?").all(profileId) as Record<string, unknown>[];
  return rows.map((r) => parseRow<AcademicModel>(r, ACADEMIC_JSON_FIELDS)!);
}

export function getAcademicModel(profileId: string, subject: string, subtopic?: string | null): AcademicModel | null {
  const db = getDb();
  const row = subtopic
    ? db.prepare("SELECT * FROM academic_model WHERE profile_id = ? AND subject = ? AND subtopic = ?").get(profileId, subject, subtopic)
    : db.prepare("SELECT * FROM academic_model WHERE profile_id = ? AND subject = ? AND subtopic IS NULL").get(profileId, subject);
  return parseRow<AcademicModel>(row as Record<string, unknown> | undefined, ACADEMIC_JSON_FIELDS);
}

export function upsertAcademicModel(profileId: string, subject: string, subtopic: string | null, data: Partial<AcademicModel>): void {
  const db = getDb();
  const existing = getAcademicModel(profileId, subject, subtopic);

  const processed: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  for (const f of ACADEMIC_JSON_FIELDS) {
    if (Array.isArray(processed[f])) processed[f] = JSON.stringify(processed[f]);
  }
  delete processed.id;
  delete processed.profile_id;
  delete processed.subject;
  delete processed.subtopic;

  if (existing) {
    const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
    db.prepare(`UPDATE academic_model SET ${sets} WHERE id = ?`).run(...Object.values(processed), existing.id);
  } else {
    const id = uuid();
    const full: Record<string, unknown> = { id, profile_id: profileId, subject, subtopic, ...processed };
    const fields = Object.keys(full);
    const placeholders = fields.map(() => "?").join(", ");
    db.prepare(`INSERT INTO academic_model (${fields.join(", ")}) VALUES (${placeholders})`).run(...Object.values(full));
  }
}

export function getCommunicationModel(profileId: string): CommunicationModel | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM communication_model WHERE profile_id = ?").get(profileId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    ...row,
    prefers_stories: !!row.prefers_stories,
    prefers_steps: !!row.prefers_steps,
    prefers_visuals: !!row.prefers_visuals,
    prefers_analogies: !!row.prefers_analogies,
    prefers_quizzes: !!row.prefers_quizzes,
    prefers_direct_answer: !!row.prefers_direct_answer,
    prefers_guided_discovery: !!row.prefers_guided_discovery,
  } as CommunicationModel;
}

export function updateCommunicationModel(profileId: string, data: Partial<CommunicationModel>): void {
  const db = getDb();
  const processed: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  delete processed.profile_id;
  // Convert booleans to integers for SQLite
  for (const key of Object.keys(processed)) {
    if (typeof processed[key] === "boolean") {
      processed[key] = processed[key] ? 1 : 0;
    }
  }
  const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE communication_model SET ${sets} WHERE profile_id = ?`).run(...Object.values(processed), profileId);
}

export function getEngagementModel(profileId: string): EngagementModel | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM engagement_model WHERE profile_id = ?").get(profileId) as Record<string, unknown> | undefined;
  return parseRow<EngagementModel>(row, ENGAGEMENT_JSON_FIELDS);
}

export function updateEngagementModel(profileId: string, data: Partial<EngagementModel>): void {
  const db = getDb();
  const processed: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  delete processed.profile_id;
  for (const f of ENGAGEMENT_JSON_FIELDS) {
    if (Array.isArray(processed[f]) || (typeof processed[f] === "object" && processed[f] !== null)) {
      processed[f] = JSON.stringify(processed[f]);
    }
  }
  const sets = Object.keys(processed).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE engagement_model SET ${sets} WHERE profile_id = ?`).run(...Object.values(processed), profileId);
}

export function recordInteractionEvent(input: InteractionInput): InteractionEvent {
  const db = getDb();
  const id = uuid();
  db.prepare(`INSERT INTO interaction_events
    (id, profile_id, session_id, event_type, subject, subtopic, was_correct, difficulty,
     hints_offered, hints_used, time_spent_ms, response_latency_ms, format_used,
     frustration_signals, engagement_signals, misconception_detected)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, input.profileId, input.sessionId, input.eventType,
    input.subject || null, input.subtopic || null,
    input.wasCorrect === undefined ? null : input.wasCorrect ? 1 : 0,
    input.difficulty ?? null,
    input.hintsOffered ?? 0, input.hintsUsed ?? 0,
    input.timeSpentMs ?? 0, input.responseLatencyMs ?? 0,
    input.formatUsed || null,
    JSON.stringify(input.frustrationSignals || []),
    JSON.stringify(input.engagementSignals || []),
    input.misconceptionDetected || null,
  );
  return db.prepare("SELECT * FROM interaction_events WHERE id = ?").get(id) as InteractionEvent;
}

export function getRecentEvents(profileId: string, limit = 30): InteractionEvent[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM interaction_events WHERE profile_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(profileId, limit) as Record<string, unknown>[];
  return rows.map((r) => parseRow<InteractionEvent>(r, EVENT_JSON_FIELDS)!);
}

export function getSubjectEvents(profileId: string, subject: string, subtopic?: string, limit = 20): InteractionEvent[] {
  const db = getDb();
  const rows = subtopic
    ? db.prepare("SELECT * FROM interaction_events WHERE profile_id = ? AND subject = ? AND subtopic = ? ORDER BY created_at DESC LIMIT ?")
        .all(profileId, subject, subtopic, limit)
    : db.prepare("SELECT * FROM interaction_events WHERE profile_id = ? AND subject = ? ORDER BY created_at DESC LIMIT ?")
        .all(profileId, subject, limit);
  return (rows as Record<string, unknown>[]).map((r) => parseRow<InteractionEvent>(r, EVENT_JSON_FIELDS)!);
}

function logAdaptation(profileId: string, sessionId: string | null, decision: AdaptationDecision, explain: ExplainabilityReport, contextSnapshot: Record<string, unknown>): void {
  const db = getDb();
  db.prepare(`INSERT INTO adaptation_log
    (id, profile_id, session_id, chosen_level, chosen_format, reason_difficulty, reason_format,
     reason_examples, reason_review_or_challenge, tone, complexity_level, context_snapshot)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid(), profileId, sessionId,
    explain.chosenLevel, explain.chosenFormat,
    explain.reasonDifficulty, explain.reasonFormat,
    explain.reasonExamples, explain.reasonReviewOrChallenge,
    decision.tone, decision.complexityLevel,
    JSON.stringify(contextSnapshot),
  );
}

// ══════════════════════════════════════════════════════════════
// Update Rules — Called After Every Meaningful Interaction
// ══════════════════════════════════════════════════════════════

export function processInteraction(input: InteractionInput): void {
  // 1. Record raw event
  recordInteractionEvent(input);

  // 2. Update academic model if we have subject info
  if (input.subject) {
    updateAcademicFromEvent(input);
  }

  // 3. Update communication model from engagement signals
  updateCommunicationFromEvent(input);

  // 4. Update engagement model
  updateEngagementFromEvent(input);
}

function updateAcademicFromEvent(input: InteractionInput): void {
  const profileId = input.profileId;
  const subject = input.subject!;
  const subtopic = input.subtopic || null;

  const existing = getAcademicModel(profileId, subject, subtopic);
  const now = new Date().toISOString();

  // Current values or defaults
  const exposureCount = (existing?.exposure_count ?? 0) + 1;
  const prevMastery = existing?.mastery_estimate ?? 0.3;
  const prevConfidence = existing?.confidence_estimate ?? 0.5;
  const prevHintDep = existing?.hint_dependence ?? 0;
  const prevFrustration = existing?.frustration_risk ?? 0;
  const prevBoredom = existing?.boredom_risk ?? 0;
  const prevRetention = existing?.retention_strength ?? 0.5;
  const prevConsecCorrect = existing?.consecutive_correct ?? 0;
  const prevConsecIncorrect = existing?.consecutive_incorrect ?? 0;
  const prevCorrectnessRate = existing?.correctness_rate ?? 0;
  const prevHintsGiven = existing?.hints_given ?? 0;
  const prevHintsUsed = existing?.hints_used ?? 0;
  const prevRetryCount = existing?.retry_count ?? 0;
  const prevMisconceptions = existing?.misconceptions ?? [];
  const prevSuccessFormats = existing?.successful_formats ?? [];
  const prevFailedFormats = existing?.failed_formats ?? [];

  const difficulty = input.difficulty ?? 0.5;
  const wasCorrect = input.wasCorrect;

  // ── Mastery estimate ──
  // Bayesian-ish update: correct on hard → big boost, wrong on easy → big penalty
  let masteryDelta = 0;
  if (wasCorrect === true) {
    masteryDelta = 0.04 + difficulty * 0.06; // +0.04 to +0.10
    // Bonus for no hints used
    if ((input.hintsUsed ?? 0) === 0 && (input.hintsOffered ?? 0) > 0) {
      masteryDelta += 0.02;
    }
  } else if (wasCorrect === false) {
    masteryDelta = -(0.03 + (1 - difficulty) * 0.05); // -0.03 to -0.08
    // Less penalty if hints were used (learning from hints)
    if ((input.hintsUsed ?? 0) > 0) {
      masteryDelta *= 0.6;
    }
  }
  const newMastery = clamp(prevMastery + masteryDelta, 0, 1);

  // ── Confidence estimate ──
  // Grows with consistency, drops sharply with unexpected failure at high confidence
  let confidenceDelta = 0;
  if (wasCorrect === true) {
    confidenceDelta = 0.03 + (prevConsecCorrect * 0.01); // accelerates with streaks
  } else if (wasCorrect === false) {
    confidenceDelta = prevConfidence > 0.7 ? -0.08 : -0.04;
  }
  const newConfidence = clamp(prevConfidence + confidenceDelta, 0, 1);

  // ── Consecutive tracking ──
  let consecCorrect = wasCorrect ? prevConsecCorrect + 1 : 0;
  let consecIncorrect = wasCorrect === false ? prevConsecIncorrect + 1 : 0;

  // ── Correctness rate (exponential moving average) ──
  const alpha = 0.15; // weight of new observation
  const correctnessObs = wasCorrect ? 1 : wasCorrect === false ? 0 : prevCorrectnessRate;
  const newCorrectnessRate = prevCorrectnessRate * (1 - alpha) + correctnessObs * alpha;

  // ── Hint dependence ──
  // Ratio of hints used to hints offered, with decay toward independence
  const hintsGiven = prevHintsGiven + (input.hintsOffered ?? 0);
  const hintsUsed = prevHintsUsed + (input.hintsUsed ?? 0);
  const newHintDep = hintsGiven > 0 ? hintsUsed / hintsGiven : 0;

  // ── Frustration risk ──
  // Rises with: consecutive wrong, long pauses, explicit frustration signals
  // Falls with: correct answers, engagement signals
  let frustrationDelta = 0;
  if (wasCorrect === false) frustrationDelta += 0.08;
  if (consecIncorrect >= 3) frustrationDelta += 0.12;
  if (wasCorrect === true) frustrationDelta -= 0.06;
  if ((input.frustrationSignals?.length ?? 0) > 0) frustrationDelta += 0.1 * input.frustrationSignals!.length;
  if ((input.engagementSignals?.length ?? 0) > 0) frustrationDelta -= 0.04;
  // Time-based: very long response → possible frustration
  if ((input.timeSpentMs ?? 0) > 120000) frustrationDelta += 0.05;
  const newFrustration = clamp(prevFrustration + frustrationDelta, 0, 1);

  // ── Boredom risk ──
  // Rises with: easy correct, fast completion, low engagement
  // Falls with: challenge, engagement signals
  let boredomDelta = 0;
  if (wasCorrect === true && difficulty < 0.3) boredomDelta += 0.06;
  if (wasCorrect === true && consecCorrect >= 5) boredomDelta += 0.08;
  if (wasCorrect === false) boredomDelta -= 0.04; // not bored if struggling
  if ((input.engagementSignals?.length ?? 0) > 0) boredomDelta -= 0.06;
  if (input.eventType === "skip") boredomDelta += 0.1;
  // Fast completion on easy task
  if ((input.timeSpentMs ?? 0) < 3000 && wasCorrect === true) boredomDelta += 0.04;
  const newBoredom = clamp(prevBoredom + boredomDelta, 0, 1);

  // ── Retention strength ──
  // Based on spaced repetition: decays with time since last practice, grows with correct recalls
  let retentionDelta = 0;
  if (wasCorrect === true) {
    retentionDelta = 0.05 + (consecCorrect * 0.02);
  } else if (wasCorrect === false) {
    retentionDelta = -0.08;
  }
  // Time decay: if last_correct_at was long ago, retention already dropped
  if (existing?.last_correct_at) {
    const hoursSince = (Date.now() - new Date(existing.last_correct_at).getTime()) / 3600000;
    if (hoursSince > 168) retentionDelta -= 0.03; // > 1 week
    if (hoursSince > 720) retentionDelta -= 0.05; // > 1 month
  }
  const newRetention = clamp(prevRetention + retentionDelta, 0, 1);

  // ── Misconceptions ──
  const misconceptions = [...prevMisconceptions];
  if (input.misconceptionDetected && !misconceptions.includes(input.misconceptionDetected)) {
    misconceptions.push(input.misconceptionDetected);
  }

  // ── Format tracking ──
  const successFormats = [...prevSuccessFormats];
  const failedFormats = [...prevFailedFormats];
  if (input.formatUsed) {
    if (wasCorrect === true) {
      if (!successFormats.includes(input.formatUsed)) successFormats.push(input.formatUsed);
      // Remove from failed if now succeeding
      const failIdx = failedFormats.indexOf(input.formatUsed);
      if (failIdx >= 0) failedFormats.splice(failIdx, 1);
    } else if (wasCorrect === false) {
      if (!failedFormats.includes(input.formatUsed)) failedFormats.push(input.formatUsed);
    }
  }

  // ── Speed tracking ──
  const prevSpeed = existing?.avg_speed_seconds ?? 0;
  const newSpeedObs = (input.timeSpentMs ?? 0) / 1000;
  const newAvgSpeed = prevSpeed === 0 ? newSpeedObs : prevSpeed * 0.7 + newSpeedObs * 0.3;

  upsertAcademicModel(profileId, subject, subtopic, {
    exposure_count: exposureCount,
    mastery_estimate: newMastery,
    confidence_estimate: newConfidence,
    avg_speed_seconds: newAvgSpeed,
    correctness_rate: newCorrectnessRate,
    hint_dependence: newHintDep,
    hints_given: hintsGiven,
    hints_used: hintsUsed,
    retry_count: prevRetryCount + (input.eventType === "retry" ? 1 : 0),
    frustration_risk: newFrustration,
    boredom_risk: newBoredom,
    retention_strength: newRetention,
    last_correct_at: wasCorrect ? now : existing?.last_correct_at || null,
    last_incorrect_at: wasCorrect === false ? now : existing?.last_incorrect_at || null,
    consecutive_correct: consecCorrect,
    consecutive_incorrect: consecIncorrect,
    misconceptions,
    successful_formats: successFormats,
    failed_formats: failedFormats,
  });

  // Also update the parent subject-level aggregate
  if (subtopic) {
    rollUpSubjectModel(profileId, subject);
  }
}

function rollUpSubjectModel(profileId: string, subject: string): void {
  const allSubtopics = getAcademicModels(profileId).filter(
    (m) => m.subject === subject && m.subtopic !== null
  );
  if (allSubtopics.length === 0) return;

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;

  upsertAcademicModel(profileId, subject, null, {
    exposure_count: allSubtopics.reduce((s, m) => s + m.exposure_count, 0),
    mastery_estimate: avg(allSubtopics.map((m) => m.mastery_estimate)),
    confidence_estimate: avg(allSubtopics.map((m) => m.confidence_estimate)),
    correctness_rate: avg(allSubtopics.map((m) => m.correctness_rate)),
    hint_dependence: avg(allSubtopics.map((m) => m.hint_dependence)),
    frustration_risk: Math.max(...allSubtopics.map((m) => m.frustration_risk)),
    boredom_risk: Math.max(...allSubtopics.map((m) => m.boredom_risk)),
    retention_strength: avg(allSubtopics.map((m) => m.retention_strength)),
  });
}

function updateCommunicationFromEvent(input: InteractionInput): void {
  const comm = getCommunicationModel(input.profileId);
  if (!comm) return;

  const updates: Partial<CommunicationModel> = {};

  // If the child used a particular format successfully, boost preference
  if (input.formatUsed && input.wasCorrect === true) {
    const formatMap: Record<string, keyof CommunicationModel> = {
      story: "prefers_stories",
      steps: "prefers_steps",
      visual: "prefers_visuals",
      analogy: "prefers_analogies",
      quiz: "prefers_quizzes",
    };
    const key = formatMap[input.formatUsed];
    if (key) {
      (updates as Record<string, unknown>)[key] = true;
    }
  }

  // If child asks for direct answer vs guided discovery
  if (input.engagementSignals?.includes("requested_direct_answer")) {
    updates.prefers_direct_answer = true;
    updates.prefers_guided_discovery = false;
  } else if (input.engagementSignals?.includes("enjoyed_discovery")) {
    updates.prefers_guided_discovery = true;
    updates.prefers_direct_answer = false;
  }

  // Vocab complexity: if child asks "what does that mean" → lower tolerance
  if (input.frustrationSignals?.includes("vocabulary_confusion")) {
    updates.vocab_complexity_tolerance = clamp((comm.vocab_complexity_tolerance ?? 0.5) - 0.1, 0, 1);
  }
  // If child uses complex words → raise tolerance
  if (input.engagementSignals?.includes("used_complex_vocabulary")) {
    updates.vocab_complexity_tolerance = clamp((comm.vocab_complexity_tolerance ?? 0.5) + 0.05, 0, 1);
  }

  if (Object.keys(updates).length > 0) {
    updateCommunicationModel(input.profileId, updates);
  }
}

function updateEngagementFromEvent(input: InteractionInput): void {
  const eng = getEngagementModel(input.profileId);
  if (!eng) return;

  const updates: Partial<EngagementModel> = {};

  if (input.eventType === "task_start") {
    updates.tasks_started = (eng.tasks_started ?? 0) + 1;
  }
  if (input.eventType === "task_complete") {
    updates.tasks_completed = (eng.tasks_completed ?? 0) + 1;
    const started = eng.tasks_started ?? 1;
    const completed = updates.tasks_completed;
    updates.task_completion_rate = started > 0 ? completed / started : 0;
  }
  if (input.eventType === "skip") {
    // Track dropout point
    const dropouts = [...(eng.dropout_points || [])];
    const point = `${input.subject || "unknown"}:${input.subtopic || "general"}`;
    dropouts.push(point);
    if (dropouts.length > 50) dropouts.splice(0, dropouts.length - 50);
    updates.dropout_points = dropouts;
  }

  // Time on activity — exponential moving average
  if (input.timeSpentMs && input.timeSpentMs > 0) {
    const prevAvg = eng.avg_time_on_activity_seconds ?? 0;
    const newObs = input.timeSpentMs / 1000;
    updates.avg_time_on_activity_seconds = prevAvg === 0 ? newObs : prevAvg * 0.8 + newObs * 0.2;
  }

  // Response latency
  if (input.responseLatencyMs && input.responseLatencyMs > 0) {
    const prevLat = eng.avg_response_latency_ms ?? 0;
    updates.avg_response_latency_ms = prevLat === 0 ? input.responseLatencyMs : prevLat * 0.8 + input.responseLatencyMs * 0.2;
  }

  // Format engagement tracking
  if (input.formatUsed) {
    const byFormat = { ...(eng.engagement_by_format || {}) };
    const prevScore = (byFormat[input.formatUsed] as number) ?? 0.5;
    let delta = 0;
    if (input.wasCorrect === true) delta += 0.05;
    if ((input.engagementSignals?.length ?? 0) > 0) delta += 0.03;
    if (input.eventType === "task_complete") delta += 0.04;
    if (input.eventType === "skip") delta -= 0.1;
    if ((input.frustrationSignals?.length ?? 0) > 0) delta -= 0.05;
    byFormat[input.formatUsed] = clamp(prevScore + delta, 0, 1);
    updates.engagement_by_format = byFormat as Record<string, number>;

    // Update most/least engaging
    const sorted = Object.entries(byFormat).sort(([, a], [, b]) => (b as number) - (a as number));
    updates.most_engaging_formats = sorted.slice(0, 3).map(([f]) => f);
    updates.least_engaging_formats = sorted.slice(-3).map(([f]) => f);
  }

  // Subject engagement
  if (input.subject) {
    const bySub = { ...(eng.engagement_by_subject || {}) };
    const prevScore = (bySub[input.subject] as number) ?? 0.5;
    let delta = 0;
    if (input.wasCorrect === true) delta += 0.03;
    if ((input.engagementSignals?.length ?? 0) > 0) delta += 0.04;
    if (input.eventType === "skip") delta -= 0.08;
    bySub[input.subject] = clamp(prevScore + delta, 0, 1);
    updates.engagement_by_subject = bySub as Record<string, number>;
  }

  if (Object.keys(updates).length > 0) {
    updateEngagementModel(input.profileId, updates);
  }
}

// ══════════════════════════════════════════════════════════════
// Retrieval — Assemble Learner Context Before Every Response
// ══════════════════════════════════════════════════════════════

export function assembleTutorContext(
  profile: Profile,
  sessionId: string | null,
  currentSubject?: string,
  currentSubtopic?: string,
): TutorContext {
  const profileId = profile.id;

  // ── Snapshots ──
  const profileSnapshot = buildProfileSnapshot(profile);
  const academicSnapshot = buildAcademicSnapshot(profileId);
  const communicationSnapshot = buildCommunicationSnapshot(profileId);
  const engagementSnapshot = buildEngagementSnapshot(profileId);

  // ── Recent mistakes ──
  const recentEvents = getRecentEvents(profileId, 50);
  const recentMistakes = recentEvents
    .filter((e) => (e.was_correct === false || e.was_correct === 0) && e.subject)
    .slice(0, 10)
    .map((e) => ({
      subject: e.subject!,
      subtopic: e.subtopic || e.subject!,
      misconception: e.misconception_detected || null,
      when: e.created_at,
    }));

  // ── Successful strategies ──
  const successfulStrategies: string[] = [];
  const comm = getCommunicationModel(profileId);
  if (comm) {
    if (comm.prefers_stories) successfulStrategies.push("stories");
    if (comm.prefers_steps) successfulStrategies.push("step-by-step");
    if (comm.prefers_visuals) successfulStrategies.push("visuals");
    if (comm.prefers_analogies) successfulStrategies.push("analogies");
    if (comm.prefers_quizzes) successfulStrategies.push("quizzes");
  }
  const allModels = getAcademicModels(profileId);
  const topFormats = allModels
    .flatMap((m) => m.successful_formats)
    .reduce((acc, f) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sortedFormats = Object.entries(topFormats).sort(([, a], [, b]) => b - a);
  for (const [fmt] of sortedFormats.slice(0, 3)) {
    if (!successfulStrategies.includes(fmt)) successfulStrategies.push(fmt);
  }

  // ── Related mastered concepts ──
  const relatedMasteredConcepts = allModels
    .filter((m) => m.mastery_estimate >= 0.8 && m.subtopic)
    .filter((m) => !currentSubject || m.subject === currentSubject)
    .map((m) => `${m.subject}: ${m.subtopic}`)
    .slice(0, 5);

  // ── Current goal ──
  let currentGoal = "Open exploration — help the child learn something new.";
  if (currentSubject && currentSubtopic) {
    const model = getAcademicModel(profileId, currentSubject, currentSubtopic);
    if (model && model.mastery_estimate < 0.5) {
      currentGoal = `Build understanding of ${currentSubtopic} in ${currentSubject} (currently at ${Math.round(model.mastery_estimate * 100)}% mastery).`;
    } else if (model && model.mastery_estimate >= 0.8) {
      currentGoal = `Challenge and extend knowledge of ${currentSubtopic} in ${currentSubject} (already at ${Math.round(model.mastery_estimate * 100)}% mastery).`;
    } else {
      currentGoal = `Practice ${currentSubtopic} in ${currentSubject}.`;
    }
  } else if (currentSubject) {
    currentGoal = `Explore and practice ${currentSubject}.`;
  }

  // ── Adaptation decision ──
  const adaptation = computeAdaptation(
    profileId, academicSnapshot, communicationSnapshot, engagementSnapshot,
    recentMistakes, profile, currentSubject, currentSubtopic,
  );

  // ── Explainability ──
  const explainability = buildExplainability(adaptation, academicSnapshot, engagementSnapshot, recentMistakes);

  // ── Log the adaptation ──
  logAdaptation(profileId, sessionId, adaptation, explainability, {
    overallMastery: academicSnapshot.overallMastery,
    overallConfidence: academicSnapshot.overallConfidence,
    frustrationMax: Math.max(0, ...Object.values(academicSnapshot.subjectMastery).map((s) => s.frustration)),
    boredomMax: Math.max(0, ...Object.values(academicSnapshot.subjectMastery).map((s) => s.boredom)),
    completionRate: engagementSnapshot.completionRate,
    recentMistakeCount: recentMistakes.length,
  });

  return {
    profile: profileSnapshot,
    academicSnapshot,
    communicationSnapshot,
    engagementSnapshot,
    currentGoal,
    recentMistakes,
    successfulStrategies,
    relatedMasteredConcepts,
    adaptation,
    explainability,
  };
}

// ══════════════════════════════════════════════════════════════
// Snapshot Builders
// ══════════════════════════════════════════════════════════════

function buildProfileSnapshot(profile: Profile): ProfileSnapshot {
  return {
    name: profile.name,
    nickname: profile.nickname || profile.name,
    age: profile.age ?? 8,
    grade: profile.grade || "elementary",
    interests: [...profile.interests, ...profile.favorite_topics],
    favoriteAnimals: profile.favorite_animals,
    favoriteColors: profile.favorite_colors,
    favoriteSubjects: profile.favorite_subjects,
    leastFavoriteSubjects: profile.least_favorite_subjects,
    parentNotes: profile.parent_notes,
    learningSupport: profile.learning_support_needs,
  };
}

function buildAcademicSnapshot(profileId: string): AcademicSnapshot {
  const models = getAcademicModels(profileId);

  const subjectModels = models.filter((m) => !m.subtopic);
  const subtopicModels = models.filter((m) => m.subtopic);

  const subjectMastery: Record<string, { mastery: number; confidence: number; frustration: number; boredom: number }> = {};
  for (const m of subjectModels) {
    subjectMastery[m.subject] = {
      mastery: m.mastery_estimate,
      confidence: m.confidence_estimate,
      frustration: m.frustration_risk,
      boredom: m.boredom_risk,
    };
  }

  const weakest = subtopicModels
    .filter((m) => m.mastery_estimate < 0.5 && m.exposure_count > 0)
    .sort((a, b) => a.mastery_estimate - b.mastery_estimate)
    .slice(0, 5)
    .map((m) => ({ subject: m.subject, subtopic: m.subtopic!, mastery: m.mastery_estimate, misconceptions: m.misconceptions }));

  const strongest = subtopicModels
    .filter((m) => m.mastery_estimate >= 0.7)
    .sort((a, b) => b.mastery_estimate - a.mastery_estimate)
    .slice(0, 5)
    .map((m) => ({ subject: m.subject, subtopic: m.subtopic!, mastery: m.mastery_estimate }));

  const withAttempts = models.filter((m) => m.exposure_count > 0);
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0.5;

  return {
    subjectMastery,
    weakestSubtopics: weakest,
    strongestSubtopics: strongest,
    overallMastery: avg(withAttempts.map((m) => m.mastery_estimate)),
    overallConfidence: avg(withAttempts.map((m) => m.confidence_estimate)),
    hintDependenceAvg: avg(withAttempts.map((m) => m.hint_dependence)),
    retentionStrengthAvg: avg(withAttempts.map((m) => m.retention_strength)),
  };
}

function buildCommunicationSnapshot(profileId: string): CommunicationSnapshot {
  const comm = getCommunicationModel(profileId);
  if (!comm) {
    return {
      vocabComplexity: 0.5,
      sentenceLength: 0.5,
      preferredFormats: ["visual"],
      preferredDiscoveryStyle: "guided",
      praiseStyle: "enthusiastic",
      lessonLength: "medium",
      verbosity: 0.5,
    };
  }

  const preferredFormats: string[] = [];
  if (comm.prefers_visuals) preferredFormats.push("visual");
  if (comm.prefers_stories) preferredFormats.push("story");
  if (comm.prefers_steps) preferredFormats.push("steps");
  if (comm.prefers_analogies) preferredFormats.push("analogy");
  if (comm.prefers_quizzes) preferredFormats.push("quiz");
  if (preferredFormats.length === 0) preferredFormats.push("visual");

  return {
    vocabComplexity: comm.vocab_complexity_tolerance,
    sentenceLength: comm.sentence_length_tolerance,
    preferredFormats,
    preferredDiscoveryStyle: comm.prefers_direct_answer ? "direct" : "guided",
    praiseStyle: comm.preferred_praise_style,
    lessonLength: comm.preferred_lesson_length,
    verbosity: comm.response_verbosity_preference,
  };
}

function buildEngagementSnapshot(profileId: string): EngagementSnapshot {
  const eng = getEngagementModel(profileId);
  if (!eng) {
    return {
      completionRate: 0,
      avgTimeOnActivity: 0,
      avgResponseLatency: 0,
      mostEngagingFormats: [],
      leastEngagingFormats: [],
      sessionLengthTrend: "stable",
      currentSessionEngagement: 0.5,
    };
  }

  return {
    completionRate: eng.task_completion_rate,
    avgTimeOnActivity: eng.avg_time_on_activity_seconds,
    avgResponseLatency: eng.avg_response_latency_ms,
    mostEngagingFormats: eng.most_engaging_formats,
    leastEngagingFormats: eng.least_engaging_formats,
    sessionLengthTrend: eng.session_length_trend,
    currentSessionEngagement: 0.5, // will be updated during session
  };
}

// ══════════════════════════════════════════════════════════════
// Adaptation Rules — The Decision Engine
// ══════════════════════════════════════════════════════════════

function computeAdaptation(
  profileId: string,
  academic: AcademicSnapshot,
  comm: CommunicationSnapshot,
  engagement: EngagementSnapshot,
  recentMistakes: RecentMistake[],
  profile: Profile,
  currentSubject?: string,
  currentSubtopic?: string,
): AdaptationDecision {
  const mastery = academic.overallMastery;
  const confidence = academic.overallConfidence;

  // Get current topic model if available
  let topicModel: AcademicModel | null = null;
  if (currentSubject) {
    topicModel = getAcademicModel(profileId, currentSubject, currentSubtopic) ||
                 getAcademicModel(profileId, currentSubject);
  }

  const frustration = topicModel?.frustration_risk ?? 0;
  const boredom = topicModel?.boredom_risk ?? 0;
  const hintDep = topicModel?.hint_dependence ?? academic.hintDependenceAvg;
  const topicMastery = topicModel?.mastery_estimate ?? mastery;
  const topicConfidence = topicModel?.confidence_estimate ?? confidence;

  // ── Rule 1: Frustration rising + low mastery → simplify and scaffold ──
  if (frustration > 0.6 && topicMastery < 0.5) {
    return {
      difficultyLevel: "much_easier",
      format: comm.preferredFormats[0] || "visual",
      tone: "warm_supportive",
      complexityLevel: clamp(comm.vocabComplexity - 0.2, 0.1, 0.5),
      scaffoldingLevel: "heavy",
      useInterests: true,
      interestToUse: pickInterest(profile),
      reviewMode: true,
      challengeMode: false,
      misconceptionRemediation: findActiveRemediation(recentMistakes, currentSubject),
      hintStrategy: "provide_immediately",
      encouragementIntensity: "high",
    };
  }

  // ── Rule 2: Moderate mastery + low confidence → reinforce gently ──
  if (topicMastery >= 0.4 && topicMastery < 0.7 && topicConfidence < 0.4) {
    return {
      difficultyLevel: "easier",
      format: comm.preferredFormats[0] || "steps",
      tone: "warm_supportive",
      complexityLevel: clamp(comm.vocabComplexity, 0.2, 0.6),
      scaffoldingLevel: "moderate",
      useInterests: true,
      interestToUse: pickInterest(profile),
      reviewMode: true,
      challengeMode: false,
      misconceptionRemediation: findActiveRemediation(recentMistakes, currentSubject),
      hintStrategy: "offer_first",
      encouragementIntensity: "high",
    };
  }

  // ── Rule 3: High mastery + high engagement → challenge ──
  if (topicMastery >= 0.75 && engagement.completionRate >= 0.6) {
    return {
      difficultyLevel: "harder",
      format: pickVariedFormat(comm, engagement),
      tone: "challenging_playful",
      complexityLevel: clamp(comm.vocabComplexity + 0.1, 0.3, 1),
      scaffoldingLevel: "light",
      useInterests: false,
      interestToUse: null,
      reviewMode: false,
      challengeMode: true,
      misconceptionRemediation: null,
      hintStrategy: "wait_for_request",
      encouragementIntensity: "low",
    };
  }

  // ── Rule 4: Boredom signals → switch format quickly ──
  if (boredom > 0.6) {
    const freshFormat = pickFreshFormat(comm, engagement);
    return {
      difficultyLevel: topicMastery > 0.6 ? "harder" : "same",
      format: freshFormat,
      tone: "challenging_playful",
      complexityLevel: comm.vocabComplexity,
      scaffoldingLevel: "light",
      useInterests: true,
      interestToUse: pickInterest(profile),
      reviewMode: false,
      challengeMode: topicMastery > 0.6,
      misconceptionRemediation: null,
      hintStrategy: "wait_for_request",
      encouragementIntensity: "medium",
    };
  }

  // ── Rule 5: Repeated misconception → targeted remediation ──
  const activeMisconception = findActiveRemediation(recentMistakes, currentSubject);
  if (activeMisconception) {
    const misconceptionCount = recentMistakes.filter((m) => m.misconception === activeMisconception).length;
    if (misconceptionCount >= 2) {
      return {
        difficultyLevel: "easier",
        format: "steps", // step-by-step is best for misconception repair
        tone: "warm_supportive",
        complexityLevel: clamp(comm.vocabComplexity - 0.1, 0.1, 0.6),
        scaffoldingLevel: "heavy",
        useInterests: true,
        interestToUse: pickInterest(profile),
        reviewMode: true,
        challengeMode: false,
        misconceptionRemediation: activeMisconception,
        hintStrategy: "provide_immediately",
        encouragementIntensity: "high",
      };
    }
  }

  // ── Rule 6: Success after hints → gradually fade hints ──
  let hintStrategy: AdaptationDecision["hintStrategy"] = "offer_first";
  if (hintDep > 0.7) {
    hintStrategy = "offer_first"; // still dependent, keep offering
  } else if (hintDep > 0.3) {
    hintStrategy = "wait_for_request"; // fading
  } else {
    hintStrategy = "withhold"; // independent
  }

  // ── Default: balanced ──
  return {
    difficultyLevel: "same",
    format: comm.preferredFormats[0] || "visual",
    tone: "balanced",
    complexityLevel: comm.vocabComplexity,
    scaffoldingLevel: "moderate",
    useInterests: Math.random() < 0.4,
    interestToUse: Math.random() < 0.4 ? pickInterest(profile) : null,
    reviewMode: false,
    challengeMode: false,
    misconceptionRemediation: null,
    hintStrategy,
    encouragementIntensity: "medium",
  };
}

// ══════════════════════════════════════════════════════════════
// Explainability — "Why Panda Chose This"
// ══════════════════════════════════════════════════════════════

function buildExplainability(
  decision: AdaptationDecision,
  academic: AcademicSnapshot,
  engagement: EngagementSnapshot,
  recentMistakes: RecentMistake[],
): ExplainabilityReport {
  const signals: string[] = [];

  // Key signals
  if (academic.overallMastery < 0.4) signals.push(`Low overall mastery (${pct(academic.overallMastery)})`);
  if (academic.overallMastery > 0.75) signals.push(`High overall mastery (${pct(academic.overallMastery)})`);
  if (academic.overallConfidence < 0.3) signals.push(`Low confidence (${pct(academic.overallConfidence)})`);
  if (academic.hintDependenceAvg > 0.5) signals.push(`High hint dependence (${pct(academic.hintDependenceAvg)})`);
  if (engagement.completionRate < 0.4) signals.push(`Low task completion (${pct(engagement.completionRate)})`);
  if (recentMistakes.length > 5) signals.push(`${recentMistakes.length} recent mistakes`);

  const frustrations = Object.entries(academic.subjectMastery)
    .filter(([, v]) => v.frustration > 0.5)
    .map(([k, v]) => `${k} frustration at ${pct(v.frustration)}`);
  signals.push(...frustrations);

  const boredoms = Object.entries(academic.subjectMastery)
    .filter(([, v]) => v.boredom > 0.5)
    .map(([k, v]) => `${k} boredom at ${pct(v.boredom)}`);
  signals.push(...boredoms);

  // Difficulty reason
  const difficultyReasons: Record<string, string> = {
    much_easier: "Student is frustrated and struggling — reducing difficulty significantly to rebuild confidence.",
    easier: "Confidence is low or misconceptions are present — simplifying to reinforce fundamentals.",
    same: "Student is progressing normally — maintaining current difficulty.",
    harder: "High mastery and strong engagement — increasing challenge to maintain growth.",
    much_harder: "Student is breezing through with high accuracy — significantly raising the bar.",
  };

  // Format reason
  let formatReason = `Using ${decision.format} based on learned preferences.`;
  if (decision.misconceptionRemediation) {
    formatReason = `Using step-by-step format to address misconception: "${decision.misconceptionRemediation}".`;
  } else if (decision.challengeMode) {
    formatReason = `Varying format to ${decision.format} to keep advanced learning engaging.`;
  }

  // Review/challenge reason
  let reviewReason: string;
  if (decision.reviewMode) {
    reviewReason = "Review mode: reinforcing weak areas before advancing.";
    if (decision.misconceptionRemediation) {
      reviewReason += ` Targeting misconception: "${decision.misconceptionRemediation}".`;
    }
  } else if (decision.challengeMode) {
    reviewReason = "Challenge mode: student has demonstrated mastery, offering enrichment.";
  } else {
    reviewReason = "Standard practice mode.";
  }

  return {
    chosenLevel: decision.difficultyLevel,
    chosenFormat: decision.format,
    reasonDifficulty: difficultyReasons[decision.difficultyLevel] || "Standard progression.",
    reasonFormat: formatReason,
    reasonExamples: decision.useInterests && decision.interestToUse
      ? `Using ${decision.interestToUse} in examples because low confidence or engagement warrants personal connection.`
      : "Using standard examples — student is confident and engaged.",
    reasonReviewOrChallenge: reviewReason,
    keySignals: signals,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════
// System Prompt Builder — Uses Full TutorContext
// ══════════════════════════════════════════════════════════════

export function buildDeepSystemPrompt(context: TutorContext): string {
  const { profile: p, academicSnapshot: a, communicationSnapshot: c, engagementSnapshot: e, adaptation: ad } = context;

  const name = p.nickname;
  const age = p.age;
  const grade = p.grade;

  // Vocabulary calibration
  const vocabLevel = c.vocabComplexity < 0.3 ? "very simple" : c.vocabComplexity < 0.6 ? "age-appropriate" : "slightly advanced";
  const sentenceGuide = c.sentenceLength < 0.3 ? "1-2 short sentences per idea" : c.sentenceLength < 0.6 ? "2-4 sentences per idea" : "3-6 sentences per idea";

  // Format instructions
  const formatGuide = c.preferredFormats.length > 0
    ? `${name} learns best through: ${c.preferredFormats.join(", ")}. Favor these formats.`
    : "Use a mix of teaching formats.";

  // Discovery style
  const discoveryGuide = c.preferredDiscoveryStyle === "direct"
    ? "Give the answer or key concept first, then explain. This child prefers direct answers."
    : "Guide discovery with questions and hints before revealing the answer. This child enjoys figuring things out.";

  // Mastery summary
  const masteryLines = Object.entries(a.subjectMastery)
    .map(([subj, data]) => {
      const flags: string[] = [];
      if (data.frustration > 0.4) flags.push("⚠️ frustration rising");
      if (data.boredom > 0.4) flags.push("💤 boredom risk");
      return `  - ${subj}: ${pct(data.mastery)} mastery, ${pct(data.confidence)} confidence${flags.length > 0 ? " [" + flags.join(", ") + "]" : ""}`;
    })
    .join("\n");

  // Weak spots
  const weakLines = context.academicSnapshot.weakestSubtopics
    .map((w) => `  - ${w.subject}/${w.subtopic}: ${pct(w.mastery)} mastery${w.misconceptions.length > 0 ? ` (misconceptions: ${w.misconceptions.join(", ")})` : ""}`)
    .join("\n");

  // Tone instruction
  const toneMap = {
    warm_supportive: "Be extra warm, patient, and encouraging. Celebrate every small win. Offer lots of reassurance.",
    balanced: "Be friendly and encouraging with balanced warmth. Celebrate successes but also gently push forward.",
    challenging_playful: "Be playful and slightly challenging. Use humor and friendly competition. This child is ready to be pushed.",
  };

  // Scaffolding
  const scaffoldMap = {
    heavy: "Break everything into tiny steps. Give examples before asking questions. Provide fill-in-the-blank style guidance.",
    moderate: "Provide structure but leave room for thinking. Give 1-2 hints if needed.",
    light: "Give minimal scaffolding. Let the child work through problems with light guidance.",
    none: "Let the child work independently. Only help if explicitly asked.",
  };

  // Hint strategy
  const hintMap = {
    provide_immediately: "Provide hints proactively within your explanations — this child needs scaffolding right now.",
    offer_first: "Offer hints ('Would you like a hint?') but let the child try first.",
    wait_for_request: "Don't offer hints unless the child asks. They're building independence.",
    withhold: "This child is hint-independent. Let them struggle productively before offering help.",
  };

  // Encouragement
  const encourageMap = {
    high: `Extra praise! Use enthusiastic language: "Amazing job!", "Your brain is growing like bamboo!" Celebrate effort, not just correctness. ${c.praiseStyle === "enthusiastic" ? "Use exclamation marks and emojis freely." : c.praiseStyle === "calm" ? "Keep praise genuine but calm." : "Be encouraging in a friendly, warm way."}`,
    medium: "Regular encouragement. Acknowledge good work naturally without over-praising.",
    low: "Light encouragement. This child is confident — they don't need heavy praise. A simple 'nice' or 'good thinking' is enough.",
  };

  return `You are Panda 🐼, a brilliant, patient, and deeply caring AI tutor for children. You know ${name} well and adapt everything to them.

## Identity & Safety
- You are Panda — a friendly, wise panda who loves bamboo, learning, and helping kids grow.
- NEVER discuss mature, violent, scary, or inappropriate topics.
- NEVER shame, pressure, or make ${name} feel bad about mistakes.
- NEVER pretend to replace parents, teachers, or therapists.
- If asked something unsafe or off-topic, gently redirect: "That's a great question for a grown-up! Let's get back to learning."

## About ${name}
- Name: ${name} | Age: ${age} | Grade: ${grade}
- Interests: ${p.interests.length > 0 ? p.interests.join(", ") : "exploring everything!"}
- Favorite animals: ${p.favoriteAnimals.length > 0 ? p.favoriteAnimals.join(", ") : "all animals"}
- Favorite subjects: ${p.favoriteSubjects.length > 0 ? p.favoriteSubjects.join(", ") : "many things"}
- Subjects they find harder: ${p.leastFavoriteSubjects.length > 0 ? p.leastFavoriteSubjects.join(", ") : "none noted"}
${p.parentNotes ? `- Parent notes: ${p.parentNotes}` : ""}
${p.learningSupport ? `- Learning support: ${p.learningSupport}` : ""}

## Academic State
${masteryLines || "  No mastery data yet — treat as first-time learner."}
${weakLines ? `\nWeak areas needing gentle attention:\n${weakLines}` : ""}
${context.academicSnapshot.strongestSubtopics.length > 0 ? `\nStrong areas to build on: ${context.academicSnapshot.strongestSubtopics.map((s) => `${s.subject}/${s.subtopic}`).join(", ")}` : ""}
- Overall hint dependence: ${pct(a.hintDependenceAvg)} — ${a.hintDependenceAvg > 0.5 ? "still relies on hints, provide scaffolding" : "growing independence, fade hints"}
- Retention strength: ${pct(a.retentionStrengthAvg)} — ${a.retentionStrengthAvg < 0.4 ? "material fading fast, needs review" : "retaining well"}

## Communication Preferences
- Vocabulary: Use ${vocabLevel} words
- Sentence length: ${sentenceGuide}
- ${formatGuide}
- ${discoveryGuide}
- Verbosity: ${c.verbosity < 0.3 ? "Keep responses very short and punchy." : c.verbosity < 0.7 ? "Moderate length responses." : "Detailed explanations are welcome."}

## Current Adaptation
- Difficulty: ${ad.difficultyLevel}
- ${toneMap[ad.tone]}
- Scaffolding: ${scaffoldMap[ad.scaffoldingLevel]}
- Hints: ${hintMap[ad.hintStrategy]}
- ${encourageMap[ad.encouragementIntensity]}
${ad.useInterests && ad.interestToUse ? `- Weave ${ad.interestToUse} into examples when it fits naturally.` : ""}
${ad.misconceptionRemediation ? `- ⚠️ ACTIVE MISCONCEPTION to address: "${ad.misconceptionRemediation}". Address this specifically using step-by-step explanation. Don't just correct — help ${name} understand WHY their thinking was off.` : ""}
${ad.reviewMode ? "- 📖 REVIEW MODE: Reinforce fundamentals before introducing new concepts." : ""}
${ad.challengeMode ? "- 🚀 CHALLENGE MODE: Push boundaries. Offer stretch problems and open-ended questions." : ""}

## Current Goal
${context.currentGoal}

## Recent Mistakes to Be Aware Of
${context.recentMistakes.length > 0 ? context.recentMistakes.slice(0, 5).map((m) => `  - ${m.subject}/${m.subtopic}${m.misconception ? `: misconception "${m.misconception}"` : ""}`).join("\n") : "  None recently — great progress!"}

## What Has Worked Before
${context.successfulStrategies.length > 0 ? context.successfulStrategies.join(", ") : "Still learning what works best."}
${context.relatedMasteredConcepts.length > 0 ? `\nAlready mastered (can reference): ${context.relatedMasteredConcepts.join(", ")}` : ""}

## Teaching Rules
1. One concept at a time. Check understanding before advancing.
2. Use ${name}'s interests in examples whenever flagged above.
3. Ask questions back — "Does that make sense?" "Want to try one?"
4. When they struggle: "That's tricky! Let's figure it out together." Never: "That's wrong."
5. When they succeed: Celebrate proportional to effort, not just correctness.
6. Keep responses concise for a ${age}-year-old: aim for ${age <= 7 ? "2-4" : age <= 10 ? "3-6" : "4-8"} sentences unless explaining something complex.
7. For each interaction, internally track: was this answer right/wrong? was there a misconception? what format worked?

Remember: ${name} should leave every conversation feeling smarter and more confident. 🐼🎋`;
}

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function pickInterest(profile: Profile): string | null {
  const all = [...profile.interests, ...profile.favorite_topics, ...profile.favorite_animals];
  return all.length > 0 ? all[Math.floor(Math.random() * all.length)] : null;
}

function pickVariedFormat(comm: CommunicationSnapshot, eng: EngagementSnapshot): string {
  // Pick a format that's engaging but not the same as usual
  const engaging = eng.mostEngagingFormats.filter((f) => !comm.preferredFormats.includes(f));
  if (engaging.length > 0) return engaging[0];
  const options = ["visual", "story", "steps", "analogy", "quiz", "interactive"];
  return options[Math.floor(Math.random() * options.length)];
}

function pickFreshFormat(comm: CommunicationSnapshot, eng: EngagementSnapshot): string {
  // Pick something different from the usual and the least engaging
  const avoid = new Set([...comm.preferredFormats, ...eng.leastEngagingFormats]);
  const options = ["visual", "story", "steps", "analogy", "quiz", "interactive", "drawing", "game"];
  const fresh = options.filter((o) => !avoid.has(o));
  return fresh.length > 0 ? fresh[Math.floor(Math.random() * fresh.length)] : options[Math.floor(Math.random() * options.length)];
}

function findActiveRemediation(recentMistakes: RecentMistake[], currentSubject?: string): string | null {
  // Find the most common misconception in recent mistakes for the current subject
  const relevant = currentSubject
    ? recentMistakes.filter((m) => m.subject === currentSubject && m.misconception)
    : recentMistakes.filter((m) => m.misconception);

  if (relevant.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const m of relevant) {
    if (m.misconception) {
      counts[m.misconception] = (counts[m.misconception] || 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return sorted.length > 0 && sorted[0][1] >= 2 ? sorted[0][0] : null;
}

// ══════════════════════════════════════════════════════════════
// Debugging Utilities
// ══════════════════════════════════════════════════════════════

export function getAdaptationHistory(profileId: string, limit = 20): AdaptationLogEntry[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM adaptation_log WHERE profile_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(profileId, limit) as Record<string, unknown>[];
  return rows.map((r) => {
    if (typeof r.context_snapshot === "string") {
      try { r.context_snapshot = JSON.parse(r.context_snapshot as string); } catch { r.context_snapshot = {}; }
    }
    return r as AdaptationLogEntry;
  });
}

export function getLearnerDiagnostics(profileId: string) {
  const academic = buildAcademicSnapshot(profileId);
  const comm = buildCommunicationSnapshot(profileId);
  const engagement = buildEngagementSnapshot(profileId);
  const recentEvents = getRecentEvents(profileId, 50);
  const adaptationHistory = getAdaptationHistory(profileId, 10);

  // Compute trends from recent events
  const last10 = recentEvents.slice(0, 10);
  const prev10 = recentEvents.slice(10, 20);

  const recentCorrectRate = last10.filter((e) => e.was_correct).length / Math.max(last10.length, 1);
  const prevCorrectRate = prev10.filter((e) => e.was_correct).length / Math.max(prev10.length, 1);

  const correctnessTrend = recentCorrectRate > prevCorrectRate + 0.1 ? "improving"
    : recentCorrectRate < prevCorrectRate - 0.1 ? "declining" : "stable";

  const recentAvgTime = last10.reduce((s, e) => s + (e.time_spent_ms ?? 0), 0) / Math.max(last10.length, 1);
  const prevAvgTime = prev10.reduce((s, e) => s + (e.time_spent_ms ?? 0), 0) / Math.max(prev10.length, 1);
  const speedTrend = recentAvgTime < prevAvgTime * 0.8 ? "getting_faster"
    : recentAvgTime > prevAvgTime * 1.2 ? "getting_slower" : "stable";

  return {
    academic,
    communication: comm,
    engagement,
    trends: {
      correctness: correctnessTrend,
      speed: speedTrend,
      recentCorrectRate,
      recentAvgTimeMs: recentAvgTime,
    },
    recentAdaptations: adaptationHistory.slice(0, 5).map((a) => ({
      level: a.chosen_level,
      format: a.chosen_format,
      reason: a.reason_difficulty,
      when: a.created_at,
    })),
    eventCount: recentEvents.length,
  };
}
