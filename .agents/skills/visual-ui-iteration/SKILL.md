---
name: visual-ui-iteration
description: Iterative closed-loop visual inspection and refinement of application UI using real browser rendering and visual regression critique.
---

# Visual UI Iteration Skill

## Purpose

This skill enables iterative visual inspection and refinement of the application's UI.

The agent MUST NOT rely solely on source code to judge visual quality.

The agent must:

1. Run the application.
2. Open the relevant page in a real browser.
3. Capture/render the page.
4. Inspect the actual rendered UI.
5. Identify visual and UX problems.
6. Modify the implementation.
7. Render the page again.
8. Compare before/after.
9. Repeat until the visual acceptance criteria are satisfied.

This is a CLOSED-LOOP visual development process.

Source code is not sufficient evidence that the UI is correct.

The rendered UI is the source of truth for visual evaluation.

---

# 1. WHEN TO USE THIS SKILL

Use this skill whenever the task involves:

- UI design
- visual refinement
- layout changes
- responsive design
- spacing
- typography
- navigation
- component composition
- visual hierarchy
- mobile UX
- accessibility-related visual issues
- screenshots
- matching a design specification
- fixing "this looks bad"
- fixing "this feels crowded"
- fixing visual polish

Especially use it when the user provides a screenshot or says that
something "looks bad."

---

# 2. FIRST PRINCIPLE

NEVER assume that changing CSS successfully fixed the visual problem.

After every meaningful visual change:

RENDER → INSPECT → EVALUATE → MODIFY

Do not stop after:

EDIT → CLAIM SUCCESS

---

# 3. VISUAL ITERATION LOOP

For every UI task, execute this loop:

```text
Understand requested visual change
        ↓
Inspect current implementation
        ↓
Run application
        ↓
Open relevant page in browser
        ↓
Capture screenshot
        ↓
Visually inspect screenshot
        ↓
Identify concrete problems
        ↓
Rank problems by severity
        ↓
Make smallest appropriate structural change
        ↓
Render again
        ↓
Compare against previous render
        ↓
Check requested acceptance criteria
        ↓
Repeat
```

Continue until the visual result is clearly improved.

---

# 4. NEVER BLINDLY MODIFY THE UI

Before changing anything:

Inspect:

* existing component hierarchy
* existing CSS/Tailwind classes
* layout containers
* responsive breakpoints
* typography
* spacing
* navigation structure
* existing design tokens

Do not rewrite the entire page merely because one component looks bad.

Prefer targeted changes.

If the user explicitly requests a component-only change,
the rest of the application is OUT OF SCOPE.

---

# 5. SCREENSHOT-BASED EVALUATION

When inspecting a page, evaluate the actual rendered screenshot.

Look specifically for:

## Layout

* Is content aligned?
* Is spacing intentional?
* Are elements crowded?
* Is there excessive empty space?
* Are elements visually grouped correctly?
* Is the hierarchy obvious?
* Are widths appropriate?

## Typography

* Is the title clearly dominant?
* Is secondary information actually secondary?
* Are labels too small?
* Are line lengths comfortable?
* Is text wrapping awkwardly?

## Navigation

* Is the number of visible choices reasonable?
* Is the active state obvious?
* Are primary actions visually prominent?
* Is secondary navigation hidden appropriately?

## Visual hierarchy

Ask:

"What does my eye look at first?"

Then:

"What does it look at second?"

If the answer does not match the product hierarchy,
the design needs revision.

## Visual noise

Look for:

* unnecessary borders
* excessive cards
* excessive icons
* too many colors
* excessive badges
* repeated containers
* unnecessary decorative elements

## Consistency

Check:

* spacing
* border radius
* button sizing
* typography
* alignment
* colors
* interaction states

---

# 6. DESIGN CRITIQUE BEFORE CODING

Before making substantial UI changes, explicitly form a short visual diagnosis.

Example:

```text
Observed problems:

P0 — Header has 11 simultaneous navigation choices.
P1 — Primary action is visually competing with navigation.
P1 — Secondary destinations have equal visual weight to Today.
P2 — Navigation spacing is compressed.
P2 — Utility actions are mixed with primary navigation.
```

Do NOT generate vague observations such as:

"Make the UI more modern."

Diagnoses must be concrete and actionable.

---

# 7. PRIORITIZE STRUCTURAL PROBLEMS

Always fix problems in this order:

1. Information architecture
2. Layout
3. Visual hierarchy
4. Typography
5. Spacing
6. Components
7. Colors
8. Microinteractions

Do NOT attempt to fix an information architecture problem with CSS.

Example:

BAD:

"Header is crowded → reduce font size."

GOOD:

"Header is crowded → move secondary destinations into a dropdown."

---

# 8. MINIMUM CHANGE PRINCIPLE

Make the smallest structural change that solves the problem.

For example:

If the header is overcrowded:

DO:

```text
Today
Calendar
Timeline
More ▾
+ Record
```

instead of:

```text
Today
Calendar
Timeline
Experiments
Decisions
Learning
Reviews
Capabilities
...
```

Do NOT:

* shrink fonts
* reduce spacing to 2px
* truncate labels
* introduce horizontal scrolling
* hide text with CSS
* create multiple navigation rows

Solve the information architecture.

---

# 9. RESPONSIVE VISUAL INSPECTION

A UI is not finished after checking desktop.

For meaningful UI work, inspect at minimum:

### Desktop

1440 × 900

1280 × 800

1024 × 768

### Mobile

390 × 844

375 × 812

The exact viewport can be adjusted if the browser environment requires it.

Check:

* overflow
* wrapping
* tap target size
* navigation behavior
* text wrapping
* spacing
* button placement
* content hierarchy

---

# 10. MOBILE IS NOT "DESKTOP BUT SMALLER"

Do not simply allow desktop navigation to wrap.

Responsive design may require structural changes.

For example:

Desktop:

```text
Brand   Today   Calendar   Timeline   More        + Record
```

Mobile:

```text
Brand                              + Record   Menu
```

The menu contains the remaining navigation.

---

# 11. VISUAL COMPARISON

After a modification, compare the new render with the previous render.

Ask:

### Did the requested problem actually improve?

### Did anything else regress?

### Did the visual hierarchy become clearer?

### Did the change introduce new clutter?

### Did the layout become more balanced?

Do not assume "changed" means "better."

---

# 12. ITERATION LIMIT

For a normal UI issue:

Minimum:

2 visual inspection cycles.

For a significant visual redesign:

3–6 cycles.

Do not stop after the first render if obvious problems remain.

If the result is still visibly poor, continue.

---

# 13. STOP CONDITION

Stop iterating only when:

1. The requested problem is resolved.
2. The visual result satisfies the design specification.
3. No obvious layout problems remain.
4. Responsive behavior is acceptable.
5. No unrelated UI was unnecessarily changed.
6. The final rendered result is better than the starting result.

---

# 14. USER SCREENSHOT FEEDBACK

If the user provides a screenshot and says something like:

"this looks bad"

Treat the screenshot as direct visual evidence.

Do NOT respond by explaining that the source code is correct.

Instead:

1. inspect screenshot
2. identify the actual visual problem
3. determine its root cause
4. modify implementation
5. render again
6. verify

If the user says:

"The header is overcrowded"

Do not interpret this as:

"Make the header fit."

Interpret it as:

"The current information architecture exposes too many things simultaneously."

---

# 15. SCOPE CONTROL

Respect explicit scope instructions.

If the user says:

"Only fix the header."

Then:

ALLOWED:

* header component
* navigation structure
* header responsive behavior
* dropdown used by header
* header-specific CSS
* routing logic required by header

NOT ALLOWED:

* dashboard redesign
* cards
* page typography
* page spacing
* calendar
* forms
* content
* database
* API
* unrelated components

After the change, visually verify that the rest of the page remains unchanged.

---

# 16. DESIGN SYSTEM PRESERVATION

If an existing design system is present:

USE IT.

Do not invent a new design system for every UI task.

Preserve:

* colors
* fonts
* radius
* spacing
* buttons
* inputs
* surfaces

unless the user explicitly asks for a broader visual redesign.

---

# 17. AVOID AI-GENERATED UI PATTERNS

Do not automatically reach for:

* gradients
* glassmorphism
* glowing borders
* excessive rounded cards
* purple/blue "AI" gradients
* neon accents
* excessive icons
* giant hero text
* excessive badges
* excessive shadows
* decorative blobs
* unnecessary animations

A design should be justified by the product,
not by common AI-generated UI patterns.

---

# 18. CALM UI PRINCIPLE

For this application specifically:

The interface should feel:

* calm
* warm
* focused
* personal
* mature
* quiet
* intentional

It should encourage returning every day.

Avoid visual pressure.

An empty day is not a failure.

Do not create visual systems that make the user feel behind.

---

# 19. VISUAL QA CHECKLIST

Before declaring a UI task complete:

### Structure

[ ] Is the hierarchy obvious?

[ ] Is the most important action obvious?

[ ] Are secondary actions appropriately hidden?

[ ] Is the layout balanced?

### Typography

[ ] Titles are clearly distinguished.

[ ] Metadata is secondary.

[ ] No unnecessarily tiny text.

[ ] No awkward wrapping.

### Spacing

[ ] No crowding.

[ ] No unexplained giant gaps.

[ ] Related items are grouped.

[ ] Unrelated items have sufficient separation.

### Components

[ ] No unnecessary cards.

[ ] No unnecessary borders.

[ ] No unnecessary icons.

[ ] Buttons have clear hierarchy.

### Responsive

[ ] 1440px checked.

[ ] 1280px checked.

[ ] 1024px checked.

[ ] 390px checked.

[ ] No horizontal overflow.

[ ] No navigation wrapping.

### Product feel

[ ] Calm.

[ ] Personal.

[ ] Focused.

[ ] Mature.

[ ] Not generic SaaS.

[ ] Not AI-slop.

---

# 20. REQUIRED FINAL REPORT

When the visual task is complete, report:

```text
Visual QA complete.

Changed:
- ...

Preserved:
- ...

Verified at:
- 1440px
- 1280px
- 1024px
- 390px

Final result:
- ...
```

Keep this report concise.

Do not claim visual success unless the rendered UI was actually inspected.

---

# 21. VISUAL REGRESSION HARD GATE

After every UI modification, execute a visual regression check:

1. Capture header/page viewports at 1440x900 and 390x844.
2. Compare bounding boxes, overflow, wrapping, relative spacing, and visual hierarchy.
3. Only declare task complete when rendered comparison satisfies visual criteria.

---

# 22. GOLDEN RULE

SOURCE CODE TELLS YOU WHAT YOU BUILT.

THE BROWSER TELLS YOU WHAT YOU DESIGNED.

Always inspect the browser.
