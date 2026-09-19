# Karsh

### A Personal Capability OS for deliberate self-development.

> **Live. Observe. Diagnose. Intervene. Practice. Measure. Update. Repeat.**

Karsh is a private, single-user system designed to help you understand how you operate, deliberately improve your capabilities, and build an evidence-backed record of that improvement over time.

It is not a habit tracker, productivity dashboard, mood journal, or AI coach.

**Karsh is a personal laboratory.**

It turns experiences from real life into structured evidence, uses periodic external AI evaluation to identify patterns and capability changes, and feeds those insights back into the next cycle of deliberate experimentation.

---

## The Core Loop

```text
LIVE
  ↓
OBSERVE
  ↓
DIAGNOSE
  ↓
INTERVENE
  ↓
PRACTICE
  ↓
MEASURE
  ↓
UPDATE
  ↓
REPEAT
```

### 1. Live
Go live your life. Work, learn, build, make decisions, talk to people, fail, succeed, and experiment.

### 2. Observe
When something meaningful happens, record it: a difficult problem, mistake, decision, learning, communication failure, successful experiment, realization, or recurring pattern.

### 3. Diagnose
Over time, individual events reveal patterns. Instead of "I am bad at system design," you might discover that you repeatedly start designing components before clarifying requirements and constraints.

### 4. Intervene
Turn the diagnosis into an intentional change.

### 5. Practice
Apply the intervention in real life.

### 6. Measure
Record what happened and whether the intervention helped.

### 7. Update
Periodically reassess capabilities using accumulated evidence.

---

## What You Actually Do in Karsh

Something meaningful happens → open Karsh → **Record something**.

You can create multiple entries on the same day and record something that happened on a previous day within your configured backfill window.

If nothing meaningful happened, do nothing.

A zero-entry day is completely valid.

Karsh deliberately has no:

- Streaks
- Missed-day penalties
- Daily completion scores
- "You failed to journal" messages
- Productivity guilt

The system measures capability development, not journaling discipline.

---

## The Evidence Model

A reflection entry captures what actually happened.

Typical fields include:

- Occurrence date
- Optional occurrence time
- Context
- Intent
- Outcome
- What went well
- Where you struggled
- Why you think it happened
- What you learned
- What you will change
- Tags

The distinction between **when something happened** and **when it was recorded** is intentional.

```text
Event happened:   September 12
Recorded:         September 15
```

Karsh preserves both dates.

### Multiple Entries Per Day

Karsh treats **events**, not days, as the unit of evidence.

```text
09:30  Solved a difficult debugging problem
14:00  Made an architectural mistake
18:00  Discovered why the mistake happened
22:00  Learned a new debugging technique
```

All four can be recorded independently.

---

## Calendar

The Calendar provides a temporal view of your evidence.

It answers:

> **"When did things happen?"**

Dates containing evidence are visually indicated. Empty dates are simply empty; they are not failures.

---

## Timeline

The Timeline provides the chronological view.

It answers:

> **"What has actually happened over time?"**

Entries are ordered by occurrence date and optional occurrence time. Backfilled entries preserve their original occurrence date while showing that they were recorded later.

---

## Experiments

Experiments turn observations into deliberate interventions.

```text
Problem
    ↓
Hypothesis
    ↓
Intervention
    ↓
Measurement
    ↓
Result
    ↓
Lesson
    ↓
Next action
```

### Example

**Problem:** I tend to lose track of system-level dependencies while debugging.

**Hypothesis:** Mapping the dependency chain before debugging will reduce root-cause discovery time.

**Intervention:** Draw the request/event flow before touching implementation.

**Measurement:** Time taken to identify the root cause.

**Result:** Compare against previous debugging sessions.

Experiments can be linked to the reflection entries generated while running them.

---

## Decisions

Important decisions are recorded separately from ordinary reflections.

A decision can contain:

- Context
- Options
- Chosen option
- Reasoning
- Trade-offs
- Assumptions
- Expected outcome
- Confidence
- Actual outcome
- Lesson

The important distinction is:

```text
What I believed would happen
            ↓
What actually happened
```

Over time, this can reveal how you make decisions under uncertainty.

---

## Learning Records

Learning records capture knowledge worth preserving:

- Topic
- Source/reference
- What you learned
- Your explanation
- How you can apply it
- Unresolved questions

The important transition is:

```text
Information
    ↓
Understanding
    ↓
Application
    ↓
Real-world evidence
```

---

## Reviews

Karsh operates at multiple timescales.

| Timescale | Question | Record |
|---|---|---|
| Daily | What happened? | Reflection entries |
| Weekly | What patterns appeared? | Weekly review |
| Monthly | What changed? | Monthly review |
| Periodically | What does the evidence suggest about my capabilities? | Capability assessment |

```text
Events
  ↓
Evidence
  ↓
Weekly patterns
  ↓
Monthly patterns
  ↓
Capability assessment
  ↓
New intervention
```

---

## Capability Model

Karsh organizes development into five broad levels.

### Level 1 — Machine

- Metacognition
- Self-regulation
- Learning agility

### Level 2 — Intelligence

- General reasoning
- Mental models
- Systems thinking

### Level 3 — Influence

- Communication
- Social insight
- Persuasion
- Negotiation
- Leadership

### Level 4 — Domain

Initially:

- Software / backend engineering

### Level 5 — Leverage

- Strategy
- Opportunity recognition
- Resource acquisition
- Scalable output

---

## AI-Assisted Capability Assessment

Karsh intentionally does **not** call an LLM API internally in the MVP.

Instead:

```text
Karsh
  ↓
Prepare evidence package
  ↓
Copy
  ↓
ChatGPT / Claude / Gemini / other LLM
  ↓
External evaluation
  ↓
Structured JSON
  ↓
Paste into Karsh
  ↓
Validate
  ↓
Preview
  ↓
Confirm
  ↓
Store assessment
```

This keeps the application inexpensive, model-independent, transparent, and under human control.

### Preparing an AI Review

Karsh generates a structured review package for a selected date range. It can include:

- Reflection entries
- Experiments
- Decisions
- Learning records
- Reviews
- Existing capability history

### Importing an AI Assessment

When the external AI returns its structured assessment, paste it into Karsh.

The application:

1. Parses the response
2. Validates its structure
3. Validates capability names
4. Validates score ranges
5. Displays a preview
6. Shows changes from previous assessments
7. Lets you confirm the import
8. Stores the assessment

AI assessments are append-only.

---

## The Most Important Principle

**Karsh does not calculate your capability score.**

It collects and organizes evidence.

The external evaluator interprets that evidence.

Karsh stores the resulting assessment.

---

## Complete System

```text
                       YOUR LIFE
                           │
                           ▼
                    ┌─────────────┐
                    │   Capture   │
                    │ Reflections │
                    └──────┬──────┘
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
        Experiments     Decisions      Learning
             │             │              │
             └─────────────┼──────────────┘
                           ▼
                     ┌───────────┐
                     │  Reviews  │
                     │   W / M   │
                     └─────┬─────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Prepare Evidence│
                  │   for External  │
                  │       AI        │
                  └────────┬────────┘
                           │
                           ▼
                    External LLM
                           │
                           ▼
                  Capability Assessment
                           │
                           ▼
                  ┌──────────────────┐
                  │ Capability State │
                  │    & History     │
                  └────────┬─────────┘
                           │
                           ▼
                    Current Bottleneck
                           │
                           ▼
                     New Experiment
                           │
                           ▼
                       YOUR LIFE
                           │
                           └───────────────► ...
```

---

## Architecture

Karsh is a full-stack TypeScript monorepo.

```text
karsh/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # Express REST API
│
├── packages/
│   └── shared-types/        # Shared TypeScript + Zod contracts
│
└── docs/
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Authentication | Argon2 + HTTP-only JWT session |
| Testing | Vitest / Playwright |
| Hosting | Vercel + managed backend/database |

---

## Core Data Model

```text
User
UserSettings

ReflectionEntry
Tag
EntryTag

Experiment
ExperimentEntryLink

Decision
LearningRecord

WeeklyReview
MonthlyReview

Capability
AIPromptVersion
AIAssessment
CapabilityAssessment
```

Every user-owned record is scoped to the user, while capability assessments remain append-only for historical integrity.

---

## Design Philosophy

Karsh deliberately avoids the visual language of conventional productivity software.

It is designed to feel more like:

> **a personal field notebook beneath a night sky**

than a SaaS analytics dashboard.

The intended visual language is:

- Calm
- Warm
- Quiet
- Intelligent
- Personal
- Focused
- Slightly mysterious

The design system uses warm charcoal surfaces, muted brass accents, warm off-white typography, and flat matte surfaces rather than bright dashboards, neon colors, or excessive cards.

---

## Product Principles

### Evidence over memory
Record what actually happened.

### Patterns over isolated events
A single event rarely defines a capability.

### Experiments over vague intentions
Turn observations into testable interventions.

### Capability over productivity
The goal is not to maximize activity. The goal is to become more capable.

### No artificial guilt
No streaks. No missed-day semantics. No productivity shame.

### Human-controlled AI
AI evaluates exported evidence; it does not silently control the system.

### Historical integrity
Old evidence and old assessments should remain understandable in their original context.

### Own your data
The entire dataset can be exported.

---

## Status

Karsh is a personal project focused on building the core evidence → assessment → capability loop.

The MVP prioritizes:

- Reliable evidence capture
- Historical integrity
- Experiments
- Decisions
- Learning
- Periodic reviews
- External AI assessment
- Capability history

over automation and gamification.

---

## Roadmap

Potential future directions:

- Richer capability visualizations
- Deeper experiment ↔ capability relationships
- Improved longitudinal analysis
- Better evidence retrieval
- Automated local analysis without external API dependency
- Optional AI integrations
- More sophisticated capability models
- Mobile/PWA improvements

Future automation should preserve the core principle:

> **The system should help you understand yourself better, not make decisions for you.**

---

## The North Star

The ultimate question Karsh is trying to answer is:

> **"How am I actually changing?"**

Not based purely on memory.

Not based purely on feelings.

Not based on a productivity score.

But through a growing body of evidence:

```text
Experiences
    +
Observations
    +
Experiments
    +
Decisions
    +
Learning
    +
Reviews
    +
Repeated assessments
          ↓
An evolving model of yourself
          ↓
Better interventions
          ↓
Better capability
          ↓
Better outcomes
```

Karsh is an attempt to build that loop deliberately.

---

## Built for one person.

## Built around evidence.

## Built for the long game.
