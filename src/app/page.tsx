"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Palette, Brain, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

function FloatingLeaf({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute text-[#A8D08D] pointer-events-none select-none"
      style={{ left: `${x}%`, top: -20, fontSize: size }}
      animate={{
        y: ["0vh", "105vh"],
        x: [0, 30, -20, 40, 0],
        rotate: [0, 90, 180, 270, 360],
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      🍃
    </motion.div>
  );
}

const features = [
  {
    icon: <Brain className="text-[#4F7C57]" size={28} />,
    title: "Adaptive Learning",
    desc: "Panda adjusts to your child's pace, level, and interests automatically.",
    color: "bg-[#DDEED5]",
  },
  {
    icon: <Palette className="text-[#F4C95D]" size={28} />,
    title: "Interactive Activities",
    desc: "Drawing, quizzes, matching games, diagrams, and more!",
    color: "bg-yellow-50",
  },
  {
    icon: <BookOpen className="text-[#87CEEB]" size={28} />,
    title: "All Subjects",
    desc: "Math, reading, writing, science, social studies, and creative arts.",
    color: "bg-blue-50",
  },
  {
    icon: <Shield className="text-[#C4B5E0]" size={28} />,
    title: "Safe & Private",
    desc: "All data stays on your computer. No cloud, no tracking, no ads.",
    color: "bg-purple-50",
  },
];

export default function HomePage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => setHasProfile(!!data?.id))
      .catch(() => setHasProfile(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5EF] overflow-hidden relative">
      {/* Floating leaves background */}
      {[10, 25, 45, 60, 75, 90].map((x, i) => (
        <FloatingLeaf key={i} delay={i * 2} x={x} size={16 + i * 2} />
      ))}

      {/* Hero section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 md:pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-[#4F7C57] flex items-center justify-center text-6xl md:text-7xl shadow-xl mx-auto">
              🐼
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-extrabold text-[#2F2F2F] mb-4"
          >
            Meet <span className="text-[#4F7C57]">Panda</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-[#6B7280] max-w-2xl mx-auto mb-8"
          >
            Your friendly AI tutor who makes learning fun, personal, and magical!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {hasProfile === null ? (
              <div className="w-48 h-14 rounded-2xl bg-[#DDEED5] animate-pulse" />
            ) : hasProfile ? (
              <>
                <Link href="/learn">
                  <Button className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-xl px-10 py-7 rounded-2xl shadow-lg">
                    Continue Learning
                    <ArrowRight size={22} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/lessons">
                  <Button
                    variant="outline"
                    className="text-[#4F7C57] border-[#4F7C57] text-lg px-8 py-6 rounded-2xl"
                  >
                    Browse Lessons
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/onboarding">
                <Button className="bg-[#4F7C57] hover:bg-[#3d6345] text-white text-xl px-10 py-7 rounded-2xl shadow-lg">
                  <Sparkles size={22} className="mr-2" />
                  Start Learning
                </Button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-[#6B7280]">
            🔒 100% local &amp; private. No data leaves your computer. No accounts needed.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-20"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border-2 border-[#E5E2DA] shadow-sm"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#2F2F2F] mb-2">{feature.title}</h3>
              <p className="text-[#6B7280]">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-20 bg-white rounded-3xl border-2 border-[#E5E2DA] shadow-lg overflow-hidden"
        >
          <div className="bg-[#4F7C57] px-6 py-4">
            <h3 className="text-white font-bold text-lg">A day with Panda</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4F7C57] flex items-center justify-center text-white text-lg flex-shrink-0">
                🐼
              </div>
              <div className="bg-[#DDEED5] rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                <p className="text-[#2F2F2F]">
                  Hey there! Want to explore fractions today? I know you love pizza,
                  so let&apos;s slice some up! 🍕
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-[#4F7C57] text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-md">
                <p>Yes! Can we use dinosaurs instead? 🦕</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4F7C57] flex items-center justify-center text-white text-lg flex-shrink-0">
                🐼
              </div>
              <div className="bg-[#DDEED5] rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
                <p className="text-[#2F2F2F]">
                  Dinosaur fractions? I love it! 🦕 Imagine a T-Rex found 8 bones, and
                  ate half of them. How many bones is that?
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap mt-4">
              <div className="px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-sm font-medium text-yellow-700">
                🎮 Matching Game
              </div>
              <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                📊 Visual Diagram
              </div>
              <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-sm font-medium text-purple-700">
                ✏️ Drawing Challenge
              </div>
              <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-700">
                📝 Quick Quiz
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bamboo footer decoration */}
        <div className="mt-20 flex justify-center gap-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.6 }}
              style={{ originY: 1 }}
              className="w-3 bg-[#A8D08D] rounded-t-full"
              aria-hidden
            >
              <div style={{ height: 40 + i * 15 }} />
            </motion.div>
          ))}
        </div>

        <footer className="text-center mt-10 pb-8">
          <p className="text-sm text-[#6B7280]">
            Made with 💚 for curious kids everywhere
          </p>
        </footer>
      </div>
    </div>
  );
}
