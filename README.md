# Personal Capability OS

A private, single-user daily reflection and capability tracking tool. Designed to feel like a **personal field notebook or ship's log**, intentionally moving away from the aesthetic of traditional, dense SaaS admin dashboards.

## Overview

Personal Capability OS is built to help track daily capability development, document engineering decisions, analyze bottlenecks, and trace technical evolution over time through a calm, intentional, and distraction-free interface.

### Key Features
- **Daily Reflection Logging:** Record and bound technical insights to specific dates.
- **Capability Timelines:** Review historic capabilities and how they've progressed over time.
- **Calm, High-Contrast UI:** Built with a custom, tailored color palette focusing on deep charcoal backgrounds, soft muted brass accents, and serif typography (Fraunces + Inter) for improved readability and focus.
- **Strict Evidence Boundaries:** Backfill validation preventing distorted chronological tracking.

## Architecture & Tech Stack

This project is structured as a fullstack monorepo featuring:

- **Frontend:** Next.js 14 (App Router) + React
- **Styling:** TailwindCSS (Custom configuration avoiding standard SaaS utility visual tropes)
- **Backend:** Express API
- **Database:** PostgreSQL (with Prisma ORM)
- **End-to-End Testing:** Playwright
- **Unit Testing:** Vitest

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (Ensure a database is running and accessible)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the root based on `.env.example` if provided, or simply ensure your database URL is set:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/capability_os"
   ```

3. Initialize the database:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

### Running the Application

To run both the backend API and Next.js frontend concurrently spanning the monorepo:

```bash
npm run dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000) and route API endpoints over to the Express layer.

## Design Philosophy

The aesthetic of this application explicitly avoids standard utility UI paradigms:
- **No pure blacks or whites.** (Uses `#16151A` background and `#EDEAE3` text).
- **No bright, saturated accents for multiple purposes.** (Uses a muted brass/ochre `#C9A26D`).
- **No heavy drop shadows.** (UI relies on flat, subtle hairlines layered against flat matte backgrounds).
- **Typography comes first.** (Fraunces for display weights, Inter for body and metadata).

## Scripts Reference

- `npm run dev`: Starts concurrently.
- `npm run dev:api`: Starts only the API workspace.
- `npm run dev:web`: Starts only the Next.js workspace.
- `npm run build`: Type-checks and builds both packages.
- `npm run test`: Runs Vitest suite.
- `npm run test:e2e`: Runs Playwright test suite.

---

*Designed for clarity, focus, and quiet reflection.*
