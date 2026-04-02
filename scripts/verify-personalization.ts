/**
 * Verification script: ensures the personalization pipeline works end-to-end.
 * Tests that profile data, mastery, interests, and safety rules all appear in the system prompt.
 *
 * Usage: npx tsx scripts/verify-personalization.ts
 */

import { getDb } from "../src/db/schema";
import { getFirstProfile } from "../src/db/queries";
import { assembleTutorContext, buildDeepSystemPrompt } from "../src/lib/learner-brain";

getDb();

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}`); failed++; }
}

const profile = getFirstProfile();
if (!profile) {
  console.log("No profile found. Run `npm run seed` first.");
  process.exit(1);
}

console.log("🔍 Personalization & Safety Verification\n");
console.log(`Profile: ${profile.nickname || profile.name}, Age ${profile.age}\n`);

// ── Assemble context for a weak subject ──
const weakContext = assembleTutorContext(profile, null, "Writing", "Spelling");
const weakPrompt = buildDeepSystemPrompt(weakContext);

console.log("Test 1: Profile identity flows into prompt");
assert(weakPrompt.includes(profile.nickname || profile.name), "Child's name appears in prompt");
assert(weakPrompt.includes(String(profile.age)), "Child's age appears in prompt");

console.log("\nTest 2: Interests flow into prompt");
for (const interest of profile.interests.slice(0, 2)) {
  assert(weakPrompt.includes(interest), `Interest "${interest}" appears in prompt`);
}
for (const animal of profile.favorite_animals.slice(0, 2)) {
  assert(weakPrompt.includes(animal), `Animal "${animal}" appears in prompt`);
}

console.log("\nTest 3: Learning support needs flow through");
if (profile.learning_support_needs) {
  assert(weakPrompt.includes(profile.learning_support_needs.slice(0, 20)), "Learning support needs in prompt");
}
if (profile.parent_notes) {
  assert(weakPrompt.includes(profile.parent_notes.slice(0, 20)), "Parent notes in prompt");
}

console.log("\nTest 4: Adaptation responds to weak subject");
assert(
  weakContext.adaptation.difficultyLevel === "easier" || weakContext.adaptation.difficultyLevel === "much_easier",
  `Weak subject gets easier difficulty: ${weakContext.adaptation.difficultyLevel}`
);
assert(
  weakContext.adaptation.encouragementIntensity === "high",
  `Weak subject gets high encouragement: ${weakContext.adaptation.encouragementIntensity}`
);

console.log("\nTest 5: Strong subject gets challenge");
const strongContext = assembleTutorContext(profile, null, "Math", "Addition");
assert(
  strongContext.adaptation.difficultyLevel === "harder" || strongContext.adaptation.challengeMode,
  `Strong subject gets harder/challenge: ${strongContext.adaptation.difficultyLevel}`
);

console.log("\nTest 6: Safety rules are present");
const safetyChecks = [
  "NEVER discuss violence",
  "NEVER shame",
  "NEVER claim to be human",
  "age-appropriate",
  "trusted adult",
];
for (const check of safetyChecks) {
  assert(weakPrompt.includes(check), `Safety rule present: "${check}"`);
}

console.log("\nTest 7: Personality traits are present");
const personalityChecks = [
  "warm",
  "patient",
  "encouraging",
  "playful",
];
for (const check of personalityChecks) {
  assert(weakPrompt.toLowerCase().includes(check), `Personality trait: "${check}"`);
}

console.log("\nTest 8: Response structure guidance is present");
assert(weakPrompt.includes("Standard teaching response"), "Standard response pattern");
assert(weakPrompt.includes("When the child is confused"), "Confused child pattern");
assert(weakPrompt.includes("When the child is excelling"), "Excelling child pattern");

console.log("\nTest 9: Mistake reframing guidance is present");
assert(weakPrompt.includes("Never say"), "Mistake reframing never-say rules");
assert(weakPrompt.includes("Instead say"), "Mistake reframing alternative phrases");

console.log("\nTest 10: Output formatting guidance is present");
assert(weakPrompt.includes("Goal:"), "Output format marker: Goal");
assert(weakPrompt.includes("Activity:"), "Output format marker: Activity");

console.log("\nTest 11: Explainability is populated");
assert(weakContext.explainability.reasonDifficulty.length > 10, "Difficulty reason populated");
assert(weakContext.explainability.reasonFormat.length > 10, "Format reason populated");
assert(weakContext.explainability.keySignals.length > 0, `Key signals: ${weakContext.explainability.keySignals.length}`);

// ── Summary ──
console.log("\n" + "═".repeat(50));
console.log(`\n🐼 Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
if (failed > 0) {
  console.log("\n⚠️  Some verifications failed.");
  process.exit(1);
} else {
  console.log("\n✅ All personalization & safety checks pass!");
}
