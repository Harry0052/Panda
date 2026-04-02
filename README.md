# Panda - Your Friendly AI Tutor 🐼

A local-first adaptive AI tutor for children. Panda teaches through interactive lessons, games, drawing, quizzes, and personalized conversation — all running on your computer with no cloud dependencies.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your OpenAI API key
cp .env.example .env.local
# Edit .env.local and add your key: OPENAI_API_KEY=sk-...

# 3. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Requirements

- **Node.js** 18+ (recommended: 20+)
- **OpenAI API key** — get one at [platform.openai.com](https://platform.openai.com)

That's it. No database setup, no accounts, no cloud services.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for AI tutoring |

## Features

### For Kids
- **Adaptive AI tutor** — Panda adjusts difficulty, pace, and teaching style to each child
- **Interactive lessons** — matching games, quizzes, fill-in-the-blank, spelling, drawing, diagrams
- **Personalized content** — uses the child's interests (dinosaurs, space, sports, etc.) in examples
- **Encouragement-first** — celebrates effort and curiosity, never shames mistakes
- **Progress tracking** — streaks, achievements, bamboo growth, subject mastery
- **Fun UI** — panda theme with floating leaves, bamboo decorations, celebration animations

### For Parents
- **Parent dashboard** — see strengths, weak areas, engagement, and session history
- **100% private** — all data stored locally in SQLite, nothing leaves your computer
- **Accessibility** — dyslexia-friendly fonts, larger text, reduced motion, high contrast
- **Safe** — age-appropriate content, no mature themes, no pressure tactics

### Technical
- **Local SQLite database** — profiles, sessions, mastery data, achievements all stored in `data/panda.db`
- **Adaptive engine** — real proficiency/confidence tracking that shapes every AI response
- **Streaming chat** — real-time AI responses with Server-Sent Events
- **Tutorial system** — guided tours with spotlight overlays for first-time users

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── onboarding/        # Multi-step onboarding wizard
│   ├── learn/             # Chat-based learning interface
│   ├── dashboard/         # Progress dashboard (child + parent views)
│   ├── settings/          # Accessibility settings
│   └── api/               # API routes
│       ├── chat/          # AI chat with streaming
│       ├── profile/       # Student profile CRUD
│       ├── sessions/      # Learning session management
│       └── progress/      # Stats and achievements
├── components/
│   ├── panda/             # Theme components (mascot, leaves, bamboo, celebrations)
│   ├── onboarding/        # Onboarding wizard
│   ├── chat/              # Chat interface
│   ├── dashboard/         # Child and parent dashboards
│   ├── lessons/           # Interactive lesson components
│   ├── tutorial/          # Tutorial overlay system
│   ├── layout/            # App shell and navigation
│   └── ui/                # shadcn/ui base components
├── db/
│   ├── schema.ts          # Database schema and types
│   └── queries.ts         # All database operations
└── lib/
    ├── adaptive-engine.ts # AI adaptation logic
    └── utils.ts           # Utility functions
data/
└── panda.db              # SQLite database (auto-created on first run)
```

## Tech Stack

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** with custom Panda theme
- **shadcn/ui** component library
- **Framer Motion** for animations
- **better-sqlite3** for local data persistence
- **OpenAI API** (gpt-4o-mini) for AI tutoring

## How It Works

1. **Onboarding** — Child enters name, age, grade, interests, and learning preferences
2. **Adaptive Profile** — A learner model tracks proficiency, confidence, and patterns per subject
3. **Smart Tutoring** — Every AI response uses the child's full profile to adapt language, difficulty, and examples
4. **Progress Tracking** — Sessions, mastery data, streaks, and achievements persist locally
5. **Celebration** — Kids earn badges, grow bamboo, and see their learning journey visually

## License

Private project. All rights reserved.
