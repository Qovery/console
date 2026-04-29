# Qovery Console — Design Context

## North Star: "The Calm Control Plane"

Qovery is a high-frequency operational interface used under pressure. Every UI decision should serve clarity, reduce hesitation during infrastructure changes, and communicate system state without ambiguity. The aesthetic is restrained, not sterile.

---

## Stack

| Layer      | Choice                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| Framework  | React 18 + TypeScript                                                                  |
| Styling    | Tailwind CSS + SCSS — always prefer Tailwind utilities, CSS variables only as fallback |
| Variants   | CVA + `twMerge` from `@qovery/shared/util-js`                                          |
| Primitives | Radix UI                                                                               |
| Animation  | Framer Motion                                                                          |
| Icons      | FontAwesome Pro Kit via `<Icon iconStyle iconName />`                                  |

Shared UI components live in `libs/shared/ui/src/lib/components/`.

---

## Non-Negotiables

These apply to every surface, every time:

1. **Status colors are semantic, never decorative.** `positive`, `warning`, `negative`, `info` communicate system state only. Using them for emphasis or aesthetics breaks user trust.
2. **No hardcoded color values.** Every color comes from a Tailwind utility or CSS token — never a hex, never an rgba.
3. **Brand violet is concentrated.** On actionable controls and active states. Not as decoration, not as a page wash.
4. **Light and dark parity is automatic.** Use the right token and you get both themes. Hardcode and you break one.
5. **No color-only state.** Every status signal pairs color with an icon, text, or tooltip.
6. **Whitespace serves legibility, not aesthetics.** This is a dense product — don't inflate spacing to feel premium.
7. **Motion is earned.** High-frequency actions never animate. Everything else needs a reason.

---

## What Qovery Feels Like

- Dense but not cluttered — information-rich layouts that expert users can scan quickly
- Calm under pressure — no visual theatrics, no ornamentation inside workflows
- Trustworthy through consistency — the same component does the same thing everywhere
- Flat by default — shadows only on floating layers (dropdowns, modals, tooltips)

**Explicitly rejected:** neon-cyberpunk aesthetics, marketing-first ornamentation inside core workflows, glassmorphism-heavy treatments, identical card grids, hero-metric templates used decoratively.

---

## Reference Files

Use `/qovery-ui` for targeted design commands. Reference files for deeper rules:

| File                          | What's in it                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `references/colors.md`        | Token system, semantic rules, contrast requirements, tonal scale                     |
| `references/typography.md`    | Type scale, weights, Roboto Mono, typographic characters                             |
| `references/spacing.md`       | 4px grid, visual rhythm, layout compositions, optical alignment, working memory rule |
| `references/components.md`    | Which component to use when                                                          |
| `references/copy.md`          | Tone, microcopy patterns, modal titles, button copy rules                            |
| `references/motion.md`        | Animation decision framework, easing, duration guide                                 |
| `references/anti-patterns.md` | Match-and-refuse design bans                                                         |
| `references/accessibility.md` | Non-negotiables, ARIA, focus management                                              |
