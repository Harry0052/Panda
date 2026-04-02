"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  RotateCcw,
  Star,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type {
  LessonDefinition,
  ActivityBlock,
  LessonState,
  BlockResult,
} from "@/lib/lesson-schema";
import { createLessonState, recordBlockResult, completeLessonState } from "@/lib/lesson-schema";
import { DiagramRenderer } from "./DiagramRenderer";
import { MatchingGame } from "./MatchingGame";
import { QuizCard } from "./QuizCard";
import { DrawingCanvas } from "./DrawingCanvas";
import { SequenceOrder } from "./SequenceOrder";
import { FillInTheBlank } from "./FillInTheBlank";
import { SpellingPractice } from "./SpellingPractice";

// ══════════════════════════════════════════════════════════════
// Block Renderers
// ══════════════════════════════════════════════════════════════

function ExplanationRenderer({ block, onNext }: { block: Extract<ActivityBlock, { type: "explanation" }>; onNext: () => void }) {
  return (
    <div className="space-y-6 text-center max-w-lg mx-auto">
      {block.visual && <div className="text-5xl">{block.visual}</div>}
      <h3 className="text-2xl font-bold text-[#2F2F2F]">{block.title}</h3>
      <p className="text-lg text-[#2F2F2F] leading-relaxed">
        {block.highlight
          ? block.content.split(block.highlight).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <span className="bg-[#F4C95D]/30 px-1 rounded font-semibold">{block.highlight}</span>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )
          : block.content}
      </p>
      <Button onClick={onNext} className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg px-8 py-6 rounded-2xl">
        Got it! <ChevronRight size={18} />
      </Button>
    </div>
  );
}

function DiagramBlockRenderer({ block, onNext }: { block: Extract<ActivityBlock, { type: "diagram" }>; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.title}</h3>
      {block.description && <p className="text-[#6B7280] text-center">{block.description}</p>}
      <DiagramRenderer elements={block.elements} width={block.width} height={block.height} />
      <div className="flex justify-center pt-2">
        <Button onClick={onNext} className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg px-8 py-5 rounded-2xl">
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function DrawingBlockRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "drawing" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <div className="space-y-4">
      <DrawingCanvas
        prompt={block.prompt}
        width={block.width || 500}
        height={block.height || 350}
        onSave={() => {
          onComplete({
            blockIndex: 0,
            blockType: "drawing",
            completed: true,
            score: 1,
            timeSpentMs: Date.now() - startTime.current,
            hintsUsed: 0,
            attempts: 1,
            wasCorrect: true,
          });
        }}
      />
    </div>
  );
}

function LabelPartsRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "label_parts" }>; onComplete: (result: BlockResult) => void }) {
  const [placed, setPlaced] = useState<Record<string, { x: number; y: number }>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const startTime = useRef(Date.now());

  const handleCheck = () => {
    let correct = 0;
    for (const label of block.labels) {
      const p = placed[label.id];
      if (p) {
        const zone = label.correctZone;
        if (p.x >= zone.x && p.x <= zone.x + zone.width && p.y >= zone.y && p.y <= zone.y + zone.height) {
          correct++;
        }
      }
    }
    const s = correct / block.labels.length;
    setScore(s);
    setChecked(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.title}</h3>
      <p className="text-[#6B7280] text-center">{block.description}</p>

      {/* Diagram area */}
      <div className="relative bg-white rounded-2xl border-2 border-[#E5E2DA] overflow-hidden mx-auto" style={{ width: 500, height: 350 }}>
        <DiagramRenderer elements={block.diagramElements} width={500} height={300} />

        {/* Drop zones */}
        {block.labels.map((label) => (
          <div
            key={label.id}
            className="absolute border-2 border-dashed border-[#A8D08D] rounded-lg"
            style={{
              left: label.correctZone.x,
              top: label.correctZone.y,
              width: label.correctZone.width,
              height: label.correctZone.height,
            }}
          />
        ))}
      </div>

      {/* Labels to place */}
      <div className="flex flex-wrap gap-2 justify-center">
        {block.labels.map((label) => (
          <button
            key={label.id}
            onClick={() => {
              if (!checked) {
                const zone = label.correctZone;
                setPlaced((prev) => ({
                  ...prev,
                  [label.id]: { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 },
                }));
              }
            }}
            className={cn(
              "px-4 py-2 rounded-xl font-medium text-sm transition-all",
              placed[label.id]
                ? "bg-[#4F7C57] text-white"
                : "bg-[#DDEED5] text-[#4F7C57] hover:bg-[#A8D08D]"
            )}
          >
            {label.text} {placed[label.id] ? "✓" : ""}
          </button>
        ))}
      </div>

      {!checked ? (
        <div className="flex justify-center">
          <Button
            onClick={handleCheck}
            disabled={Object.keys(placed).length < block.labels.length}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
          >
            Check My Labels!
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-[#2F2F2F]">
            {score >= 0.8 ? "Great job! 🎋" : score >= 0.5 ? "Good try! 👍" : "Keep practicing! 🌱"}
          </p>
          <p className="text-[#6B7280]">{Math.round(score * 100)}% correct</p>
          <Button
            onClick={() => onComplete({
              blockIndex: 0,
              blockType: "label_parts",
              completed: true,
              score,
              timeSpentMs: Date.now() - startTime.current,
              hintsUsed: 0,
              attempts: 1,
              wasCorrect: score >= 0.8,
            })}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
          >
            Continue <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

function MultipleChoiceRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "multiple_choice" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <QuizCard
      question={block.question}
      options={block.options}
      correctIndex={block.correctIndex}
      explanation={block.explanation}
      subject={block.subject}
      onAnswer={(correct) => {
        setTimeout(() => {
          onComplete({
            blockIndex: 0,
            blockType: "multiple_choice",
            completed: true,
            score: correct ? 1 : 0,
            timeSpentMs: Date.now() - startTime.current,
            hintsUsed: 0,
            attempts: 1,
            wasCorrect: correct,
          });
        }, 2000);
      }}
    />
  );
}

function ShortAnswerRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "short_answer" }>; onComplete: (result: BlockResult) => void }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const startTime = useRef(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    const correct = block.acceptedAnswers.some(
      (a) => a.toLowerCase().trim() === answer.toLowerCase().trim()
    );
    setIsCorrect(correct);
    setSubmitted(true);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.question}</h3>

      {block.hint && !submitted && (
        <div className="text-center">
          {showHint ? (
            <p className="text-[#F4C95D] bg-yellow-50 rounded-xl px-4 py-2 inline-block">
              💡 {block.hint}
            </p>
          ) : (
            <button
              onClick={() => { setShowHint(true); setHintsUsed(1); }}
              className="text-sm text-[#6B7280] hover:text-[#4F7C57]"
            >
              <Lightbulb size={14} className="inline mr-1" /> Need a hint?
            </button>
          )}
        </div>
      )}

      {!submitted ? (
        <div className="space-y-4">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && answer.trim() && handleSubmit()}
            placeholder="Type your answer..."
            className="w-full px-5 py-4 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-lg text-center outline-none"
            autoFocus
          />
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-8 py-5"
            >
              Check Answer
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-lg font-bold",
            isCorrect ? "bg-[#DDEED5] text-[#4F7C57]" : "bg-orange-50 text-orange-600"
          )}>
            {isCorrect ? <><CheckCircle size={22} /> Correct!</> : <><XCircle size={22} /> Not quite</>}
          </div>
          {!isCorrect && block.explanation && (
            <p className="text-[#6B7280]">{block.explanation}</p>
          )}
          {!isCorrect && (
            <p className="text-[#6B7280]">The answer is: <strong>{block.acceptedAnswers[0]}</strong></p>
          )}
          <Button
            onClick={() => onComplete({
              blockIndex: 0,
              blockType: "short_answer",
              completed: true,
              score: isCorrect ? 1 : 0,
              timeSpentMs: Date.now() - startTime.current,
              hintsUsed,
              attempts: 1,
              wasCorrect: isCorrect,
            })}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
          >
            Continue <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

function ReadingPassageRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "reading_passage" }>; onComplete: (result: BlockResult) => void }) {
  const [questionIdx, setQuestionIdx] = useState(-1); // -1 = reading, then questions
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const startTime = useRef(Date.now());

  const questions = block.followUpQuestions || [];

  if (questionIdx === -1) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.title}</h3>
        <div className="bg-white rounded-2xl border-2 border-[#E5E2DA] p-6">
          <p className="text-lg text-[#2F2F2F] leading-relaxed whitespace-pre-line">{block.passage}</p>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => questions.length > 0 ? setQuestionIdx(0) : onComplete({
              blockIndex: 0, blockType: "reading_passage", completed: true, score: 1,
              timeSpentMs: Date.now() - startTime.current, hintsUsed: 0, attempts: 1, wasCorrect: true,
            })}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg px-8 py-5 rounded-2xl"
          >
            {questions.length > 0 ? "Answer Questions" : "Continue"} <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    );
  }

  if (questionIdx >= questions.length) {
    const finalScore = answered > 0 ? score / answered : 0;
    return (
      <div className="text-center space-y-4 max-w-lg mx-auto">
        <p className="text-2xl font-bold text-[#2F2F2F]">
          {finalScore >= 0.8 ? "Excellent reading! 📖" : finalScore >= 0.5 ? "Good effort! 👍" : "Keep practicing! 🌱"}
        </p>
        <p className="text-[#6B7280]">{score} out of {answered} correct</p>
        <Button
          onClick={() => onComplete({
            blockIndex: 0, blockType: "reading_passage", completed: true, score: finalScore,
            timeSpentMs: Date.now() - startTime.current, hintsUsed: 0, attempts: 1, wasCorrect: finalScore >= 0.5,
          })}
          className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
        >
          Continue <ChevronRight size={16} />
        </Button>
      </div>
    );
  }

  const q = questions[questionIdx];
  return (
    <QuizCard
      question={q.question}
      options={q.options}
      correctIndex={q.correctIndex}
      explanation={q.explanation}
      onAnswer={(correct) => {
        if (correct) setScore((s) => s + 1);
        setAnswered((a) => a + 1);
        setTimeout(() => setQuestionIdx((i) => i + 1), 1800);
      }}
    />
  );
}

function WritingPromptRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "writing_prompt" }>; onComplete: (result: BlockResult) => void }) {
  const [text, setText] = useState(block.starterSentence || "");
  const startTime = useRef(Date.now());
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = block.minWords || 10;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.prompt}</h3>
      {block.guidingQuestions && (
        <div className="bg-[#DDEED5] rounded-xl p-4 space-y-1">
          <p className="text-sm font-medium text-[#4F7C57]">Think about:</p>
          {block.guidingQuestions.map((q, i) => (
            <p key={i} className="text-sm text-[#2F2F2F]">• {q}</p>
          ))}
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing here..."
        className="w-full p-4 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-base min-h-[150px] outline-none resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-sm",
          wordCount >= minWords ? "text-[#4F7C57] font-medium" : "text-[#6B7280]"
        )}>
          {wordCount} word{wordCount !== 1 ? "s" : ""} {wordCount < minWords && `(aim for ${minWords}+)`}
        </span>
        <Button
          onClick={() => onComplete({
            blockIndex: 0, blockType: "writing_prompt", completed: true,
            score: wordCount >= minWords ? 1 : 0.5,
            timeSpentMs: Date.now() - startTime.current, hintsUsed: 0, attempts: 1,
            wasCorrect: wordCount >= minWords,
          })}
          disabled={wordCount < 3}
          className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
        >
          Done Writing! <CheckCircle size={16} />
        </Button>
      </div>
    </div>
  );
}

function RevisionRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "revision" }>; onComplete: (result: BlockResult) => void }) {
  const [revised, setRevised] = useState(block.original);
  const [submitted, setSubmitted] = useState(false);
  const startTime = useRef(Date.now());

  const isChanged = revised.trim() !== block.original.trim();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h3 className="text-xl font-bold text-[#2F2F2F] text-center">{block.title}</h3>
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
        <p className="text-sm font-medium text-orange-600">What to fix: {block.issue}</p>
      </div>
      {block.hint && (
        <p className="text-sm text-[#6B7280] text-center">💡 Hint: {block.hint}</p>
      )}
      <textarea
        value={revised}
        onChange={(e) => setRevised(e.target.value)}
        className="w-full p-4 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-base min-h-[100px] outline-none resize-none"
      />
      {!submitted ? (
        <div className="flex justify-center">
          <Button
            onClick={() => setSubmitted(true)}
            disabled={!isChanged}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-8 py-5"
          >
            Submit Revision
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold text-[#4F7C57]">Great revision work! ✏️</p>
          <Button
            onClick={() => onComplete({
              blockIndex: 0, blockType: "revision", completed: true, score: isChanged ? 1 : 0.5,
              timeSpentMs: Date.now() - startTime.current, hintsUsed: 0, attempts: 1, wasCorrect: isChanged,
            })}
            className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-6 py-5"
          >
            Continue <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

function HintRenderer({ block, onNext }: { block: Extract<ActivityBlock, { type: "hint" }>; onNext: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-4">
      <div className="bg-[#F4C95D]/10 rounded-2xl p-6 border-2 border-[#F4C95D]/30">
        {block.visual && <div className="text-4xl mb-3">{block.visual}</div>}
        <p className="text-lg text-[#2F2F2F]">{block.content}</p>
      </div>
      <Button onClick={onNext} className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-8 py-5">
        Got it! <ChevronRight size={18} />
      </Button>
    </div>
  );
}

function CelebrationRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "celebration" }>; stats?: { correct: number; total: number }; onComplete: () => void }) {
  return (
    <div className="text-center space-y-6 max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-7xl"
      >
        🎉
      </motion.div>
      <h2 className="text-3xl font-bold text-[#2F2F2F]">{block.message}</h2>
      {block.stats && block.stats.total > 0 && (
        <div className="flex justify-center gap-6">
          <div className="bg-[#DDEED5] rounded-2xl px-6 py-4">
            <p className="text-3xl font-bold text-[#4F7C57]">{block.stats.correct}/{block.stats.total}</p>
            <p className="text-sm text-[#6B7280]">Correct</p>
          </div>
          {block.stats.timeSeconds && (
            <div className="bg-[#F4C95D]/20 rounded-2xl px-6 py-4">
              <p className="text-3xl font-bold text-[#F4C95D]">{Math.round(block.stats.timeSeconds / 60)}m</p>
              <p className="text-sm text-[#6B7280]">Time</p>
            </div>
          )}
        </div>
      )}
      {block.achievement && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#F4C95D]/20 rounded-2xl px-6 py-3"
        >
          <Star size={20} className="text-[#F4C95D]" />
          <span className="font-bold text-[#2F2F2F]">{block.achievement}</span>
        </motion.div>
      )}
      <Button onClick={onComplete} className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg px-10 py-6 rounded-2xl">
        Finish Lesson
      </Button>
    </div>
  );
}

function RecapRenderer({ block, onNext }: { block: Extract<ActivityBlock, { type: "recap" }>; onNext: () => void }) {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-[#2F2F2F] text-center">{block.title}</h3>
      <div className="bg-[#DDEED5] rounded-2xl p-6 space-y-3">
        {block.keyPoints.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-start gap-3"
          >
            <span className="w-6 h-6 rounded-full bg-[#4F7C57] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-[#2F2F2F]">{point}</span>
          </motion.div>
        ))}
      </div>
      {block.nextSteps && (
        <div className="bg-[#F7F5EF] rounded-xl p-4">
          <p className="text-sm font-medium text-[#6B7280] mb-2">Next steps:</p>
          {block.nextSteps.map((step, i) => (
            <p key={i} className="text-sm text-[#2F2F2F]">→ {step}</p>
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <Button onClick={onNext} className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl px-8 py-5">
          Next <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function MatchBlockRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "match" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <MatchingGame
      title={block.title}
      pairs={block.pairs}
      onComplete={(score) => {
        onComplete({
          blockIndex: 0, blockType: "match", completed: true,
          score: score / 100, timeSpentMs: Date.now() - startTime.current,
          hintsUsed: 0, attempts: 1, wasCorrect: score >= 70,
        });
      }}
    />
  );
}

function SequenceBlockRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "sequence" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <SequenceOrder
      title={block.title}
      items={block.items}
      correctOrder={block.correctOrder}
      onComplete={(correct) => {
        onComplete({
          blockIndex: 0, blockType: "sequence", completed: true,
          score: correct ? 1 : 0, timeSpentMs: Date.now() - startTime.current,
          hintsUsed: 0, attempts: 1, wasCorrect: correct,
        });
      }}
    />
  );
}

function FillBlankRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "fill_blank" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <FillInTheBlank
      title={block.title}
      sentences={block.sentences}
      onComplete={(results) => {
        const correct = results.filter((r) => r.correct).length;
        const score = correct / results.length;
        onComplete({
          blockIndex: 0, blockType: "fill_blank", completed: true,
          score, timeSpentMs: Date.now() - startTime.current,
          hintsUsed: 0, attempts: 1, wasCorrect: score >= 0.5,
        });
      }}
    />
  );
}

function SpellingBlockRenderer({ block, onComplete }: { block: Extract<ActivityBlock, { type: "spelling" }>; onComplete: (result: BlockResult) => void }) {
  const startTime = useRef(Date.now());
  return (
    <SpellingPractice
      words={block.words}
      onComplete={(results) => {
        const correct = results.filter((r) => r.correct).length;
        const score = correct / results.length;
        onComplete({
          blockIndex: 0, blockType: "spelling", completed: true,
          score, timeSpentMs: Date.now() - startTime.current,
          hintsUsed: 0, attempts: 1, wasCorrect: score >= 0.5,
        });
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════
// Main LessonPlayer
// ══════════════════════════════════════════════════════════════

export function LessonPlayer({
  lesson,
  profileId,
  sessionId,
  onComplete,
  onExit,
}: {
  lesson: LessonDefinition;
  profileId: string;
  sessionId: string;
  onComplete: (state: LessonState) => void;
  onExit: () => void;
}) {
  const [state, setState] = useState<LessonState>(() =>
    createLessonState(lesson.id, profileId, sessionId)
  );

  const currentBlock = lesson.blocks[state.currentBlockIndex];
  const progress = ((state.currentBlockIndex) / lesson.blocks.length) * 100;
  const isLastBlock = state.currentBlockIndex >= lesson.blocks.length - 1;

  const advanceBlock = useCallback(() => {
    if (isLastBlock) {
      const final = completeLessonState(state);
      setState(final);
      onComplete(final);
    } else {
      setState((prev) => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex + 1,
      }));
    }
  }, [isLastBlock, state, onComplete]);

  const handleBlockResult = useCallback((result: BlockResult) => {
    result.blockIndex = state.currentBlockIndex;
    const updated = recordBlockResult(state, result);
    setState(updated);

    // Small delay before advancing for scored blocks
    if (result.score !== undefined) {
      setTimeout(() => {
        if (updated.currentBlockIndex >= lesson.blocks.length) {
          const final = completeLessonState(updated);
          setState(final);
          onComplete(final);
        }
      }, 500);
    }
  }, [state, lesson.blocks.length, onComplete]);

  if (!currentBlock) {
    const final = completeLessonState(state);
    onComplete(final);
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F7F5EF]/90 backdrop-blur-sm px-4 py-3 border-b border-[#E5E2DA]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={onExit} className="text-[#6B7280] hover:text-[#2F2F2F] p-1">
              <X size={20} />
            </button>
            <h2 className="font-bold text-[#2F2F2F] truncate mx-4">{lesson.title}</h2>
            <span className="text-sm text-[#6B7280] whitespace-nowrap">
              {state.currentBlockIndex + 1}/{lesson.blocks.length}
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2 rounded-full bg-[#E5E2DA] [&>div]:bg-[#4F7C57] [&>div]:rounded-full"
          />
        </div>
      </div>

      {/* Block content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentBlockIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderBlock(currentBlock, advanceBlock, handleBlockResult)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function renderBlock(
  block: ActivityBlock,
  onNext: () => void,
  onComplete: (result: BlockResult) => void,
) {
  switch (block.type) {
    case "explanation":
      return <ExplanationRenderer block={block} onNext={onNext} />;
    case "diagram":
      return <DiagramBlockRenderer block={block} onNext={onNext} />;
    case "drawing":
      return <DrawingBlockRenderer block={block} onComplete={onComplete} />;
    case "label_parts":
      return <LabelPartsRenderer block={block} onComplete={onComplete} />;
    case "multiple_choice":
      return <MultipleChoiceRenderer block={block} onComplete={onComplete} />;
    case "short_answer":
      return <ShortAnswerRenderer block={block} onComplete={onComplete} />;
    case "reading_passage":
      return <ReadingPassageRenderer block={block} onComplete={onComplete} />;
    case "writing_prompt":
      return <WritingPromptRenderer block={block} onComplete={onComplete} />;
    case "revision":
      return <RevisionRenderer block={block} onComplete={onComplete} />;
    case "match":
      return <MatchBlockRenderer block={block} onComplete={onComplete} />;
    case "sequence":
      return <SequenceBlockRenderer block={block} onComplete={onComplete} />;
    case "fill_blank":
      return <FillBlankRenderer block={block} onComplete={onComplete} />;
    case "spelling":
      return <SpellingBlockRenderer block={block} onComplete={onComplete} />;
    case "hint":
      return <HintRenderer block={block} onNext={onNext} />;
    case "celebration":
      return <CelebrationRenderer block={block} onComplete={onNext} />;
    case "recap":
      return <RecapRenderer block={block} onNext={onNext} />;
    default:
      return (
        <div className="text-center">
          <p className="text-[#6B7280]">Unknown block type</p>
          <Button onClick={onNext}>Skip</Button>
        </div>
      );
  }
}
