# Panda - Your Friendly AI Tutor 🐼

A local-first adaptive AI tutor for children. Panda teaches through interactive lessons, games, drawing, quizzes, and personalized conversation — all running on your computer with zero cloud dependencies.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your OpenAI API key
cp .env.example .env.local
# Edit .env.local and add your key: OPENAI_API_KEY=sk-...

# 3. (Optional) Seed a demo student profile
npm run seed

# 4. Run the app
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
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (gpt-4o-mini is used for cost efficiency) |

This is the only environment variable. All other data is local.

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Create a demo student (Luna, age 8) with realistic learning data |
| `npm run test:brain` | Run 44 assertions verifying the adaptive brain evolves correctly |

## Features

### For Kids
- **Adaptive AI tutor** — adjusts difficulty, pace, vocabulary, and teaching style per child
- **16 interactive lessons** — matching, quizzes, fill-in-the-blank, spelling, drawing, diagrams, sequencing, labeling
- **Personalized examples** — uses the child's interests (dinosaurs, space, sports) in explanations
- **Encouragement-first** — celebrates effort and curiosity, never shames mistakes
- **Progress tracking** — streaks, achievements, bamboo growth, subject mastery visualization
- **Playful UI** — panda theme with floating leaves, bamboo decorations, celebration animations
- **Tutorial system** — guided tours with spotlight overlays for first-time users

### For Parents
- **Parent dashboard** — strengths, weak areas, engagement trends, session history
- **100% private** — all data stored locally, nothing leaves your computer except AI chat requests
- **Data export/import** — backup and transfer learning data as JSON
- **Accessibility** — dyslexia-friendly fonts, larger text, reduced motion, high contrast
- **Safety** — age-appropriate content, emotional safety rules, no pressure tactics

### Adaptive Brain
- **Academic model** — per-subject/subtopic tracking: mastery, confidence, frustration risk, boredom risk, hint dependence, retention strength, misconceptions, format preferences
- **Communication model** — vocabulary tolerance, sentence length, format preferences (stories vs steps vs visuals), discovery style (guided vs direct), praise style
- **Engagement model** — task completion rates, dropout points, time-on-activity, per-format engagement scores
- **6 adaptation rules** — frustration→simplify, low confidence→reinforce, high mastery→challenge, boredom→switch format, misconception→targeted remediation, hint success→fade hints
- **Explainability** — every adaptation decision logged with reasoning for parent insight

## Architecture

### Project Structure

```
src/
├── app/                         # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── providers.tsx           # Error boundary + offline banner
│   ├── onboarding/page.tsx     # Multi-step onboarding wizard
│   ├── learn/page.tsx          # Chat-based learning
│   ├── lessons/page.tsx        # Interactive lesson browser + player
│   ├── dashboard/page.tsx      # Progress (child + parent views)
│   ├── settings/page.tsx       # Privacy, accessibility, export, reset
│   └── api/
│       ├── chat/route.ts       # Streaming AI chat (SSE)
│       ├── profile/route.ts    # Student profile CRUD
│       ├── sessions/route.ts   # Learning session management
│       ├── progress/route.ts   # Stats, achievements, suggested prompts
│       ├── lessons/route.ts    # Lesson recommendations + completion tracking
│       ├── interaction/route.ts # Record learning events for the brain
│       ├── brain/route.ts      # Diagnostics, context dump, adaptation history
│       └── data/route.ts       # Export, import, reset, storage stats
├── components/
│   ├── panda/                  # PandaMascot, FloatingLeaves, BambooDecor,
│   │                           # StarBurst, LeafConfetti, BambooProgress,
│   │                           # PandaSpeechBubble
│   ├── onboarding/             # OnboardingWizard (9-step flow)
│   ├── chat/                   # ChatInterface with streaming + quick actions
│   ├── dashboard/              # ChildDashboard, ParentDashboard
│   ├── lessons/                # LessonPlayer, DiagramRenderer,
│   │                           # MatchingGame, QuizCard, DrawingCanvas,
│   │                           # FillInTheBlank, SpellingPractice,
│   │                           # SequenceOrder, DiagramLabeler, StepByStep
│   ├── tutorial/               # TutorialOverlay with spotlight + progress
│   └── layout/                 # AppShell, ErrorBoundary, OfflineBanner
├── db/
│   ├── schema.ts               # 12 tables, types, bootstrap
│   └── queries.ts              # All database operations
├── lib/
│   ├── learner-brain.ts        # Deep adaptive engine (academic, communication,
│   │                           # engagement models, adaptation rules, context
│   │                           # assembly, explainability, diagnostics)
│   ├── panda-personality.ts    # Personality, tone, safety, response structures,
│   │                           # mistake reframing, output formatting
│   ├── adaptive-engine.ts      # Legacy adaptation (achievements, suggested prompts)
│   ├── lesson-schema.ts        # 16 activity block types, lesson state machine
│   ├── lesson-engine.ts        # Lesson selection, adaptation, progression
│   ├── lesson-packs.ts         # 16 curated lessons (math, reading, writing, science)
│   ├── local-storage.ts        # File storage, export/import, data reset, stats
│   └── utils.ts                # Tailwind class utility
scripts/
├── seed-learner.ts             # Creates demo student with realistic data
├── test-brain-evolution.ts     # 44 assertions testing brain evolution
├── verify-personalization.ts   # 30 checks on personalization + safety
└── dump-prompt.ts              # Dumps a sample system prompt for inspection
data/
├── panda.db                    # SQLite database (auto-created)
├── uploads/                    # Student file uploads
└── exports/                    # Data export files
```

### Key Architecture Decisions

1. **Local SQLite, not hosted DB** — better-sqlite3 gives synchronous, zero-config persistence. No migrations needed — schema bootstraps on first run.

2. **Direct OpenAI SDK, not AI SDK** — The app is local-only, never deployed to Vercel. Direct streaming gives full control over the SSE format and error handling.

3. **Three-layer learner model** — Academic (per-topic mastery), Communication (language preferences), and Engagement (behavioral patterns) models evolve independently and combine into a unified TutorContext for each response.

4. **Personality as code** — Panda's character, tone rules, safety constraints, and response structures are defined in `panda-personality.ts`, not hardcoded in the prompt. This makes the personality testable, versionable, and extensible.

5. **Lesson blocks, not lesson templates** — Lessons are composed from 16 reusable activity block types. The LessonPlayer renders any block sequence, making it trivial to add new lesson formats.

6. **Explainability built-in** — Every adaptation decision is logged with reasoning. The `/api/brain` endpoint lets parents (or developers) see exactly what Panda "thinks" about the child.

### Database Schema (12 tables)

| Table | Purpose |
|-------|---------|
| `profiles` | Student identity, preferences, interests |
| `learner_model` | Legacy per-subject proficiency tracking |
| `academic_model` | Deep per-subtopic mastery, frustration, boredom, hints, misconceptions |
| `communication_model` | Vocabulary, format, discovery style, praise preferences |
| `engagement_model` | Completion rates, dropout points, per-format engagement |
| `sessions` | Learning session metadata and topics |
| `messages` | Chat message history with adaptation metadata |
| `interaction_events` | Raw event log for brain updates |
| `adaptation_log` | Full audit trail of every adaptation decision |
| `achievements` | Earned badges and milestones |
| `streaks` | Daily streak, bamboo height, totals |
| `lesson_progress` | Per-lesson completion and scores |
| `accessibility_settings` | Dyslexia font, larger text, reduced motion, high contrast |

### Data Flow

```
User message
  → assembleTutorContext() — reads all 3 models + recent events + profile
  → buildDeepSystemPrompt() — personality + adaptation + learner state → ~3400 tokens
  → OpenAI gpt-4o-mini (streaming)
  → processInteraction() — updates academic, communication, engagement models
  → checkForAchievements() — awards milestones
  → Response streamed to UI via SSE
```

## Privacy

- All data stored in `data/panda.db` (local SQLite) and `data/uploads/` (local filesystem)
- The **only external connection** is to the OpenAI API when the child chats with Panda
- No accounts, no email, no cloud sync, no tracking, no analytics, no ads
- Full data export/import via Settings
- One-click data erasure via Settings

## Known Limitations

1. **No speech/audio** — text-only for now. Architecture supports adding TTS later.
2. **No image generation** — diagrams are rendered as HTML/SVG, not AI-generated images.
3. **No multi-child switching UI** — the app defaults to the first profile. Multiple profiles exist in the DB but there's no picker UI yet.
4. **Lesson content is static** — the 16 lesson packs are curated, not AI-generated on the fly. The engine supports dynamic lessons but generation isn't wired up yet.
5. **No spaced repetition scheduler** — retention decay is tracked but there's no automatic "time to review" notification system.
6. **Drawing evaluation is basic** — the canvas captures drawings but doesn't do computer vision analysis of what was drawn.
7. **Single device** — data lives on one machine. Export/import enables manual transfer but there's no sync.

## Suggested V2 Features

1. **AI-generated lessons** — use OpenAI to generate custom lesson blocks on the fly based on what the child needs
2. **Text-to-speech** — read Panda's responses aloud using Web Speech API or OpenAI TTS
3. **Speech-to-text input** — let younger kids speak their answers
4. **Multi-child profiles** — profile picker on the home screen, separate dashboards per child
5. **Spaced repetition alerts** — "It's been 3 days since you practiced fractions!" notifications
6. **AI-powered drawing feedback** — use vision models to gently evaluate drawings
7. **Parent weekly email digest** — local scheduled report of the child's learning summary
8. **Handwriting practice mode** — canvas-based letter/number tracing with stroke detection
9. **Collaborative mode** — parent and child do lessons together with role-based prompts
10. **Curriculum alignment** — map lessons to Common Core / state standards

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, shadcn/ui, Framer Motion |
| Database | SQLite via better-sqlite3 |
| AI | OpenAI API (gpt-4o-mini) |
| Runtime | Node.js 18+ |

## License

Private project. All rights reserved.
