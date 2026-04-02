"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Sparkles, Star } from "lucide-react";
import { useRouter } from "next/navigation";

const SUBJECTS = ["Math", "Reading", "Writing", "Science", "Social Studies", "Art", "Music"];
const ANIMALS = ["Panda", "Dinosaur", "Cat", "Dog", "Dolphin", "Unicorn", "Dragon", "Rabbit", "Owl", "Tiger"];
const COLORS = [
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Teal", hex: "#14B8A6" },
];
const TOPICS = ["Dinosaurs", "Space", "Ocean", "Sports", "Art", "Nature", "Robots", "Animals", "Cooking", "Music", "History", "Coding"];
const GRADES = ["Pre-K", "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade"];

type OnboardingData = {
  name: string;
  nickname: string;
  age: string;
  grade: string;
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
  parent_notes: string;
  learning_support_needs: string;
  interests: string[];
  preferred_teaching_style: string;
};

const initialData: OnboardingData = {
  name: "",
  nickname: "",
  age: "",
  grade: "",
  favorite_subjects: [],
  least_favorite_subjects: [],
  reading_level: "medium",
  writing_confidence: "medium",
  math_confidence: "medium",
  attention_span: "medium",
  pace_preference: "medium",
  favorite_animals: [],
  favorite_colors: [],
  favorite_topics: [],
  goals: [],
  parent_notes: "",
  learning_support_needs: "",
  interests: [],
  preferred_teaching_style: "visual",
};

function OptionChip({
  label,
  selected,
  onClick,
  color,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-5 py-3 rounded-2xl text-base font-medium transition-all border-2",
        selected
          ? "bg-[#4F7C57] text-white border-[#4F7C57] shadow-md"
          : "bg-white text-[#2F2F2F] border-[#E5E2DA] hover:border-[#A8D08D]"
      )}
      style={color && selected ? { backgroundColor: color, borderColor: color } : undefined}
    >
      {label}
    </motion.button>
  );
}

function ColorChip({
  name,
  hex,
  selected,
  onClick,
}: {
  name: string;
  hex: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "w-16 h-16 rounded-2xl border-3 transition-all flex items-center justify-center",
        selected ? "border-[#2F2F2F] shadow-lg scale-110" : "border-transparent"
      )}
      style={{ backgroundColor: hex }}
    >
      {selected && <Star className="text-white drop-shadow-md" size={24} />}
    </motion.button>
  );
}

function LevelSelector({
  value,
  onChange,
  labels = ["Low", "Medium", "High"],
}: {
  value: string;
  onChange: (v: string) => void;
  labels?: string[];
}) {
  const levels = ["low", "medium", "high"];
  return (
    <div className="flex gap-3">
      {levels.map((level, i) => (
        <motion.button
          key={level}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(level)}
          className={cn(
            "flex-1 py-4 rounded-2xl text-base font-medium transition-all border-2",
            value === level
              ? "bg-[#4F7C57] text-white border-[#4F7C57]"
              : "bg-white text-[#2F2F2F] border-[#E5E2DA] hover:border-[#A8D08D]"
          )}
        >
          {labels[i]}
        </motion.button>
      ))}
    </div>
  );
}

function PandaReaction({ step }: { step: number }) {
  const reactions = [
    "Hi there! I'm Panda! What's your name?",
    "Nice to meet you! Tell me more about yourself!",
    "Awesome! What do you like to learn about?",
    "Great choices! What about things that aren't your favorite?",
    "I love learning about you! How do you feel about these?",
    "You're doing great! Almost done!",
    "Perfect! What are you into?",
    "Last step! Any notes for your parents to add?",
    "All done! Let's start learning together!",
  ];

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-8"
    >
      <div className="w-14 h-14 rounded-full bg-[#4F7C57] flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-md">
        🐼
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm border border-[#E5E2DA] max-w-md">
        <p className="text-[#2F2F2F] text-lg">{reactions[step] || "You're awesome!"}</p>
      </div>
    </motion.div>
  );
}

const STEPS = [
  "name",
  "about",
  "favorites",
  "least_favorites",
  "confidence",
  "learning_style",
  "interests",
  "parent_notes",
  "complete",
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleArrayItem = useCallback(
    (field: keyof OnboardingData, item: string) => {
      setData((prev) => {
        const arr = prev[field] as string[];
        return {
          ...prev,
          [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
        };
      });
    },
    []
  );

  const canAdvance = () => {
    switch (STEPS[step]) {
      case "name":
        return data.name.trim().length > 0;
      case "about":
        return data.age !== "" && data.grade !== "";
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          nickname: data.nickname || data.name,
          age: parseInt(data.age) || null,
          grade: data.grade,
          favorite_subjects: data.favorite_subjects,
          least_favorite_subjects: data.least_favorite_subjects,
          reading_level: data.reading_level,
          writing_confidence: data.writing_confidence,
          math_confidence: data.math_confidence,
          attention_span: data.attention_span,
          pace_preference: data.pace_preference,
          favorite_animals: data.favorite_animals,
          favorite_colors: data.favorite_colors,
          favorite_topics: data.favorite_topics,
          goals: data.goals,
          parent_notes: data.parent_notes,
          learning_support_needs: data.learning_support_needs,
          interests: data.interests,
          preferred_teaching_style: data.preferred_teaching_style,
        }),
      });
      if (res.ok) {
        router.push("/learn");
      }
    } catch {
      // Allow retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case "name":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">What&apos;s your name?</h2>
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Type your name here..."
              className="text-xl py-6 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white"
              autoFocus
            />
            <div>
              <p className="text-[#6B7280] mb-2">Got a nickname? (optional)</p>
              <Input
                value={data.nickname}
                onChange={(e) => setData({ ...data, nickname: e.target.value })}
                placeholder="What should Panda call you?"
                className="text-lg py-5 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white"
              />
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">Tell me about yourself!</h2>
            <div>
              <p className="text-[#6B7280] mb-3 text-lg">How old are you?</p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 12 }, (_, i) => i + 4).map((age) => (
                  <OptionChip
                    key={age}
                    label={String(age)}
                    selected={data.age === String(age)}
                    onClick={() => setData({ ...data, age: String(age) })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] mb-3 text-lg">What grade are you in?</p>
              <div className="flex gap-2 flex-wrap">
                {GRADES.map((grade) => (
                  <OptionChip
                    key={grade}
                    label={grade}
                    selected={data.grade === grade}
                    onClick={() => setData({ ...data, grade })}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "favorites":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">What do you love to learn?</h2>
            <p className="text-[#6B7280] text-lg">Pick as many as you want!</p>
            <div className="flex gap-3 flex-wrap">
              {SUBJECTS.map((subject) => (
                <OptionChip
                  key={subject}
                  label={subject}
                  selected={data.favorite_subjects.includes(subject)}
                  onClick={() => toggleArrayItem("favorite_subjects", subject)}
                />
              ))}
            </div>
          </div>
        );

      case "least_favorites":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">Any subjects that feel tricky?</h2>
            <p className="text-[#6B7280] text-lg">It&apos;s okay! Panda will help make them fun.</p>
            <div className="flex gap-3 flex-wrap">
              {SUBJECTS.map((subject) => (
                <OptionChip
                  key={subject}
                  label={subject}
                  selected={data.least_favorite_subjects.includes(subject)}
                  onClick={() => toggleArrayItem("least_favorite_subjects", subject)}
                />
              ))}
            </div>
          </div>
        );

      case "confidence":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">How do you feel about these?</h2>
            <div>
              <p className="text-lg font-medium text-[#2F2F2F] mb-3">Reading</p>
              <LevelSelector
                value={data.reading_level}
                onChange={(v) => setData({ ...data, reading_level: v })}
                labels={["Still learning", "Pretty good", "Love it!"]}
              />
            </div>
            <div>
              <p className="text-lg font-medium text-[#2F2F2F] mb-3">Writing</p>
              <LevelSelector
                value={data.writing_confidence}
                onChange={(v) => setData({ ...data, writing_confidence: v })}
                labels={["Still learning", "Pretty good", "Love it!"]}
              />
            </div>
            <div>
              <p className="text-lg font-medium text-[#2F2F2F] mb-3">Math</p>
              <LevelSelector
                value={data.math_confidence}
                onChange={(v) => setData({ ...data, math_confidence: v })}
                labels={["Still learning", "Pretty good", "Love it!"]}
              />
            </div>
            <div>
              <p className="text-lg font-medium text-[#2F2F2F] mb-3">How fast do you like to learn?</p>
              <LevelSelector
                value={data.pace_preference}
                onChange={(v) => setData({ ...data, pace_preference: v })}
                labels={["Nice & slow", "Just right", "Super fast!"]}
              />
            </div>
          </div>
        );

      case "learning_style":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">How do you learn best?</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "visual", label: "Pictures & Diagrams", emoji: "🎨" },
                { value: "story", label: "Stories & Examples", emoji: "📖" },
                { value: "interactive", label: "Games & Activities", emoji: "🎮" },
                { value: "step-by-step", label: "Step by Step", emoji: "📝" },
              ].map((style) => (
                <motion.button
                  key={style.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setData({ ...data, preferred_teaching_style: style.value })}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all",
                    data.preferred_teaching_style === style.value
                      ? "bg-[#DDEED5] border-[#4F7C57] shadow-md"
                      : "bg-white border-[#E5E2DA] hover:border-[#A8D08D]"
                  )}
                >
                  <span className="text-3xl block mb-2">{style.emoji}</span>
                  <span className="text-lg font-medium text-[#2F2F2F]">{style.label}</span>
                </motion.button>
              ))}
            </div>
            <div>
              <p className="text-lg font-medium text-[#2F2F2F] mb-3">Attention span</p>
              <LevelSelector
                value={data.attention_span}
                onChange={(v) => setData({ ...data, attention_span: v })}
                labels={["Short bursts", "Medium", "Long focus"]}
              />
            </div>
          </div>
        );

      case "interests":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">What are you into?</h2>
            <div>
              <p className="text-[#6B7280] text-lg mb-3">Favorite animals</p>
              <div className="flex gap-3 flex-wrap">
                {ANIMALS.map((animal) => (
                  <OptionChip
                    key={animal}
                    label={animal}
                    selected={data.favorite_animals.includes(animal)}
                    onClick={() => toggleArrayItem("favorite_animals", animal)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-lg mb-3">Favorite colors</p>
              <div className="flex gap-4 flex-wrap">
                {COLORS.map((c) => (
                  <ColorChip
                    key={c.name}
                    name={c.name}
                    hex={c.hex}
                    selected={data.favorite_colors.includes(c.name)}
                    onClick={() => toggleArrayItem("favorite_colors", c.name)}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-lg mb-3">Cool topics</p>
              <div className="flex gap-3 flex-wrap">
                {TOPICS.map((topic) => (
                  <OptionChip
                    key={topic}
                    label={topic}
                    selected={data.interests.includes(topic)}
                    onClick={() => toggleArrayItem("interests", topic)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "parent_notes":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2F2F2F]">Notes for parents</h2>
            <p className="text-[#6B7280] text-lg">
              Parents can add any helpful info here. This is totally optional!
            </p>
            <div>
              <p className="text-base font-medium text-[#2F2F2F] mb-2">Parent notes</p>
              <textarea
                value={data.parent_notes}
                onChange={(e) => setData({ ...data, parent_notes: e.target.value })}
                placeholder="Any learning goals, concerns, or things we should know..."
                className="w-full p-4 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-base min-h-[120px] outline-none resize-none"
              />
            </div>
            <div>
              <p className="text-base font-medium text-[#2F2F2F] mb-2">Learning support needs (optional)</p>
              <textarea
                value={data.learning_support_needs}
                onChange={(e) => setData({ ...data, learning_support_needs: e.target.value })}
                placeholder="IEP, ADHD, dyslexia, gifted, ESL, or any other support needs..."
                className="w-full p-4 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-base min-h-[100px] outline-none resize-none"
              />
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-8xl"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-[#2F2F2F]">
              You&apos;re all set, {data.nickname || data.name}!
            </h2>
            <p className="text-xl text-[#6B7280]">
              Panda is ready to learn with you. Let&apos;s go!
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-xl px-10 py-7 rounded-2xl shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      🐼
                    </motion.span>
                    Setting up...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Learning <Sparkles size={24} />
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-[#F7F5EF]/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-[#4F7C57]">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-[#E5E2DA] [&>div]:bg-[#4F7C57] [&>div]:rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="max-w-2xl w-full">
          <PandaReaction step={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {STEPS[step] !== "complete" && (
            <div className="flex justify-between mt-10">
              <Button
                variant="ghost"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="text-[#6B7280] text-lg py-6 px-6 rounded-2xl"
              >
                <ChevronLeft size={20} />
                Back
              </Button>
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-lg py-6 px-8 rounded-2xl shadow-md"
              >
                Next
                <ChevronRight size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
