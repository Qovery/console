---
name: qovery-ui
description: Use for every user-facing UI change or review in the Qovery Console, including feature implementation, bug fixes, styling, layout, interactions, and copy. Applies to small changes without an explicit design request or skill invocation.
---

# Qovery UI Skill

Design review and implementation guidance for the Qovery Console.

## Default workflow

Apply this skill before any user-facing UI change or review, without requiring an explicit invocation. Read `.claude/design.md`, inspect the closest existing implementation and shared components, then load only the references relevant to the change from the table below. Let the request determine whether to review, explain, or implement. Do not require a command or a separate design proposal.

## Reference selection

The references below define the Console conventions. More than one may apply to a task.

| When the task involves                                         | Read                                               |
| -------------------------------------------------------------- | -------------------------------------------------- |
| Adding, choosing, or changing components and interactive flows | [Components](references/components.md)             |
| Layout, spacing, density, or alignment                         | [Spacing and layout](references/spacing-layout.md) |
| Colors, surfaces, themes, or status presentation               | [Colors](references/colors.md)                     |
| Text sizes, weights, hierarchy, or font choices                | [Typography](references/typography.md)             |

For a broader visual review or redesign, load the topic references relevant to that surface.

For reviews, distinguish violations of these conventions and concrete user-impacting issues from optional preferences.
