/**
 * Lesson Schema — Defines the structure of all activity blocks
 * and how they compose into lessons.
 *
 * A Lesson is an ordered sequence of ActivityBlocks. Each block
 * is self-contained with its own type, content, and scoring config.
 * The LessonPlayer renders blocks sequentially, tracking progress.
 */

// ══════════════════════════════════════════════════════════════
// Activity Block Types
// ══════════════════════════════════════════════════════════════

export type ExplanationBlock = {
  type: "explanation";
  title: string;
  content: string;             // supports markdown-like formatting
  visual?: string;             // emoji or icon key
  highlight?: string;          // key phrase to highlight
};

export type DiagramBlock = {
  type: "diagram";
  title: string;
  description?: string;
  elements: DiagramElement[];
  width?: number;
  height?: number;
};

export type DiagramElement = {
  id: string;
  shape: "box" | "circle" | "arrow" | "label" | "callout" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fontSize?: number;
  // Arrow-specific
  toX?: number;
  toY?: number;
  // Callout-specific
  pointToId?: string;
  // Step numbering
  stepNumber?: number;
};

export type DrawingBlock = {
  type: "drawing";
  prompt: string;
  hint?: string;
  width?: number;
  height?: number;
  expectedConcepts?: string[]; // lightweight concept check
};

export type LabelPartsBlock = {
  type: "label_parts";
  title: string;
  description: string;
  diagramElements: DiagramElement[];
  labels: Array<{
    id: string;
    text: string;
    correctZone: { x: number; y: number; width: number; height: number };
  }>;
};

export type SequenceBlock = {
  type: "sequence";
  title: string;
  instruction?: string;
  items: Array<{ id: string; text: string }>;
  correctOrder: string[];
};

export type MatchBlock = {
  type: "match";
  title: string;
  instruction?: string;
  pairs: Array<{ left: string; right: string }>;
};

export type MultipleChoiceBlock = {
  type: "multiple_choice";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject?: string;
};

export type ShortAnswerBlock = {
  type: "short_answer";
  question: string;
  acceptedAnswers: string[];    // case-insensitive matches
  hint?: string;
  explanation?: string;
};

export type ReadingPassageBlock = {
  type: "reading_passage";
  title: string;
  passage: string;
  followUpQuestions?: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
};

export type WritingPromptBlock = {
  type: "writing_prompt";
  prompt: string;
  starterSentence?: string;
  minWords?: number;
  guidingQuestions?: string[];
};

export type RevisionBlock = {
  type: "revision";
  title: string;
  original: string;
  issue: string;
  hint?: string;
  acceptedRevisions?: string[];
};

export type HintBlock = {
  type: "hint";
  content: string;
  visual?: string;
};

export type CelebrationBlock = {
  type: "celebration";
  message: string;
  achievement?: string;
  stats?: {
    correct: number;
    total: number;
    timeSeconds?: number;
  };
};

export type RecapBlock = {
  type: "recap";
  title: string;
  keyPoints: string[];
  nextSteps?: string[];
};

export type FillBlankBlock = {
  type: "fill_blank";
  title: string;
  sentences: Array<{ text: string; blank: string; hint?: string }>;
};

export type SpellingBlock = {
  type: "spelling";
  words: Array<{ word: string; hint: string; difficulty: string }>;
};

// Union type of all blocks
export type ActivityBlock =
  | ExplanationBlock
  | DiagramBlock
  | DrawingBlock
  | LabelPartsBlock
  | SequenceBlock
  | MatchBlock
  | MultipleChoiceBlock
  | ShortAnswerBlock
  | ReadingPassageBlock
  | WritingPromptBlock
  | RevisionBlock
  | HintBlock
  | CelebrationBlock
  | RecapBlock
  | FillBlankBlock
  | SpellingBlock;

// ══════════════════════════════════════════════════════════════
// Lesson Definition
// ══════════════════════════════════════════════════════════════

export type LessonDifficulty = "easy" | "medium" | "hard";

export type LessonDefinition = {
  id: string;
  title: string;
  subject: string;
  subtopic: string;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
  description: string;
  objectives: string[];
  blocks: ActivityBlock[];
  tags?: string[];
};

// ══════════════════════════════════════════════════════════════
// Lesson State (runtime)
// ══════════════════════════════════════════════════════════════

export type BlockResult = {
  blockIndex: number;
  blockType: string;
  completed: boolean;
  score?: number;           // 0–1 for scored blocks
  timeSpentMs: number;
  hintsUsed: number;
  attempts: number;
  wasCorrect?: boolean;
};

export type LessonState = {
  lessonId: string;
  profileId: string;
  sessionId: string;
  currentBlockIndex: number;
  blockResults: BlockResult[];
  startedAt: number;
  completedAt?: number;
  overallScore: number;       // running average
  totalHintsUsed: number;
};

export function createLessonState(lessonId: string, profileId: string, sessionId: string): LessonState {
  return {
    lessonId,
    profileId,
    sessionId,
    currentBlockIndex: 0,
    blockResults: [],
    startedAt: Date.now(),
    overallScore: 0,
    totalHintsUsed: 0,
  };
}

export function recordBlockResult(state: LessonState, result: BlockResult): LessonState {
  const blockResults = [...state.blockResults, result];
  const scoredResults = blockResults.filter((r) => r.score !== undefined);
  const overallScore = scoredResults.length > 0
    ? scoredResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / scoredResults.length
    : 0;
  const totalHintsUsed = blockResults.reduce((sum, r) => sum + r.hintsUsed, 0);

  return {
    ...state,
    currentBlockIndex: state.currentBlockIndex + 1,
    blockResults,
    overallScore,
    totalHintsUsed,
  };
}

export function completeLessonState(state: LessonState): LessonState {
  return {
    ...state,
    completedAt: Date.now(),
  };
}
