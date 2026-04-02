/**
 * Seed script: creates a sample student profile with pre-populated learner model data.
 *
 * Usage:
 *   npx tsx scripts/seed-learner.ts
 *
 * This creates a student named "Luna" (age 8, 3rd grade) with realistic
 * mastery data, achievements, and interaction history so you can see the
 * dashboard, adaptive engine, and brain diagnostics in action immediately.
 */

import { getDb } from "../src/db/schema";
import { createProfile, addAchievement, createSession, addMessage } from "../src/db/queries";
import {
  upsertAcademicModel,
  updateCommunicationModel,
  updateEngagementModel,
  processInteraction,
} from "../src/lib/learner-brain";

// Force DB initialization
getDb();

console.log("🐼 Seeding sample learner profile...\n");

// ── Create profile ──
const profile = createProfile({
  name: "Luna",
  nickname: "Luna",
  age: 8,
  grade: "3rd Grade",
  school_level: "elementary",
  favorite_subjects: ["Math", "Science", "Art"],
  least_favorite_subjects: ["Writing"],
  reading_level: "medium",
  writing_confidence: "low",
  math_confidence: "high",
  attention_span: "medium",
  pace_preference: "medium",
  favorite_animals: ["Panda", "Dolphin", "Owl"],
  favorite_colors: ["Purple", "Blue", "Green"],
  favorite_topics: ["Space", "Ocean", "Dinosaurs"],
  goals: ["Get better at writing", "Learn about the solar system"],
  parent_notes: "Luna is bright but gets frustrated with writing assignments. She loves creative projects. Diagnosed with mild dyslexia — prefers visual learning.",
  learning_support_needs: "Mild dyslexia. Benefits from visual aids and extra time for reading tasks.",
  interests: ["Space", "Ocean", "Dinosaurs", "Drawing", "Building"],
  preferred_teaching_style: "visual",
});

console.log(`  Created profile: ${profile.name} (${profile.id})`);

// ── Seed academic models ──
const academicData = [
  // Math — strong, confident
  { subject: "Math", subtopic: "Addition", mastery: 0.92, confidence: 0.9, exposure: 25, correctness: 0.88, frustration: 0.05, boredom: 0.4, retention: 0.9, hints: 2, hintsUsed: 0, consCorrect: 8 },
  { subject: "Math", subtopic: "Subtraction", mastery: 0.85, confidence: 0.85, exposure: 20, correctness: 0.82, frustration: 0.1, boredom: 0.3, retention: 0.85, hints: 3, hintsUsed: 1, consCorrect: 5 },
  { subject: "Math", subtopic: "Multiplication", mastery: 0.55, confidence: 0.5, exposure: 12, correctness: 0.6, frustration: 0.2, boredom: 0.1, retention: 0.6, hints: 8, hintsUsed: 5, consCorrect: 2 },
  { subject: "Math", subtopic: "Fractions", mastery: 0.3, confidence: 0.25, exposure: 6, correctness: 0.35, frustration: 0.45, boredom: 0, retention: 0.35, hints: 5, hintsUsed: 4, consCorrect: 0, consIncorrect: 2, misconceptions: ["thinks numerator is always bigger"] },

  // Science — interested, moderate
  { subject: "Science", subtopic: "Solar System", mastery: 0.78, confidence: 0.8, exposure: 15, correctness: 0.75, frustration: 0.05, boredom: 0.1, retention: 0.8, hints: 2, hintsUsed: 0, consCorrect: 4, formats: ["visual", "story"] },
  { subject: "Science", subtopic: "Water Cycle", mastery: 0.6, confidence: 0.55, exposure: 8, correctness: 0.6, frustration: 0.15, boredom: 0.15, retention: 0.55, hints: 4, hintsUsed: 2, consCorrect: 2 },
  { subject: "Science", subtopic: "Ecosystems", mastery: 0.4, confidence: 0.35, exposure: 5, correctness: 0.4, frustration: 0.2, boredom: 0.2, retention: 0.4, hints: 3, hintsUsed: 2, consCorrect: 1 },

  // Reading — moderate, some struggle
  { subject: "Reading", subtopic: "Comprehension", mastery: 0.5, confidence: 0.4, exposure: 18, correctness: 0.5, frustration: 0.3, boredom: 0.1, retention: 0.5, hints: 10, hintsUsed: 7, consCorrect: 1 },
  { subject: "Reading", subtopic: "Vocabulary", mastery: 0.45, confidence: 0.4, exposure: 14, correctness: 0.45, frustration: 0.25, boredom: 0.15, retention: 0.45, hints: 8, hintsUsed: 5, consCorrect: 1 },

  // Writing — struggles, low confidence, frustration
  { subject: "Writing", subtopic: "Spelling", mastery: 0.25, confidence: 0.2, exposure: 20, correctness: 0.3, frustration: 0.7, boredom: 0, retention: 0.3, hints: 15, hintsUsed: 12, consCorrect: 0, consIncorrect: 4, misconceptions: ["confuses b and d", "drops silent e"] },
  { subject: "Writing", subtopic: "Sentences", mastery: 0.35, confidence: 0.25, exposure: 12, correctness: 0.35, frustration: 0.55, boredom: 0, retention: 0.35, hints: 8, hintsUsed: 6, consCorrect: 0, consIncorrect: 2 },
  { subject: "Writing", subtopic: "Creative Writing", mastery: 0.5, confidence: 0.45, exposure: 8, correctness: 0.55, frustration: 0.2, boredom: 0, retention: 0.5, hints: 3, hintsUsed: 1, consCorrect: 2, formats: ["story", "visual"] },
];

for (const d of academicData) {
  upsertAcademicModel(profile.id, d.subject, d.subtopic, {
    exposure_count: d.exposure,
    mastery_estimate: d.mastery,
    confidence_estimate: d.confidence,
    correctness_rate: d.correctness,
    frustration_risk: d.frustration,
    boredom_risk: d.boredom,
    retention_strength: d.retention,
    hint_dependence: d.hints > 0 ? d.hintsUsed / d.hints : 0,
    hints_given: d.hints,
    hints_used: d.hintsUsed,
    consecutive_correct: d.consCorrect ?? 0,
    consecutive_incorrect: (d as Record<string, unknown>).consIncorrect as number ?? 0,
    misconceptions: (d as Record<string, unknown>).misconceptions as string[] ?? [],
    successful_formats: (d as Record<string, unknown>).formats as string[] ?? [],
    avg_speed_seconds: 15 + Math.random() * 30,
  });
}

// Also create subject-level rollups
for (const subject of ["Math", "Science", "Reading", "Writing"]) {
  const subtopics = academicData.filter((d) => d.subject === subject);
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  upsertAcademicModel(profile.id, subject, null, {
    exposure_count: subtopics.reduce((s, d) => s + d.exposure, 0),
    mastery_estimate: avg(subtopics.map((d) => d.mastery)),
    confidence_estimate: avg(subtopics.map((d) => d.confidence)),
    correctness_rate: avg(subtopics.map((d) => d.correctness)),
    frustration_risk: Math.max(...subtopics.map((d) => d.frustration)),
    boredom_risk: Math.max(...subtopics.map((d) => d.boredom)),
    retention_strength: avg(subtopics.map((d) => d.retention)),
  });
}

console.log(`  Seeded ${academicData.length} academic models + 4 subject rollups`);

// ── Seed communication model ──
updateCommunicationModel(profile.id, {
  vocab_complexity_tolerance: 0.4,   // lower due to dyslexia
  sentence_length_tolerance: 0.4,
  prefers_stories: true,
  prefers_steps: false,
  prefers_visuals: true,
  prefers_analogies: true,
  prefers_quizzes: false,
  prefers_direct_answer: false,
  prefers_guided_discovery: true,
  preferred_praise_style: "enthusiastic",
  preferred_lesson_length: "short",
  response_verbosity_preference: 0.4,
});
console.log("  Seeded communication model");

// ── Seed engagement model ──
updateEngagementModel(profile.id, {
  task_completion_rate: 0.72,
  tasks_started: 45,
  tasks_completed: 32,
  avg_time_on_activity_seconds: 45,
  avg_response_latency_ms: 3500,
  dropout_points: ["Writing:Spelling", "Writing:Spelling", "Reading:Vocabulary"],
  most_engaging_formats: ["visual", "story", "game"],
  least_engaging_formats: ["quiz", "fill-in-blank"],
  session_length_trend: "stable",
  engagement_by_subject: { Math: 0.85, Science: 0.8, Reading: 0.55, Writing: 0.35 },
  engagement_by_format: { visual: 0.9, story: 0.85, game: 0.8, steps: 0.6, quiz: 0.4, "fill-in-blank": 0.3 },
});
console.log("  Seeded engagement model");

// ── Seed some achievements ──
addAchievement(profile.id, "first_lesson", "First Steps", "Completed your very first lesson with Panda!", "🐾");
addAchievement(profile.id, "five_lessons", "High Five!", "Completed 5 learning sessions!", "🖐️");
addAchievement(profile.id, "ten_lessons", "Perfect Ten", "Completed 10 learning sessions!", "🌟");
addAchievement(profile.id, "streak_3", "On a Roll!", "3 days in a row!", "🔥");
addAchievement(profile.id, "streak_7", "Week Warrior", "A whole week of learning every day!", "⚡");
addAchievement(profile.id, "first_mastery", "Brain Power!", "Mastered your first topic!", "🧠");
addAchievement(profile.id, "subject_explorer", "Explorer", "Tried learning 3 different subjects!", "🗺️");
addAchievement(profile.id, "bamboo_10", "Growing Bamboo", "Your bamboo grew to 10!", "🎋");
console.log("  Seeded 8 achievements");

// ── Seed sample sessions with messages ──
const session1 = createSession(profile.id, "Math");
addMessage(session1.id, profile.id, "user", "Can you help me with fractions?", "text");
addMessage(session1.id, profile.id, "assistant", "Of course! Let's start with something fun. Imagine you have a pizza with 8 slices and you eat 3. What fraction of the pizza did you eat? 🍕", "text");
addMessage(session1.id, profile.id, "user", "3/8?", "text");
addMessage(session1.id, profile.id, "assistant", "You got it! 🎋 3 out of 8 slices means 3/8. The top number (numerator) is how many you took, and the bottom number (denominator) is the total. Great thinking!", "text");

const session2 = createSession(profile.id, "Writing");
addMessage(session2.id, profile.id, "user", "I need help with spelling", "text");
addMessage(session2.id, profile.id, "assistant", "Let's practice together! I'll give you some words and we can work through them step by step. Ready? Let's start with an easy one: 'because'. Can you try spelling it?", "text");
addMessage(session2.id, profile.id, "user", "becuse", "text");
addMessage(session2.id, profile.id, "assistant", "So close! You got most of it right. The tricky part is 'a-u' in the middle: b-e-c-A-U-s-e. A trick to remember: 'Big Elephants Can Always Understand Small Elephants' — the first letter of each word spells BECAUSE! 🐘", "text");

const session3 = createSession(profile.id, "Science");
addMessage(session3.id, profile.id, "user", "Tell me about space!", "text");
addMessage(session3.id, profile.id, "assistant", "Space is amazing! Did you know that Jupiter is so big, you could fit 1,300 Earths inside it? 🪐 And it has a giant storm called the Great Red Spot that's been spinning for hundreds of years! What planet do you want to learn about?", "text");

console.log("  Seeded 3 sessions with sample messages");

// ── Simulate interaction events to populate the brain ──
console.log("\n🧠 Simulating interaction history...\n");

// Math interactions — mostly successful
for (let i = 0; i < 8; i++) {
  processInteraction({
    profileId: profile.id,
    sessionId: session1.id,
    eventType: "answer",
    subject: "Math",
    subtopic: "Addition",
    wasCorrect: true,
    difficulty: 0.3 + i * 0.05,
    timeSpentMs: 5000 + Math.random() * 10000,
    formatUsed: "visual",
    engagementSignals: i > 5 ? ["requested_harder"] : [],
  });
}

// Fractions — struggling
for (let i = 0; i < 4; i++) {
  processInteraction({
    profileId: profile.id,
    sessionId: session1.id,
    eventType: "answer",
    subject: "Math",
    subtopic: "Fractions",
    wasCorrect: i === 3, // only last one correct
    difficulty: 0.5,
    hintsOffered: 2,
    hintsUsed: i < 3 ? 2 : 1,
    timeSpentMs: 20000 + Math.random() * 15000,
    formatUsed: "steps",
    frustrationSignals: i === 2 ? ["long_pause", "repeated_wrong"] : [],
    misconceptionDetected: i < 2 ? "thinks numerator is always bigger" : undefined,
  });
}

// Writing — high frustration
for (let i = 0; i < 5; i++) {
  processInteraction({
    profileId: profile.id,
    sessionId: session2.id,
    eventType: "answer",
    subject: "Writing",
    subtopic: "Spelling",
    wasCorrect: i >= 4, // only last one correct
    difficulty: 0.4,
    hintsOffered: 3,
    hintsUsed: 2,
    timeSpentMs: 25000 + Math.random() * 20000,
    formatUsed: "fill-in-blank",
    frustrationSignals: i >= 2 && i < 4 ? ["repeated_wrong"] : [],
    misconceptionDetected: i < 2 ? "confuses b and d" : undefined,
  });
}

// Science — engaged and curious
for (let i = 0; i < 6; i++) {
  processInteraction({
    profileId: profile.id,
    sessionId: session3.id,
    eventType: "answer",
    subject: "Science",
    subtopic: "Solar System",
    wasCorrect: true,
    difficulty: 0.4 + i * 0.08,
    timeSpentMs: 8000 + Math.random() * 12000,
    formatUsed: i % 2 === 0 ? "visual" : "story",
    engagementSignals: ["asked_followup", "used_interest"],
  });
}

console.log("  Simulated 23 interaction events across Math, Writing, and Science");

// ── Update streaks to look realistic ──
const db = getDb();
db.prepare(
  "UPDATE streaks SET current_streak = 7, longest_streak = 12, total_sessions = 32, total_minutes = 480, bamboo_height = 45 WHERE profile_id = ?"
).run(profile.id);

console.log("\n✅ Seed complete!");
console.log(`\n  Profile ID: ${profile.id}`);
console.log("  Student: Luna, Age 8, 3rd Grade");
console.log("  Strong in: Math (Addition, Subtraction), Science (Solar System)");
console.log("  Struggling with: Writing (Spelling, Sentences), Math (Fractions)");
console.log("  7-day streak, 32 sessions, 45cm bamboo");
console.log("\n  View diagnostics: GET /api/brain?profileId=" + profile.id + "&view=diagnostics");
console.log("  View context: GET /api/brain?profileId=" + profile.id + "&view=context");
console.log("  View adaptations: GET /api/brain?profileId=" + profile.id + "&view=adaptation-history");
console.log("\n  Run the app with: npm run dev\n");
