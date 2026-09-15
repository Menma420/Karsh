# Personal Capability OS — Visual Design Spec
**For: AI coding agent restyling the existing Next.js + Tailwind frontend**
**Goal: calm, personal, journal-like — not a SaaS admin dashboard**

---

## Context for the agent

The current build is functionally correct but visually reads as a generic AI-generated
SaaS dashboard: pure-black background, one saturated blue accent doing every job,
ALL-CAPS tracked-out eyebrow labels above every block, and a grid of identical bordered
cards regardless of content importance.

This is a **private, single-user daily reflection tool** — closer in spirit to a
personal field notebook or ship's log than to Linear/Notion/Vercel dashboards. Every
instruction below exists to serve that feeling: calm, warm, quiet, worth returning to
at night without feeling like you're opening a work tool.

Apply every rule below exactly. Do not reintroduce ALL-CAPS labels, pure black
backgrounds, bright saturated accents, or uniform card grids anywhere in the app, even
on pages not shown in the reference screenshot — these rules apply to the whole
application, not just the dashboard.

---

## 1. Design tokens (implement as CSS variables / Tailwind theme extension)

```css
:root {
  /* Surfaces */
  --bg: #16151A;              /* page background — warm charcoal, NOT pure black */
  --surface: #1D1C22;         /* cards, panels — barely lifted off bg */
  --surface-raised: #232229;  /* modal/popover level, one step up from surface */
  --border: #2A2934;          /* hairline borders, use at low opacity (~60%) */
  --border-soft: rgba(42, 41, 52, 0.5);

  /* Text */
  --text-primary: #EDEAE3;    /* warm off-white, never pure #FFFFFF */
  --text-secondary: #8B8894;  /* muted lavender-grey, metadata/labels */
  --text-tertiary: #5C5A66;   /* placeholder text, disabled states */

  /* Accent — use exactly ONE saturated color in the whole app */
  --accent: #C9A26D;          /* muted brass/ochre */
  --accent-soft: rgba(201, 162, 109, 0.12); /* accent used as a wash/bg, e.g. active nav underline glow */

  /* Status — desaturated, never neon */
  --status-active: #7A9B7E;   /* sage green — "active", "good", "on track" */
  --status-attention: #B0715A; /* muted clay — "bottleneck", "needs attention" */

  /* Do NOT add: bright blue, saturated green pills, amber/yellow warnings.
     If a new status is needed, desaturate it to sit in this same family. */
}
```

Tailwind config: extend `colors` with the above instead of using default `slate`/`zinc`/`blue` palettes anywhere in the app. Remove any `blue-*`, `green-500`, `amber-*` Tailwind utility classes from the codebase and replace with the tokens above.

---

## 2. Typography

**Two typefaces, clearly distinct roles:**

- **Display / headings**: `Fraunces` (variable, use weight 400–500 for most headings, 340 "soft" optical size if available) — via Google Fonts or self-hosted. Used for: page titles ("Today"), the current-focus headline, section-level headers where a header is truly warranted.
- **UI / body**: `Inter` (already likely in use) — for nav, buttons, form fields, metadata, body copy, list items.

```css
--font-display: 'Fraunces', Georgia, serif;
--font-ui: 'Inter', system-ui, sans-serif;
```

**Type scale (rem, 16px base):**

| Token | Size | Weight | Font | Use |
|---|---|---|---|---|
| `display-lg` | 2.5rem | 500 | Fraunces | "Today" page title |
| `display-md` | 1.75rem | 500 | Fraunces | Current-focus headline |
| `heading` | 1.125rem | 500 | Inter | Section headers (used sparingly, see §4) |
| `body` | 0.9375rem | 400 | Inter | Paragraph/body text |
| `label` | 0.8125rem | 500 | Inter | Field labels, metadata — sentence case, NOT uppercase |
| `caption` | 0.75rem | 400 | Inter | Timestamps, secondary metadata |

**Explicit rules:**
- No `text-transform: uppercase` anywhere. Every current ALL-CAPS label ("CURRENT FOCUS", "CURRENT BOTTLENECK", "SYSTEM STATE", "TODAY'S EVIDENCE", "CAPABILITY STATE", "LEVEL 1 — MACHINE" etc.) becomes sentence case: "Current focus", "This week's bottleneck", "Today's evidence", "Capability state", "Level 1 — Machine" (keep this one capitalized only because it's a proper taxonomy name, not a UI label).
- No `letter-spacing` / tracking on labels.
- Line length for body text: max ~72 characters.

---

## 3. Layout — replace the uniform card grid with a hierarchy

The current dashboard treats every block ("Current Focus", "Current Bottleneck",
"System State", "Current Experiment", "Today's Evidence") as an identical bordered,
rounded card. Replace with three distinct visual weights:

### Weight 1 — Hero (no card at all)
The date + current-focus headline gets **no border, no background fill, no card**. It
sits directly on `--bg`. This is the only place `display-lg`/`display-md` (Fraunces)
appears. Give it generous top margin (min 48px) so it reads as a title, not a widget.

```
Today                                          [+ Record something]
September 15, 2026

System Reliability & Capability OS Core Loop
Establishing strict evidence-based tracking...
```

### Weight 2 — Active strip (left-edge accent bar, not a full border box)
"Current experiment" gets a subtle surface fill (`--surface`) with a **2px left border
in `--accent`**, not a full rounded rectangle outline. No "ACTIVE" pill — replace with
a small dot + word in `--status-active`, no filled badge background.

```
│ Strict Server-Side Backfill Validation        ● Active
│ Problem: Unconstrained date entries create distorted evidence chronology.
│ Intervention: Enforcing [today − backfillDays, today] boundary checks.
```

### Weight 3 — Quiet / empty state (no card, left-aligned, minimal)
"Today's evidence" empty state currently has a full bordered box with centered text —
this makes the *emptiest* part of the page visually the loudest. Remove the border and
background entirely. Left-align. Smaller type for the reassurance line.

```
Today's evidence                                          + Record entry
No entries recorded today.
Nothing needs to be reconstructed. When something meaningful happens, record it here.
[+ Record something]
```

### Capability state grid
Keep as a grid (it's genuinely tabular taxonomy data), but:
- Remove per-cell borders/boxes.
- Use a single hairline `--border-soft` divider between the two rows of levels.
- Increase column gap so the five levels breathe rather than feeling packed.
- "No capabilities defined" in `--text-tertiary`, not `--text-secondary`.

### Remove entirely from the dashboard
- "System state" block ("Phase 1 Core Operational · PostgreSQL 15+ · Prisma ORM ·
  Append-only AI Assessments · Zero Outbound APIs") — this is implementation detail
  from the engineering plan, not user-facing product copy. Delete it from the UI. If a
  status indicator is wanted here later, it should say something the user cares about
  (e.g. "Last AI review: 12 days ago"), never a tech stack string.

---

## 4. Navigation bar

Current: icon + label buttons in a row, one filled-blue "active" pill.

Replace:
- Drop icons on nav items — text labels only ("Today", "Calendar", "Timeline",
  "Experiments", "Decisions", "Learning", "Reviews", "Capabilities").
- Active page indicated by `--text-primary` color + a 2px underline in `--accent`,
  not a filled button background.
- Inactive items in `--text-secondary`.
- "+ Record" remains the **only** filled/solid button in the header — background
  `--accent`, text on accent should be a dark near-`--bg` color for contrast (e.g.
  `#16151A`), not white.
- "Logout" stays a plain text link in `--text-tertiary`, far right, de-emphasized.

---

## 5. Buttons & interactive elements

- **Primary button** (e.g. "+ Record something"): solid `--accent` fill, dark text,
  no gradient, no shadow, `border-radius: 6px` (not fully pill-shaped, not sharp 0).
- **Secondary button** (e.g. "+ Record entry", "View log →"): text-only or
  outline-only using `--border`, `--text-secondary` text, no fill.
- **No drop shadows** anywhere in the app (`box-shadow: none`) — flat, matte surfaces
  only. This is a deliberate departure from the default "SaaS card kit" soft-shadow
  look.
- Border radius: use exactly two values app-wide — `6px` for buttons/inputs, `10px`
  for surface panels (the "current experiment" strip, modals). Do not vary radius
  arbitrarily per component.

---

## 6. Motion

Add exactly one deliberate animated moment and nothing else:
- When a new entry is saved, it should fade + slightly expand into the "Today's
  evidence" list (200–250ms ease-out).

Do **not** add:
- Hover-lift/scale on cards.
- Fade-up-on-scroll entrances for sections.
- Any animation on page load beyond a simple opacity fade of the whole page (\<150ms),
  if any at all.

Respect `prefers-reduced-motion` — disable the entry-save animation for users with that
preference set.

---

## 7. Copy rules (apply across the whole app, not just the dashboard)

| Old | New |
|---|---|
| `CURRENT FOCUS` | `Current focus` |
| `CURRENT BOTTLENECK` | `This week's bottleneck` |
| `SYSTEM STATE` (with tech stack string) | *(remove this block)* |
| `CURRENT EXPERIMENT` | `This week's experiment` |
| `TODAY'S EVIDENCE` | `Today's evidence` |
| `CAPABILITY STATE` | `Capability state` |
| `LEVEL 1 — MACHINE` etc. | `Level 1 — Machine` (sentence case, keep as taxonomy label) |
| `ACTIVE` pill | `● Active` — dot + word, no pill background |
| `OBSERVE → LEARN → ADJUST` eyebrow | remove — it's decorative chrome that doesn't help navigation; if a loop reminder is wanted, it belongs in onboarding/settings, not on every visit to the dashboard |

General rule for the agent: any label currently in `uppercase` with letter-spacing
becomes sentence case with no letter-spacing. Any string describing the tech stack or
implementation (database names, "append-only", "zero outbound APIs") is removed from
user-facing UI — that language belongs in the engineering docs, not the product.

---

## 8. Explicit "do not do" list

- Do not use pure black (`#000000` / `#0A0A0A`) anywhere.
- Do not use pure white (`#FFFFFF`) for text.
- Do not use more than one saturated/bright color in the entire UI (`--accent` is it).
- Do not put a full border + background fill on every content block — vary weight by
  importance per §3.
- Do not use `uppercase` + `letter-spacing` for any label.
- Do not use soft drop shadows (`rgba(0,0,0,0.1)` card shadows).
- Do not add hover-lift or fade-up-on-load animations.
- Do not surface implementation/tech-stack details in user-facing copy.

---

## 9. One-line brief to paste to the coding agent

> "Restyle the Personal Capability OS frontend using the attached design spec exactly:
> warm charcoal background (#16151A), one muted brass accent (#C9A26D) replacing all
> blue, Fraunces for headline type paired with Inter for UI, no ALL-CAPS labels
> anywhere, no uniform bordered-card grid — vary surface weight by content importance
> (hero content gets no box, active items get a left accent bar, empty states are
> unboxed and quiet), no drop shadows, and remove all tech-stack strings from
> user-facing copy. Apply across every page, not just the dashboard."

---

*Pair this with the existing engineering plan doc — this spec governs presentation
only; it does not change any API contract, data model, or backend logic already
defined there.*
