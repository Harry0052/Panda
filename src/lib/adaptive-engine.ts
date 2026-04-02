import type { Profile, LearnerModel, Session } from "@/db/schema";
import {
  getLearnerModels,
  getLearnerModel,
  upsertLearnerModel,
  getRecentSessions,
  getAchievements,
  getStreak,
  addAchievement,
  updateBambooHeight,
} from "@/db/queries";

// ── Types ──

export type AdaptiveStrategy = {
  difficulty: "easier" | "same" | "harder";
  pace: "slower" | "same" | "faster";
  format: string;
  encouragementLevel: "high" | "medium" | "low";
  useInterests: boolean;
  suggestedTopics: string[];
};

// ── System Prompt Builder ──

export function buildSystemPrompt(
  profile: Profile,
  learnerModels: LearnerModel[],
  recentSessions: Session[],
  currentSession: Session
): string {
  const name = profile.nickname || profile.name;
  const age = profile.age ?? 8;
  const gradeLabel = profile.grade ? `grade ${profile.grade}` : "elementary school";

  // Summarise mastery data
  const masteryLines = learnerModels
    .filter((m) => m.attempts > 0)
    .map((m) => {
      const topic = m.subtopic ? `${m.subject} > ${m.subtopic}` : m.subject;
      const pct = Math.round(m.proficiency * 100);
      const conf = m.confidence >= 0.7 ? "confident" : m.confidence >= 0.4 ? "growing" : "uncertain";
      return `  - ${topic}: ${pct}% proficiency, ${conf} confidence, ${m.attempts} attempts (${m.mastery_level})`;
    })
    .join("\n");

  // Recent struggles and wins
  const recentStruggles = recentSessions
    .flatMap((s) => s.topics_confused)
    .filter(Boolean)
    .slice(0, 5);
  const recentWins = recentSessions
    .flatMap((s) => s.topics_mastered)
    .filter(Boolean)
    .slice(0, 5);
  const whatWorked = recentSessions
    .flatMap((s) => s.what_worked)
    .filter(Boolean)
    .slice(0, 5);

  // Interests block
  const interests = [
    ...profile.interests,
    ...profile.favorite_topics,
    ...profile.favorite_animals.map((a) => `${a} (animal)`),
  ];

  // Teaching style
  const styleMap: Record<string, string> = {
    visual: "diagrams, pictures, and visual metaphors",
    auditory: "spoken explanations and rhymes",
    kinesthetic: "hands-on activities and interactive examples",
    reading: "reading and writing exercises",
    mixed: "a mix of visual, verbal, and interactive approaches",
  };
  const styleDesc = styleMap[profile.preferred_teaching_style] || styleMap.mixed;

  // Streak info
  const streak = getStreak(profile.id);
  const streakInfo = streak
    ? `${name} has a ${streak.current_streak}-day learning streak and has completed ${streak.total_sessions} total sessions.`
    : "";

  // Adaptive strategy for the prompt
  const strategy = determineAdaptiveStrategy(profile, learnerModels, recentSessions);

  return `You are Panda, a friendly, warm, and encouraging AI tutor for children. You are a cute panda who loves bamboo, learning, and helping kids grow. You speak directly to the child — they are your student and friend.

## Who You Are
- Your name is Panda. You are playful, patient, and kind.
- You celebrate effort, curiosity, and bravery — not just correct answers.
- You never shame, pressure, or make a child feel bad for getting something wrong.
- You use age-appropriate language for a ${age}-year-old in ${gradeLabel}.
- You keep explanations short and clear. Use simple words. Break big ideas into small steps.
- You love using fun examples, stories, and gentle humor to make learning enjoyable.

## About ${name}
- Name: ${name} (age ${age}, ${gradeLabel})
- Favorite subjects: ${profile.favorite_subjects.length > 0 ? profile.favorite_subjects.join(", ") : "exploring everything!"}
- Less favorite subjects: ${profile.least_favorite_subjects.length > 0 ? profile.least_favorite_subjects.join(", ") : "none mentioned"}
- Interests & things they love: ${interests.length > 0 ? interests.join(", ") : "lots of things!"}
- Favorite colors: ${profile.favorite_colors.length > 0 ? profile.favorite_colors.join(", ") : "all the colors"}
- Goals: ${profile.goals.length > 0 ? profile.goals.join(", ") : "to learn and have fun"}
- Reading level: ${profile.reading_level} | Writing confidence: ${profile.writing_confidence} | Math confidence: ${profile.math_confidence}
- Attention span: ${profile.attention_span} | Preferred pace: ${profile.pace_preference}
- Preferred learning style: ${styleDesc}
${profile.learning_support_needs ? `- Learning support needs: ${profile.learning_support_needs}` : ""}
${profile.parent_notes ? `- Notes from parent/guardian: ${profile.parent_notes}` : ""}

## ${name}'s Learning Progress
${masteryLines || "  No mastery data yet — this is a fresh start!"}
${recentWins.length > 0 ? `\nRecent wins (celebrate these!): ${recentWins.join(", ")}` : ""}
${recentStruggles.length > 0 ? `\nRecent struggles (approach gently, try a new angle): ${recentStruggles.join(", ")}` : ""}
${whatWorked.length > 0 ? `\nWhat has worked well before: ${whatWorked.join(", ")}` : ""}
${streakInfo}

## Current Adaptive Strategy
- Difficulty: ${strategy.difficulty} than their current level
- Pace: ${strategy.pace} than default
- Encouragement level: ${strategy.encouragementLevel} (${strategy.encouragementLevel === "high" ? "extra praise, celebrate small wins" : strategy.encouragementLevel === "medium" ? "balanced encouragement" : "lighter touch, they are confident"})
- ${strategy.useInterests ? `Weave in their interests (${interests.slice(0, 3).join(", ")}) when it fits naturally.` : "Focus on the subject matter directly."}

## Teaching Guidelines
1. **Start warm.** Greet ${name} by name occasionally. Ask how they're doing if it's the start of a session.
2. **One thing at a time.** Don't overwhelm. Teach one concept, check understanding, then move on.
3. **Use their interests.** If they love ${interests[0] || "animals"}, work that into examples and problems.
4. **Encourage effort.** Say things like "Great thinking!" or "I love how you tried that!" — not just "Correct!"
5. **When they struggle:** Be gentle. Say "That's a tricky one!" or "Let's figure this out together." Offer a hint or try explaining differently. Never say they are wrong in a discouraging way.
6. **When they succeed:** Celebrate! Use fun language. "You got it! 🎋" or "Your brain is growing like bamboo!"
7. **Keep it short.** Responses should be concise and scannable. Use bullet points or numbered steps for multi-part explanations. For a ${age}-year-old, aim for ${age <= 7 ? "2-4" : age <= 10 ? "3-6" : "4-8"} sentences per turn unless explaining something complex.
8. **Ask questions back.** Check understanding: "Does that make sense?" or "Want to try one?"
9. **Be safe.** Never discuss mature, violent, scary, or inappropriate content. If asked about something off-limits, gently redirect to learning.
10. **No external links or references.** You are self-contained — everything the child needs comes from you.

## Current Session
- Session subject: ${currentSession.subject || "open exploration"}
- Topics covered so far: ${currentSession.topics_covered.length > 0 ? currentSession.topics_covered.join(", ") : "just getting started"}

Remember: You are ${name}'s learning buddy. Make every interaction feel safe, fun, and rewarding. They should leave each conversation feeling smarter and more confident than when they started. 🐼`;
}

// ── Adaptive Strategy ──

export function determineAdaptiveStrategy(
  profile: Profile,
  learnerModels: LearnerModel[],
  recentSessions: Session[]
): AdaptiveStrategy {
  // Calculate overall proficiency across subjects
  const modelsWithAttempts = learnerModels.filter((m) => m.attempts > 0);
  const avgProficiency =
    modelsWithAttempts.length > 0
      ? modelsWithAttempts.reduce((sum, m) => sum + m.proficiency, 0) / modelsWithAttempts.length
      : 0.5;
  const avgConfidence =
    modelsWithAttempts.length > 0
      ? modelsWithAttempts.reduce((sum, m) => sum + m.confidence, 0) / modelsWithAttempts.length
      : 0.5;

  // Check recent session trends
  const recentStruggles = recentSessions.flatMap((s) => s.topics_confused).length;
  const recentWins = recentSessions.flatMap((s) => s.topics_mastered).length;
  const recentEngagement =
    recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.engagement_score, 0) / recentSessions.length
      : 0.5;

  // Determine difficulty
  let difficulty: AdaptiveStrategy["difficulty"] = "same";
  if (avgProficiency >= 0.75 && avgConfidence >= 0.6 && recentWins > recentStruggles) {
    difficulty = "harder";
  } else if (avgProficiency < 0.4 || avgConfidence < 0.3 || recentStruggles > recentWins * 2) {
    difficulty = "easier";
  }

  // Determine pace
  let pace: AdaptiveStrategy["pace"] = "same";
  const paceMap: Record<string, AdaptiveStrategy["pace"]> = {
    slow: "slower",
    medium: "same",
    fast: "faster",
  };
  pace = paceMap[profile.pace_preference] || "same";
  // Override if struggling
  if (recentStruggles > 3 && pace !== "slower") {
    pace = "slower";
  }

  // Determine encouragement level
  let encouragementLevel: AdaptiveStrategy["encouragementLevel"] = "medium";
  if (avgConfidence < 0.4 || recentStruggles > recentWins) {
    encouragementLevel = "high";
  } else if (avgConfidence > 0.8 && avgProficiency > 0.8) {
    encouragementLevel = "low";
  }

  // Preferred format from learner models
  const formatCounts: Record<string, number> = {};
  for (const m of modelsWithAttempts) {
    formatCounts[m.best_format] = (formatCounts[m.best_format] || 0) + 1;
  }
  const format =
    Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    profile.preferred_teaching_style ||
    "visual";

  // Use interests when confidence is low or engagement is dropping
  const useInterests = avgConfidence < 0.6 || recentEngagement < 0.5 || profile.interests.length > 0;

  // Suggest topics: things needing review + new frontiers
  const needsReview = modelsWithAttempts
    .filter((m) => m.proficiency < 0.5 && m.subtopic)
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 3)
    .map((m) => `Review: ${m.subject} > ${m.subtopic}`);

  const readyToAdvance = modelsWithAttempts
    .filter((m) => m.proficiency >= 0.75 && m.subtopic)
    .slice(0, 2)
    .map((m) => `Go deeper: ${m.subject} > ${m.subtopic}`);

  const suggestedTopics = [...needsReview, ...readyToAdvance];
  if (suggestedTopics.length === 0) {
    suggestedTopics.push("Start with something fun and exploratory!");
  }

  return {
    difficulty,
    pace,
    format,
    encouragementLevel,
    useInterests,
    suggestedTopics,
  };
}

// ── Mastery Update ──

export async function updateMasteryAfterResponse(
  profileId: string,
  subject: string,
  subtopic: string,
  wasCorrect: boolean,
  difficulty: number = 0.5
): Promise<void> {
  const existing = getLearnerModel(profileId, subject, subtopic);

  const currentProficiency = existing?.proficiency ?? 0.5;
  const currentConfidence = existing?.confidence ?? 0.5;
  const currentAttempts = existing?.attempts ?? 0;
  const currentSuccesses = existing?.successes ?? 0;

  // Proficiency update: weighted by difficulty
  // Correct answers on hard questions boost more; wrong answers on easy questions penalise more
  let proficiencyDelta: number;
  if (wasCorrect) {
    proficiencyDelta = 0.05 + difficulty * 0.05; // +0.05 to +0.10
  } else {
    proficiencyDelta = -(0.03 + (1 - difficulty) * 0.04); // -0.03 to -0.07
  }
  const newProficiency = Math.max(0, Math.min(1, currentProficiency + proficiencyDelta));

  // Confidence update: grows with consistent results, drops with inconsistency
  let confidenceDelta: number;
  if (wasCorrect) {
    confidenceDelta = 0.04;
  } else {
    confidenceDelta = currentConfidence > 0.7 ? -0.06 : -0.03;
  }
  const newConfidence = Math.max(0, Math.min(1, currentConfidence + confidenceDelta));

  // Determine mastery level
  const newAttempts = currentAttempts + 1;
  const newSuccesses = currentSuccesses + (wasCorrect ? 1 : 0);
  let masteryLevel = "novice";
  if (newProficiency >= 0.9 && newConfidence >= 0.7) masteryLevel = "master";
  else if (newProficiency >= 0.75) masteryLevel = "proficient";
  else if (newProficiency >= 0.5) masteryLevel = "developing";
  else if (newProficiency >= 0.25) masteryLevel = "beginner";

  upsertLearnerModel(profileId, subject, subtopic, {
    proficiency: newProficiency,
    confidence: newConfidence,
    attempts: newAttempts,
    successes: newSuccesses,
    mastery_level: masteryLevel,
    last_practiced: new Date().toISOString(),
  });

  // Also update the parent subject-level model (without subtopic)
  const subjectModel = getLearnerModel(profileId, subject);
  const allSubtopics = getLearnerModels(profileId).filter(
    (m) => m.subject === subject && m.subtopic
  );
  if (allSubtopics.length > 0) {
    const avgProf = allSubtopics.reduce((s, m) => s + m.proficiency, 0) / allSubtopics.length;
    const avgConf = allSubtopics.reduce((s, m) => s + m.confidence, 0) / allSubtopics.length;
    let subjectMastery = "novice";
    if (avgProf >= 0.9 && avgConf >= 0.7) subjectMastery = "master";
    else if (avgProf >= 0.75) subjectMastery = "proficient";
    else if (avgProf >= 0.5) subjectMastery = "developing";
    else if (avgProf >= 0.25) subjectMastery = "beginner";

    upsertLearnerModel(profileId, subject, null, {
      proficiency: avgProf,
      confidence: avgConf,
      attempts: (subjectModel?.attempts ?? 0) + 1,
      successes: (subjectModel?.successes ?? 0) + (wasCorrect ? 1 : 0),
      mastery_level: subjectMastery,
      last_practiced: new Date().toISOString(),
    });
  }

  // Award bamboo growth
  if (wasCorrect) {
    updateBambooHeight(profileId, 1);
  }
}

// ── Suggested Prompts ──

export function getSuggestedPrompts(
  profile: Profile,
  learnerModels: LearnerModel[]
): string[] {
  const age = profile.age ?? 8;
  const prompts: string[] = [];

  // Interest-based prompts
  const interests = [...profile.interests, ...profile.favorite_topics];
  if (interests.length > 0) {
    const interest = interests[Math.floor(Math.random() * interests.length)];
    prompts.push(`Tell me something cool about ${interest}!`);
  }

  // Subject-based prompts for areas needing practice
  const weakAreas = learnerModels
    .filter((m) => m.proficiency < 0.5 && m.attempts > 0 && m.subtopic)
    .sort((a, b) => a.proficiency - b.proficiency);
  if (weakAreas.length > 0) {
    const weak = weakAreas[0];
    prompts.push(`Can you help me understand ${weak.subtopic} in ${weak.subject}?`);
  }

  // Strong areas to build on
  const strongAreas = learnerModels
    .filter((m) => m.proficiency >= 0.7 && m.subtopic)
    .sort((a, b) => b.proficiency - a.proficiency);
  if (strongAreas.length > 0) {
    const strong = strongAreas[0];
    prompts.push(`I want a challenge in ${strong.subject}!`);
  }

  // Age-appropriate general prompts
  const generalPrompts =
    age <= 7
      ? [
          "Can you give me a fun math puzzle?",
          "Tell me a story about a brave animal!",
          "Help me practice my spelling!",
          "What are the planets in our solar system?",
          "Can we play a word game?",
          "Why is the sky blue?",
        ]
      : age <= 10
        ? [
            "Can you quiz me on multiplication?",
            "Help me write a short story!",
            "Teach me about volcanoes!",
            "Can we practice fractions together?",
            "What are some cool science experiments I can try?",
            "Help me learn about a new country!",
          ]
        : [
            "Can you help me with my math homework?",
            "Explain how photosynthesis works!",
            "Help me brainstorm ideas for a writing project!",
            "Quiz me on history facts!",
            "Can we work on algebra together?",
            "Teach me about the water cycle!",
          ];

  // Fill up to 6 prompts
  const shuffled = generalPrompts.sort(() => Math.random() - 0.5);
  for (const p of shuffled) {
    if (prompts.length >= 6) break;
    if (!prompts.includes(p)) prompts.push(p);
  }

  // Favourite animal prompt
  if (profile.favorite_animals.length > 0 && prompts.length < 6) {
    const animal = profile.favorite_animals[Math.floor(Math.random() * profile.favorite_animals.length)];
    prompts.push(`Tell me 3 amazing facts about ${animal}!`);
  }

  return prompts.slice(0, 6);
}

// ── Achievement Checker ──

export async function checkForAchievements(profileId: string): Promise<void> {
  const existingAchievements = getAchievements(profileId);
  const existingTypes = new Set(existingAchievements.map((a) => a.type));
  const streak = getStreak(profileId);
  const models = getLearnerModels(profileId);
  const sessions = getRecentSessions(profileId, 100);

  const award = (type: string, title: string, description: string, icon: string) => {
    if (!existingTypes.has(type)) {
      addAchievement(profileId, type, title, description, icon);
      existingTypes.add(type);
    }
  };

  // First lesson
  if (sessions.length >= 1) {
    award("first_lesson", "First Steps", "Completed your very first lesson with Panda!", "🐾");
  }

  // 5 lessons
  if (sessions.length >= 5) {
    award("five_lessons", "High Five!", "Completed 5 learning sessions!", "🖐️");
  }

  // 10 lessons
  if (sessions.length >= 10) {
    award("ten_lessons", "Perfect Ten", "Completed 10 learning sessions!", "🌟");
  }

  // 25 lessons
  if (sessions.length >= 25) {
    award("twentyfive_lessons", "Quarter Century", "Completed 25 learning sessions!", "🏆");
  }

  // 50 lessons
  if (sessions.length >= 50) {
    award("fifty_lessons", "Super Scholar", "Completed 50 learning sessions!", "👑");
  }

  // Streak milestones
  if (streak) {
    if (streak.current_streak >= 3) {
      award("streak_3", "On a Roll!", "3 days in a row! Keep it going!", "🔥");
    }
    if (streak.current_streak >= 7) {
      award("streak_7", "Week Warrior", "A whole week of learning every day!", "⚡");
    }
    if (streak.current_streak >= 14) {
      award("streak_14", "Two-Week Titan", "14 days straight! Incredible!", "💎");
    }
    if (streak.current_streak >= 30) {
      award("streak_30", "Monthly Master", "30 days of daily learning! Legendary!", "🎖️");
    }
  }

  // Mastery milestones
  const masteredTopics = models.filter((m) => m.mastery_level === "master" && m.subtopic);
  if (masteredTopics.length >= 1) {
    award("first_mastery", "Brain Power!", "Mastered your first topic!", "🧠");
  }
  if (masteredTopics.length >= 5) {
    award("five_mastery", "Knowledge Champion", "Mastered 5 different topics!", "🎓");
  }
  if (masteredTopics.length >= 10) {
    award("ten_mastery", "Wisdom Seeker", "Mastered 10 topics! You're amazing!", "📚");
  }

  // Subject explorer: attempted 3+ different subjects
  const uniqueSubjects = new Set(models.filter((m) => !m.subtopic && m.attempts > 0).map((m) => m.subject));
  if (uniqueSubjects.size >= 3) {
    award("subject_explorer", "Explorer", "Tried learning 3 different subjects!", "🗺️");
  }

  // Bamboo growth milestones
  if (streak && streak.bamboo_height >= 10) {
    award("bamboo_10", "Growing Bamboo", "Your bamboo grew to 10! Keep feeding it!", "🎋");
  }
  if (streak && streak.bamboo_height >= 50) {
    award("bamboo_50", "Bamboo Forest", "Your bamboo reached 50! Amazing growth!", "🌿");
  }
  if (streak && streak.bamboo_height >= 100) {
    award("bamboo_100", "Bamboo Tower", "Your bamboo hit 100! Panda is so proud!", "🏯");
  }
}
