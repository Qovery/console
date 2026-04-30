---
name: qovery-ui
description: Design review and implementation guidance for the Qovery Console. Use for auditing UI components, refining spacing and color, selecting the right shared component, writing microcopy, and designing new surfaces from scratch.
---

# Qovery UI Skill

Design review and implementation guidance for the Qovery Console. Read `.claude/design.md` first for orientation.

---

## Core Design Principles

`.claude/design.md` is the source of truth — read it first. These are quick-reference reminders for agents running without that context.

**Colors:** Tailwind tokens only, never hardcoded. Status colors are semantic, never decorative. Brand violet on actionable controls only.
**Typography:** `text-sm` is the default. Two weights: 400 body, 500 anchors. Roboto Mono for tabular data. Max 3 sizes per surface.
**Spacing:** 4px grid. Variety creates hierarchy. Cards for distinct actionable content only — never nested.
**Components:** Shared component first, always. `<StatusChip>` for all system states. `<Button>` not `<ButtonPrimitive>`. `<Badge>` not `<Tag>`.
**Copy:** Technical but human. Button copy 1–3 words. Modal titles name the action. Address the user as "you."
**Motion:** Default is no motion. High-frequency actions never animate. Every animation needs a reason beyond aesthetics.
**Accessibility:** No color-only state. Focus rings never suppressed. Interactive icon-only controls always have `aria-label`.

---

## Commands

| Command                | When to use                                    |
| ---------------------- | ---------------------------------------------- |
| `/qovery-ui audit`     | Full design review of a component or page      |
| `/qovery-ui polish`    | Targeted spacing, color, and rhythm refinement |
| `/qovery-ui component` | Find the right component or scaffold a new one |
| `/qovery-ui copy`      | Review or write microcopy                      |
| `/qovery-ui motion`    | Audit or add animation                         |
| `/qovery-ui craft`     | Design something new from scratch              |

---

## /audit

**Load:** `references/colors.md`, `references/spacing-layout.md`, `references/anti-patterns.md`, `references/accessibility.md`

Four-phase review. Label every finding:

- `[blocking]` — ships broken, violates semantic rules, or breaks accessibility
- `[important]` — degrades experience, likely to cause design review rejection
- `[nit]` — minor inconsistency, low impact

**Phase 1 — Token hygiene:** hardcoded values, legacy tokens, raw Tailwind palette classes used semantically.
**Phase 2 — Semantic color:** status colors used decoratively, color-only state, brand as page wash.
**Phase 3 — Spacing & density:** off-grid values, whitespace inflation, button height overrides.
**Phase 4 — Accessibility:** missing `aria-label`, suppressed focus ring, color-only status.

Output format — a single markdown table, one row per issue:

| Location            | Severity      | Issue                                   | Fix                                           |
| ------------------- | ------------- | --------------------------------------- | --------------------------------------------- |
| `ServiceRow.tsx:42` | `[blocking]`  | `text-green-500` used for running state | Replace with `text-positive`                  |
| `Modal.tsx:18`      | `[important]` | Modal title is "Settings"               | Rename to the action: "Configure autoscaling" |
| `Card.tsx:9`        | `[nit]`       | `gap-5` off the 4px grid                | Use `gap-4` or `gap-6`                        |

Finish with: total issues by severity.

---

## /polish

**Load:** `references/spacing-layout.md`, `references/colors.md`, `references/typography.md`, `references/anti-patterns.md`

Fix without changing functionality. Output a Before / After / Why table, one row per change:

| Before                | After                             | Why                                      |
| --------------------- | --------------------------------- | ---------------------------------------- |
| `p-5`                 | `p-4`                             | Off the 4px grid                         |
| `text-neutral-600`    | `text-neutral-subtle`             | Legacy token                             |
| No hover state on row | `hover:bg-surface-neutral-subtle` | Interactive elements need hover feedback |

---

## /component

**Load:** `references/components.md`

1. Identify if a shared component already exists — always prefer it
2. Return the import path and correct usage with props
3. If nothing fits, explain why before scaffolding new

---

## /copy

**Load:** `references/copy.md`

Review or generate microcopy. Output findings as a Before / After / Why table:

| Before              | After                                        | Why                                 |
| ------------------- | -------------------------------------------- | ----------------------------------- |
| "An error occurred" | "Deploy failed. Check the logs for details." | States what happened + what to do   |
| "ENVIRONMENT NAME"  | "Environment name"                           | Sentence case                       |
| "Confirm"           | "Delete environment"                         | Destructive buttons name the object |

---

## /motion

**Load:** `references/motion.md`

Ask first: how often will users see this? If the answer is "constantly," remove the animation. Otherwise, check easing and duration against the guide and output a Before / After / Why table.

---

## /craft

**Load:** `references/typography.md`, `references/spacing-layout.md`, `references/colors.md`, `references/components.md`, `references/copy.md`

Generative command — use when designing something new from scratch rather than reviewing existing work.

**Input:** describe what you're building. Include the user goal, the data or content being shown, and any known constraints (compact, read-heavy, action-dense).

**Output:** a structured design proposal with:

1. **Layout skeleton** — which primitives to reach for (card, table, modal, inline), rough visual hierarchy
2. **Component choices** — which shared components satisfy each UI need and why
3. **Typography** — size and weight choices per content level
4. **Color decisions** — which semantic tokens to use for each surface and state
5. **Copy suggestions** — headings, labels, CTAs, empty state

Output structured prose and a table for component choices. Do not output code. Flag any working memory concerns (>4 simultaneous choices) and suggest grouping or progressive disclosure where needed.

---

## Reference Files

| File                           | Contents                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `references/colors.md`         | Token system, semantic rules, contrast, tonal scale                                  |
| `references/typography.md`     | Type scale, weights, Roboto Mono, typographic characters                             |
| `references/spacing-layout.md` | 4px grid, visual rhythm, layout compositions, optical alignment, working memory rule |
| `references/components.md`     | Which component to use when                                                          |
| `references/copy.md`           | Tone, microcopy patterns, modal titles, button copy rules                            |
| `references/motion.md`         | Animation decision framework, easing, duration guide                                 |
| `references/anti-patterns.md`  | Match-and-refuse design bans                                                         |
| `references/accessibility.md`  | Non-negotiables, ARIA, focus management                                              |
