/**
 * Dumps a sample system prompt to see what Panda "thinks" before responding.
 * Usage: npx tsx scripts/dump-prompt.ts
 */
import { getDb } from "../src/db/schema";
import { getFirstProfile } from "../src/db/queries";
import { assembleTutorContext, buildDeepSystemPrompt } from "../src/lib/learner-brain";

getDb();

const profile = getFirstProfile();
if (!profile) {
  console.log("No profile found. Run `npm run seed` first.");
  process.exit(1);
}

const context = assembleTutorContext(profile, null, "Math", "Fractions");
const prompt = buildDeepSystemPrompt(context);

console.log("═".repeat(70));
console.log("SYSTEM PROMPT FOR:", profile.nickname || profile.name);
console.log("Subject: Math / Fractions");
console.log("═".repeat(70));
console.log();
console.log(prompt);
console.log();
console.log("═".repeat(70));
console.log(`Prompt length: ${prompt.length} characters / ~${Math.round(prompt.length / 4)} tokens`);
console.log("═".repeat(70));
