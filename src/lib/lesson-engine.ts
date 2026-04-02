/**
 * Lesson Engine — Selects, adapts, and manages interactive lessons
 * based on the learner model.
 */

import type {
  LessonDefinition,
  LessonDifficulty,
  LessonState,
  ActivityBlock,
  CelebrationBlock,
  RecapBlock,
  HintBlock,
} from "./lesson-schema";
import { recordBlockResult, completeLessonState } from "./lesson-schema";
import type { BlockResult } from "./lesson-schema";
import {
  getAcademicModel,
  getAcademicModels,
  getCommunicationModel,
  getEngagementModel,
} from "./learner-brain";
import { lessonPacks } from "./lesson-packs";
import type { Profile } from "@/db/schema";

// ══════════════════════════════════════════════════════════════
// Lesson Selection — Pick the right lesson for this child
// ══════════════════════════════════════════════════════════════

export type LessonRecommendation = {
  lesson: LessonDefinition;
  reason: string;
  priority: number;  // higher = more recommended
};

export function getRecommendedLessons(profileId: string, profile: Profile, limit = 6): LessonRecommendation[] {
  const allLessons = lessonPacks;
  const comm = getCommunicationModel(profileId);
  const eng = getEngagementModel(profileId);

  const recommendations: LessonRecommendation[] = [];

  for (const lesson of allLessons) {
    let priority = 0;
    let reason = "";

    // Get academic model for this lesson's subject/subtopic
    const model = getAcademicModel(profileId, lesson.subject, lesson.subtopic)
      || getAcademicModel(profileId, lesson.subject);

    // ── Difficulty matching ──
    const targetDifficulty = selectDifficulty(profileId, lesson.subject, lesson.subtopic);
    if (lesson.difficulty === targetDifficulty) {
      priority += 20;
      reason = `Matches current level for ${lesson.subject}`;
    } else if (
      (targetDifficulty === "easy" && lesson.difficulty === "medium") ||
      (targetDifficulty === "medium" && lesson.difficulty === "easy") ||
      (targetDifficulty === "medium" && lesson.difficulty === "hard") ||
      (targetDifficulty === "hard" && lesson.difficulty === "medium")
    ) {
      priority += 10; // adjacent difficulty
    }

    // ── Subject relevance ──
    if (profile.favorite_subjects.includes(lesson.subject)) {
      priority += 8;
      reason += " (favorite subject)";
    }
    if (profile.least_favorite_subjects.includes(lesson.subject)) {
      priority += 3; // still include, but lower
    }

    // ── Review needs ──
    if (model && model.mastery_estimate < 0.4 && model.exposure_count > 2) {
      priority += 15;
      reason = `Review needed: ${lesson.subtopic} mastery at ${Math.round(model.mastery_estimate * 100)}%`;
    }

    // ── Retention decay ──
    if (model && model.retention_strength < 0.4 && model.exposure_count > 0) {
      priority += 12;
      reason = `Retention fading for ${lesson.subtopic} — time to refresh`;
    }

    // ── Frustration avoidance ──
    if (model && model.frustration_risk > 0.6 && lesson.difficulty === "easy") {
      priority += 5; // easy version of frustrating topic
      reason = `Gentle practice for ${lesson.subtopic} (frustration detected)`;
    }

    // ── Boredom busting ──
    if (model && model.boredom_risk > 0.5 && lesson.difficulty === "hard") {
      priority += 8;
      reason = `Challenge for ${lesson.subtopic} (boredom detected)`;
    }

    // ── Format preference ──
    if (comm) {
      const blockTypes = lesson.blocks.map((b) => b.type);
      if (comm.prefers_visuals && blockTypes.includes("diagram")) priority += 3;
      if (comm.prefers_stories && blockTypes.includes("reading_passage")) priority += 3;
      if (comm.prefers_quizzes && blockTypes.includes("multiple_choice")) priority += 3;
    }

    // ── Engagement by format ──
    if (eng) {
      const blockTypes = new Set(lesson.blocks.map((b) => b.type));
      for (const fmt of eng.most_engaging_formats) {
        if (blockTypes.has(fmt as ActivityBlock["type"])) priority += 2;
      }
    }

    // ── Interest matching ──
    const interests = [...profile.interests, ...profile.favorite_topics, ...profile.favorite_animals];
    for (const interest of interests) {
      if (lesson.title.toLowerCase().includes(interest.toLowerCase()) ||
          lesson.description.toLowerCase().includes(interest.toLowerCase())) {
        priority += 6;
        reason += ` (matches interest: ${interest})`;
        break;
      }
    }

    // ── Attention span ──
    if (profile.attention_span === "low" && lesson.estimatedMinutes <= 5) priority += 3;
    if (profile.attention_span === "high" && lesson.estimatedMinutes >= 8) priority += 2;

    if (!reason) reason = `${lesson.subject}: ${lesson.subtopic}`;

    recommendations.push({ lesson, reason: reason.trim(), priority });
  }

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

export function selectDifficulty(profileId: string, subject: string, subtopic?: string): LessonDifficulty {
  const model = getAcademicModel(profileId, subject, subtopic)
    || getAcademicModel(profileId, subject);

  if (!model || model.exposure_count === 0) return "easy";

  if (model.frustration_risk > 0.5 || model.mastery_estimate < 0.3) return "easy";
  if (model.mastery_estimate >= 0.7 && model.confidence_estimate >= 0.6) return "hard";
  return "medium";
}

// ══════════════════════════════════════════════════════════════
// Lesson Adaptation — Modify a lesson for the current child
// ══════════════════════════════════════════════════════════════

export function adaptLesson(lesson: LessonDefinition, profileId: string, profile: Profile): LessonDefinition {
  const model = getAcademicModel(profileId, lesson.subject, lesson.subtopic);
  const blocks = [...lesson.blocks];

  // ── Add welcome hint if frustration is high ──
  if (model && model.frustration_risk > 0.5) {
    const encourageHint: HintBlock = {
      type: "hint",
      content: `Don't worry ${profile.nickname || profile.name}, this is just for fun! Take your time and remember — making mistakes is how we learn. I believe in you! 🐼`,
      visual: "🌟",
    };
    blocks.unshift(encourageHint);
  }

  // ── Add extra hints before hard blocks if hint-dependent ──
  if (model && model.hint_dependence > 0.5) {
    const adapted: ActivityBlock[] = [];
    for (const block of blocks) {
      if (block.type === "multiple_choice" || block.type === "short_answer" || block.type === "fill_blank") {
        adapted.push({
          type: "hint",
          content: getPreBlockHint(block, lesson.subject),
          visual: "💡",
        });
      }
      adapted.push(block);
    }
    blocks.splice(0, blocks.length, ...adapted);
  }

  // ── Add celebration at the end ──
  const lastBlock = blocks[blocks.length - 1];
  if (lastBlock?.type !== "celebration") {
    const celebration: CelebrationBlock = {
      type: "celebration",
      message: `Amazing work, ${profile.nickname || profile.name}! You finished the whole lesson! 🎋`,
      stats: { correct: 0, total: 0 },
    };
    blocks.push(celebration);
  }

  // ── Add recap before celebration ──
  const celebIdx = blocks.findIndex((b) => b.type === "celebration");
  if (celebIdx > 0 && blocks[celebIdx - 1]?.type !== "recap") {
    const recap: RecapBlock = {
      type: "recap",
      title: "What We Learned",
      keyPoints: lesson.objectives,
      nextSteps: model && model.mastery_estimate < 0.6
        ? [`Keep practicing ${lesson.subtopic}!`, "Try the next lesson when you're ready."]
        : [`You're getting great at ${lesson.subtopic}!`, "Ready for a harder challenge?"],
    };
    blocks.splice(celebIdx, 0, recap);
  }

  return { ...lesson, blocks };
}

function getPreBlockHint(block: ActivityBlock, _subject: string): string {
  switch (block.type) {
    case "multiple_choice":
      return `Here comes a question! Read all the choices carefully before picking one. Remember, you can take your time.`;
    case "short_answer":
      return `Time to write your answer! Don't worry about spelling — just do your best.`;
    case "fill_blank":
      return `Fill in the blanks! Look at the words around the blank for clues.`;
    default:
      return `Let's try this next activity! Take your time and do your best.`;
  }
}

// ══════════════════════════════════════════════════════════════
// Lesson Progression — Handle block completion and scoring
// ══════════════════════════════════════════════════════════════

export function handleBlockComplete(
  state: LessonState,
  result: BlockResult,
): LessonState {
  return recordBlockResult(state, result);
}

export function handleLessonComplete(state: LessonState): LessonState {
  return completeLessonState(state);
}

export function shouldOfferRetry(state: LessonState, lesson: LessonDefinition): boolean {
  // Offer retry if score is low and lesson is short
  return state.overallScore < 0.5 && lesson.blocks.length <= 8;
}

export function shouldOfferHarder(state: LessonState): boolean {
  return state.overallScore >= 0.85 && state.totalHintsUsed === 0;
}

export function getNextLessonSuggestion(
  profileId: string,
  profile: Profile,
  completedLesson: LessonDefinition,
  score: number,
): LessonRecommendation | null {
  const recommendations = getRecommendedLessons(profileId, profile, 10);

  // Filter out the just-completed lesson
  const filtered = recommendations.filter((r) => r.lesson.id !== completedLesson.id);

  if (score < 0.5) {
    // Suggest easier version of same topic or review
    const easier = filtered.find(
      (r) => r.lesson.subject === completedLesson.subject &&
             r.lesson.subtopic === completedLesson.subtopic &&
             r.lesson.difficulty === "easy"
    );
    if (easier) return easier;
  }

  if (score >= 0.85) {
    // Suggest harder version or next topic
    const harder = filtered.find(
      (r) => r.lesson.subject === completedLesson.subject &&
             r.lesson.difficulty === "hard"
    );
    if (harder) return harder;
  }

  // Default: next recommended
  return filtered[0] || null;
}

// ══════════════════════════════════════════════════════════════
// Lesson Lookup
// ══════════════════════════════════════════════════════════════

export function getLessonById(id: string): LessonDefinition | null {
  return lessonPacks.find((l) => l.id === id) || null;
}

export function getLessonsBySubject(subject: string): LessonDefinition[] {
  return lessonPacks.filter((l) => l.subject === subject);
}

export function getLessonsByDifficulty(difficulty: LessonDifficulty): LessonDefinition[] {
  return lessonPacks.filter((l) => l.difficulty === difficulty);
}
