# Personal Capability OS — UI Design System & Layout Specification

> **Target Audience**: AI coding agents, front-end engineers, and automated visual verification tools.  
> **Purpose**: Provides a complete, unambiguous blueprint of the exact UI layout, design tokens, component hierarchy, typography rules, color palettes, and page compositions for the **Personal Capability OS**.

---

## 1. Aesthetic Philosophy & Core Identity

- **Identity**: A private, single-user daily reflection tool and empirical capability journal (spiritually resembling a ship's log or personal field notebook).
- **Vibe**: Calm, warm charcoal, intelligent, quiet, focused, and personal.
- **Strict Anti-Patterns**:
  - **NOT** a SaaS admin dashboard.
  - **NOT** a uniform grid of identical bordered cards.
  - **NO** pure black backgrounds (`#000000`).
  - **NO** pure white body text (`#FFFFFF`).
  - **NO** ALL-CAPS uppercase text-transform or tracked-out labels anywhere.
  - **NO** drop shadows (`box-shadow: none` app-wide for flat, matte surfaces).
  - **NO** tech-stack or internal implementation string leakage in user-facing copy (e.g. no "PostgreSQL 15+", "Prisma ORM", or "Append-only" labels).

---

## 2. Design System Tokens & Color Palette

All surfaces, text colors, accents, and status indicators are defined via strict design tokens:

```css
:root {
  /* Surfaces */
  --bg: #16151A;              /* Page background — warm charcoal */
  --surface: #1D1C22;         /* Cards, active strips, quiet panels */
  --surface-raised: #232229;  /* Elevated popovers, dropdowns */
  --border: rgba(42, 41, 52, 0.6);   /* Hairline borders */
  --border-soft: rgba(42, 41, 52, 0.5); /* Subtle dividers */

  /* Text Colors */
  --text-primary: #EDEAE3;    /* Warm off-white primary text */
  --text-secondary: #8B8894;  /* Muted lavender-grey metadata & labels */
  --text-tertiary: #5C5A66;   /* Muted placeholders & disabled states */

  /* Accent Color (Single Ochre / Brass Accent App-Wide) */
  --accent: #C9A26D;          /* Muted brass / ochre */
  --accent-soft: rgba(201, 162, 109, 0.12); /* Subtle wash background */

  /* Status Colors (Desaturated, Never Neon) */
  --status-active: #7A9B7E;   /* Sage green — "● Active", "Good" */
  --status-attention: #B0715A; /* Muted clay — "Needs attention", "Bottleneck" */
}
```

### Radii & Shadow Rules
- **Buttons & Inputs**: `border-radius: 6px`.
- **Panels & Active Strips**: `border-radius: 10px`.
- **Shadows**: `box-shadow: none !important` everywhere. Surfaces are completely flat and matte.

---

## 3. Typography Specification

The application uses **two distinct typefaces** with strict role separation:

1. **Display / Headings (`Fraunces`)**:
   - Google Font `Fraunces` (`font-serif`, optical size 340, weight 400–500).
   - Used for: Brand logo, page main title ("Today", "Calendar", etc.), and primary focus headlines.
2. **UI / Body (`Inter`)**:
   - Google Font `Inter` (`font-sans`, weight 400–500).
   - Used for: Navigation links, body copy, form controls, dates, timestamps, and metadata.

### Typography Scale & Case Rules
- `display-lg`: `2.25rem` (36px), weight 500, `Fraunces` — Main Page Title ("Today").
- `display-md`: `1.75rem` (28px), weight 500, `Fraunces` — Current Focus Headline.
- `heading-sm`: `0.9375rem` (15px), weight 500, `Inter` — Section headers.
- `body-text`: `0.875rem` (14px) / `0.8125rem` (13px), weight 400, `Inter`.
- `metadata-caption`: `0.75rem` (12px), weight 400, `Inter`, color `--text-secondary` (`#8B8894`).
- **Sentence Case Enforcement**: All headers, labels, navigation items, status words, and field titles are strictly **sentence case** (e.g. `Current focus`, `This week's bottleneck`, `Today's evidence`, `Capability state`). `text-transform: uppercase` is globally prohibited.

---

## 4. Top Navigation Bar Layout Blueprint

```
+-----------------------------------------------------------------------------------+
|  Capability OS  Today  Calendar  Timeline  Experiments  Decisions  ...  [+ Record]  Logout |
+-----------------------------------------------------------------------------------+
```

- **Sticky Top Bar**: `height: 56px` (14 in Tailwind), background `--bg` (`#16151A`), bottom border `--border` (`#2A2934/60`).
- **Brand**: `Capability OS` in `Fraunces` serif, `#EDEAE3`.
- **Nav Items**: Plain text links without icons (`Today`, `Calendar`, `Timeline`, `Experiments`, `Decisions`, `Learning`, `Reviews`, `Capabilities`, `Prepare AI Review`, `Import AI`, `Search`, `Settings`).
- **Active Nav State**: Text color `--text-primary` (`#EDEAE3`) with a `2px` bottom border line in `--accent` (`#C9A26D`). Inactive items in `--text-secondary` (`#8B8894`).
- **Primary Action**: `+ Record` button — background `--accent` (`#C9A26D`), text `#16151A` (dark warm charcoal), `border-radius: 6px`, font weight 500.
- **Logout Link**: De-emphasized plain text link in `--text-tertiary` (`#5C5A66`) on the far right.

---

## 5. Dashboard (`/`) Page Composition

The dashboard is structured into four visual weights:

```
====================================================================================
WEIGHT 1: HERO SECTION (Unboxed, sits directly on #16151A page background)
------------------------------------------------------------------------------------
Today                                                        [+ Record something]
September 15, 2026

Current focus
System Reliability & Capability OS Core Loop
Establishing strict evidence-based tracking, date boundaries, and clean prompt generation.

This week's bottleneck
Software / backend engineering
Primary constraint on engineering output leverage.

====================================================================================
WEIGHT 2: ACTIVE STRIP (Surface #1D1C22, 2px left border in #C9A26D, rounded-r-[10px])
------------------------------------------------------------------------------------
This week's experiment
│ Strict Server-Side Backfill Validation                        ● Active
│ Problem: Unconstrained date entries create distorted evidence chronology.
│ Intervention: Enforcing [today − backfillDays, today] boundary checks.

====================================================================================
WEIGHT 3: QUIET EVIDENCE STREAM (Unboxed, left-aligned)
------------------------------------------------------------------------------------
Today's evidence                                                   + Record entry
No entries recorded today.
Nothing needs to be reconstructed. When something meaningful happens, record it here.
[+ Record something]

====================================================================================
WEIGHT 4: CAPABILITY STATE GRID (Grouped levels, hairline dividers, unboxed)
------------------------------------------------------------------------------------
Capability state                                                  Full taxonomy →

Level 1 — Machine         Level 2 — Intelligence     Level 3 — Influence
Metacognition         7   Reasoning              —   Communication          6
Self-regulation       6   Mental models          —   Social insight         —
Learning agility      8   Systems thinking       —
------------------------------------------------------------------------------------
Level 4 — Domain          Level 5 — Leverage
Backend engineering   8   Strategy               —
                          Opportunity recognition—
====================================================================================
```

---

## 6. Record Entry (`/entries/new`) Page Composition

- **Form Container**: Centered column (`max-width: 36rem` / `576px`), padding `py-8`.
- **Title**: `Record reflection evidence` (`Fraunces` font, 24px).
- **Date Selector Box**: Background `--surface` (`#1D1C22`), 2px left border in `--accent` (`#C9A26D`), containing date & time pickers constrained to the active backfill window (`[today - backfillDays, today]`).
- **Form Fields**:
  - `Title / Context (optional)`
  - `What did I try to accomplish? (Intent)` & `What actually happened? (Outcome)` (Side-by-side on desktop)
  - `What went well?` & `Where did I struggle or make a mistake?`
  - `Why do I think that happened?`
  - `What did I learn?` & `What will I change?`
  - `Tags (comma separated)`
- **Input Styling**: Background `#1D1C22`, border `#2A2934`, focus ring `#C9A26D`, text `#EDEAE3`, radius `6px`.
- **Buttons**:
  - `Cancel`: Plain text link in `#8B8894`.
  - `Save entry`: Solid `--accent` (`#C9A26D`) fill, text `#16151A`, radius `6px`.

---

## 7. Secondary Views Summary

1. **Calendar (`/calendar`)**: Monthly calendar grid with date cells (`min-height: 64px`), date number, and small `--accent` (`#C9A26D`) dot indicators for dates containing recorded entries. Right-side panel displays selected date's evidence timeline.
2. **Timeline (`/timeline`)**: Chronological evidence feed with date range filtering inputs, tag dropdown selector, backfill provenance notes (`"Recorded on YYYY-MM-DD via backfill"`), and intent/outcome text blocks.
3. **Experiments (`/experiments`)**: Protocol list of active, planned, completed, and abandoned hypotheses formatted as left-edge accent strips with muted status dots (`● Active` in `#7A9B7E`, `● Abandoned` in `#B0715A`).
4. **Decisions (`/decisions`)**: Decision log tracking reasoning, tradeoffs, context, expected outcomes, and confidence ratings (`Confidence: X/10`).
5. **Learning Records (`/learning-records`)**: Structured insight log capturing topics, references, plain-language explanations, and practical applications.
6. **Reviews (`/reviews/weekly`)**: Weekly and monthly structured self-evaluation forms and historical submission list.
7. **Capabilities (`/capabilities`)**: Full 5-level taxonomy view with interactive history drawer displaying historical assessment scores, prompt version, and evidence points.
8. **Prepare AI Review (`/ai-review`)**: Date range & module picker generating a structured, zero-outbound Markdown prompt package for LLM evaluation with a single-click `"Copy package"` action.
9. **Import AI (`/ai-import`)**: Raw JSON payload input validator for importing AI evaluation assessments into the append-only database.
10. **Search & Settings (`/search`, `/settings`)**: Cross-entity search query bar and system configuration settings for backfill window, timezone, and complete ZIP data export.

---

## 8. Summary Checklist for AI Agents

To maintain perfect fidelity when rendering or editing this UI:
- [x] Background is warm charcoal (`#16151A`).
- [x] All headings use `Fraunces` serif font; all UI controls use `Inter` sans-serif font.
- [x] Primary action buttons use ochre/brass background (`#C9A26D`) with dark charcoal text (`#16151A`).
- [x] No `uppercase` or tracked-out labels anywhere.
- [x] No box shadows (`box-shadow: none`).
- [x] Active cards use a 2px left border accent line instead of a full box enclosure.
- [x] Zero tech-stack strings in user-facing UI text.
