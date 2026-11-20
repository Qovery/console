---
name: qovery-ui
description: Use for every user-facing UI change or review in the Qovery Console, including feature implementation, bug fixes, styling, layout, interactions, and copy. Applies to small changes without an explicit design request or skill invocation.
---

# Qovery UI Skill

Design review and implementation guidance for the Qovery Console. Read `.claude/design.md` first for orientation.

## Default workflow

Apply this skill before any user-facing UI change or review, without requiring an explicit invocation. Read `.claude/design.md`, inspect the closest existing implementation and shared components, then load only the references relevant to the change from the table below. Let the request determine whether to review, explain, or implement. Do not require a command or a separate design proposal.

---

## Core Design Principles

`.claude/design.md` is the source of truth — read it first. These are quick-reference reminders for agents running without that context.

**Colors:** Tailwind tokens only, never hardcoded. Status colors are semantic, never decorative. Brand violet on actionable controls only.
**Typography:** `text-sm` is the default. Follow shared component typography and comparable usages. Do not apply monospace merely because content appears in a table.
**Spacing:** Follow existing component spacing and the Tailwind scale. Cards for distinct actionable content only — never nested.
**Components:** Shared component first, always. `<StatusChip>` for all system states. `<Button>` not `<ButtonPrimitive>`. `<Badge>` not `<Tag>`.
**Copy:** Technical but human. Button copy 1–3 words. Modal titles name the action. Address the user as "you."
**Motion:** Default is no motion. High-frequency actions never animate. Every animation needs a reason beyond aesthetics.
**Accessibility:** No color-only state. Focus rings never suppressed. Interactive icon-only controls always have `aria-label`.

---

## Reference selection

Read the references needed for the task before editing or reviewing. More than one may apply; do not load every reference for every change.

| When the task involves                                         | Read                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Adding, choosing, or changing components and interactive flows | [Components](references/components.md) and [accessibility](references/accessibility.md)          |
| Layout, spacing, density, or alignment                         | [Spacing and layout](references/spacing-layout.md)                                               |
| Colors, surfaces, themes, or status presentation               | [Colors](references/colors.md)                                                                   |
| Text sizes, weights, hierarchy, or font choices                | [Typography](references/typography.md)                                                           |
| Labels, descriptions, errors, or other user-facing text        | [Copy](references/copy.md)                                                                       |
| Animation or transitions                                       | [Motion](references/motion.md) and [accessibility](references/accessibility.md)                  |
| A broader visual review or redesign                            | [Anti-patterns](references/anti-patterns.md), plus the topic references relevant to that surface |

For shared component changes, follow the reuse, compatibility, Storybook, and interaction checks in the component reference. For reviews, distinguish concrete user-impacting issues from optional preferences; a component substitution is not blocking merely because it is preferred.
