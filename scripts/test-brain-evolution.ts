/**
 * Brain Evolution Test: demonstrates that the learner model evolves
 * correctly across different interaction scenarios.
 *
 * Usage:
 *   npx tsx scripts/test-brain-evolution.ts
 *
 * Tests:
 * 1. New student starts at baseline
 * 2. Correct answers raise mastery and confidence
 * 3. Wrong answers lower mastery and raise frustration
 * 4. Repeated misconception triggers targeted remediation
 * 5. Boredom rises with easy consecutive correct answers
 * 6. Hint dependence tracks correctly
 * 7. Format preferences evolve from success/failure
 * 8. Engagement model tracks completion rates
 * 9. Adaptation rules fire correctly for each scenario
 * 10. Retention decays concept (simulated)
 */

import { getDb } from "../src/db/schema";
import { createProfile, createSession } from "../src/db/queries";
import {
  getAcademicModel,
  getCommunicationModel,
  getEngagementModel,
  processInteraction,
  assembleTutorContext,
  getLearnerDiagnostics,
} from "../src/lib/learner-brain";

// Force DB init
getDb();

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function round(n: number, d = 2): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

console.log("🧪 Panda Learner Brain Evolution Tests\n");

// ── Setup ──
const profile = createProfile({
  name: "TestKid",
  nickname: "Testy",
  age: 9,
  grade: "4th Grade",
  favorite_subjects: ["Science"],
  least_favorite_subjects: ["Writing"],
  interests: ["Dinosaurs", "Space"],
  favorite_animals: ["T-Rex"],
  preferred_teaching_style: "visual",
});
const session = createSession(profile.id, "Math");

// ══════════════════════════════════════════════════════
console.log("Test 1: New student starts at baseline");
// ══════════════════════════════════════════════════════
{
  const model = getAcademicModel(profile.id, "Math", "Addition");
  assert(model === null, "No academic model exists yet for untouched topic");

  const comm = getCommunicationModel(profile.id);
  assert(comm !== null, "Communication model exists after profile creation");
  assert(comm!.vocab_complexity_tolerance === 0.5, "Vocab complexity starts at 0.5");

  const eng = getEngagementModel(profile.id);
  assert(eng !== null, "Engagement model exists after profile creation");
  assert(eng!.task_completion_rate === 0, "Task completion starts at 0");
}

// ══════════════════════════════════════════════════════
console.log("\nTest 2: Correct answers raise mastery and confidence");
// ══════════════════════════════════════════════════════
{
  // 5 correct answers on Addition
  for (let i = 0; i < 5; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Math",
      subtopic: "Addition",
      wasCorrect: true,
      difficulty: 0.5,
      timeSpentMs: 8000,
      formatUsed: "visual",
    });
  }

  const model = getAcademicModel(profile.id, "Math", "Addition")!;
  assert(model.mastery_estimate > 0.3, `Mastery rose to ${round(model.mastery_estimate)} (above baseline 0.3)`);
  assert(model.confidence_estimate > 0.5, `Confidence rose to ${round(model.confidence_estimate)} (above baseline 0.5)`);
  assert(model.consecutive_correct === 5, `Consecutive correct is 5 (got ${model.consecutive_correct})`);
  assert(model.frustration_risk < 0.1, `Frustration is low at ${round(model.frustration_risk)}`);
  assert(model.exposure_count === 5, `Exposure count is 5 (got ${model.exposure_count})`);
}

// ══════════════════════════════════════════════════════
console.log("\nTest 3: Wrong answers lower mastery and raise frustration");
// ══════════════════════════════════════════════════════
{
  // 4 wrong answers on Fractions
  for (let i = 0; i < 4; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Math",
      subtopic: "Fractions",
      wasCorrect: false,
      difficulty: 0.5,
      timeSpentMs: 25000,
      frustrationSignals: i >= 2 ? ["repeated_wrong"] : [],
    });
  }

  const model = getAcademicModel(profile.id, "Math", "Fractions")!;
  assert(model.mastery_estimate < 0.3, `Mastery dropped to ${round(model.mastery_estimate)} (below 0.3)`);
  assert(model.confidence_estimate < 0.5, `Confidence dropped to ${round(model.confidence_estimate)}`);
  assert(model.frustration_risk > 0.3, `Frustration rose to ${round(model.frustration_risk)}`);
  assert(model.consecutive_incorrect === 4, `Consecutive incorrect is 4 (got ${model.consecutive_incorrect})`);
  assert(model.consecutive_correct === 0, "Consecutive correct reset to 0");
}

// ══════════════════════════════════════════════════════
console.log("\nTest 4: Repeated misconception triggers remediation");
// ══════════════════════════════════════════════════════
{
  // Add misconception-tagged errors
  for (let i = 0; i < 3; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Math",
      subtopic: "Fractions",
      wasCorrect: false,
      difficulty: 0.5,
      misconceptionDetected: "confuses numerator and denominator",
    });
  }

  const model = getAcademicModel(profile.id, "Math", "Fractions")!;
  assert(
    model.misconceptions.includes("confuses numerator and denominator"),
    "Misconception recorded in academic model"
  );

  // Check that adaptation fires misconception remediation
  const context = assembleTutorContext(profile, session.id, "Math", "Fractions");
  assert(
    context.adaptation.misconceptionRemediation === "confuses numerator and denominator",
    `Adaptation targets misconception: "${context.adaptation.misconceptionRemediation}"`
  );
  assert(
    context.adaptation.scaffoldingLevel === "heavy",
    `Scaffolding set to heavy (got ${context.adaptation.scaffoldingLevel})`
  );
}

// ══════════════════════════════════════════════════════
console.log("\nTest 5: Boredom rises with easy consecutive correct");
// ══════════════════════════════════════════════════════
{
  // 8 correct on very easy task
  for (let i = 0; i < 8; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Math",
      subtopic: "Addition",
      wasCorrect: true,
      difficulty: 0.15, // very easy
      timeSpentMs: 2000, // very fast
    });
  }

  const model = getAcademicModel(profile.id, "Math", "Addition")!;
  assert(model.boredom_risk > 0.3, `Boredom rose to ${round(model.boredom_risk)} (above 0.3)`);
  assert(model.mastery_estimate > 0.6, `Mastery stayed high at ${round(model.mastery_estimate)}`);
}

// ══════════════════════════════════════════════════════
console.log("\nTest 6: Hint dependence tracks correctly");
// ══════════════════════════════════════════════════════
{
  // Answers where hints are offered and used
  for (let i = 0; i < 5; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Reading",
      subtopic: "Vocabulary",
      wasCorrect: i >= 3, // last 2 correct
      difficulty: 0.5,
      hintsOffered: 2,
      hintsUsed: i < 3 ? 2 : (i === 3 ? 1 : 0), // gradually using fewer hints
      timeSpentMs: 15000,
      formatUsed: "steps",
    });
  }

  const model = getAcademicModel(profile.id, "Reading", "Vocabulary")!;
  assert(model.hint_dependence > 0, `Hint dependence is ${round(model.hint_dependence)} (tracking usage)`);
  assert(model.hints_given === 10, `Total hints given: ${model.hints_given} (expected 10)`);
  assert(model.hints_used > 0 && model.hints_used < 10, `Hints used: ${model.hints_used} (between 0 and 10)`);
}

// ══════════════════════════════════════════════════════
console.log("\nTest 7: Format preferences evolve");
// ══════════════════════════════════════════════════════
{
  // Success with visual format
  for (let i = 0; i < 4; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Science",
      subtopic: "Planets",
      wasCorrect: true,
      difficulty: 0.5,
      formatUsed: "visual",
      engagementSignals: ["asked_followup"],
    });
  }
  // Failure with quiz format
  for (let i = 0; i < 3; i++) {
    processInteraction({
      profileId: profile.id,
      sessionId: session.id,
      eventType: "answer",
      subject: "Science",
      subtopic: "Planets",
      wasCorrect: false,
      difficulty: 0.5,
      formatUsed: "quiz",
      frustrationSignals: ["repeated_wrong"],
    });
  }

  const model = getAcademicModel(profile.id, "Science", "Planets")!;
  assert(model.successful_formats.includes("visual"), "Visual format recorded as successful");
  assert(model.failed_formats.includes("quiz"), "Quiz format recorded as failed");
}

// ══════════════════════════════════════════════════════
console.log("\nTest 8: Engagement model tracks completion");
// ══════════════════════════════════════════════════════
{
  // Start 3 tasks, complete 2
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "task_start", subject: "Math" });
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "task_complete", subject: "Math", wasCorrect: true, timeSpentMs: 30000, formatUsed: "game" });
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "task_start", subject: "Math" });
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "task_complete", subject: "Math", wasCorrect: true, timeSpentMs: 25000, formatUsed: "visual" });
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "task_start", subject: "Writing" });
  processInteraction({ profileId: profile.id, sessionId: session.id, eventType: "skip", subject: "Writing", subtopic: "Spelling" });

  const eng = getEngagementModel(profile.id)!;
  assert(eng.tasks_started >= 3, `Tasks started: ${eng.tasks_started} (at least 3)`);
  assert(eng.tasks_completed >= 2, `Tasks completed: ${eng.tasks_completed} (at least 2)`);
  assert(eng.task_completion_rate > 0 && eng.task_completion_rate <= 1, `Completion rate: ${round(eng.task_completion_rate)}`);
  assert(eng.dropout_points.length > 0, `Dropout points tracked: ${eng.dropout_points.length}`);
}

// ══════════════════════════════════════════════════════
console.log("\nTest 9: Adaptation rules fire correctly");
// ══════════════════════════════════════════════════════
{
  // Context for strong subject — should challenge
  const mathContext = assembleTutorContext(profile, session.id, "Math", "Addition");
  assert(
    mathContext.adaptation.difficultyLevel === "harder" || mathContext.adaptation.challengeMode || mathContext.adaptation.difficultyLevel === "same",
    `Math/Addition adaptation: ${mathContext.adaptation.difficultyLevel} (high mastery should push harder or stay same)`
  );

  // Context for struggling subject — should support
  const writingContext = assembleTutorContext(profile, session.id, "Math", "Fractions");
  assert(
    writingContext.adaptation.difficultyLevel === "easier" || writingContext.adaptation.difficultyLevel === "much_easier",
    `Math/Fractions adaptation: ${writingContext.adaptation.difficultyLevel} (low mastery + frustration → easier)`
  );
  assert(
    writingContext.adaptation.encouragementIntensity === "high",
    `Encouragement is high for struggling topic (got ${writingContext.adaptation.encouragementIntensity})`
  );
  assert(
    writingContext.adaptation.scaffoldingLevel === "heavy" || writingContext.adaptation.scaffoldingLevel === "moderate",
    `Scaffolding for struggling: ${writingContext.adaptation.scaffoldingLevel}`
  );
}

// ══════════════════════════════════════════════════════
console.log("\nTest 10: Explainability report is populated");
// ══════════════════════════════════════════════════════
{
  const context = assembleTutorContext(profile, session.id, "Math", "Fractions");
  assert(context.explainability.chosenLevel.length > 0, `Chosen level: "${context.explainability.chosenLevel}"`);
  assert(context.explainability.reasonDifficulty.length > 0, `Difficulty reason: "${context.explainability.reasonDifficulty.slice(0, 60)}..."`);
  assert(context.explainability.reasonFormat.length > 0, `Format reason: "${context.explainability.reasonFormat.slice(0, 60)}..."`);
  assert(context.explainability.keySignals.length > 0, `Key signals: ${context.explainability.keySignals.length} signals captured`);
  assert(context.explainability.timestamp.length > 0, "Timestamp present");
}

// ══════════════════════════════════════════════════════
console.log("\nTest 11: Full diagnostics endpoint works");
// ══════════════════════════════════════════════════════
{
  const diag = getLearnerDiagnostics(profile.id);
  assert(Object.keys(diag.academic.subjectMastery).length > 0, `Subject mastery data: ${Object.keys(diag.academic.subjectMastery).length} subjects`);
  assert(diag.communication.preferredFormats.length > 0, `Communication preferences: ${diag.communication.preferredFormats.join(", ")}`);
  assert(diag.trends.correctness !== undefined, `Correctness trend: ${diag.trends.correctness}`);
  assert(diag.trends.speed !== undefined, `Speed trend: ${diag.trends.speed}`);
  assert(diag.eventCount > 0, `Total events: ${diag.eventCount}`);
  assert(diag.recentAdaptations.length > 0, `Adaptation history: ${diag.recentAdaptations.length} entries`);
}

// ── Summary ──
console.log("\n" + "═".repeat(50));
console.log(`\n🐼 Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);

if (failed > 0) {
  console.log("\n⚠️  Some tests failed. Review the output above.");
  process.exit(1);
} else {
  console.log("\n✅ All tests passed! The learner brain evolves correctly.");
  process.exit(0);
}
