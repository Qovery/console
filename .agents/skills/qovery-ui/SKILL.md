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

Read each selected reference in bounded chunks (for example, 80–120 lines per read), continuing through the full reference. Keep reference reads separate from component source and other files; do not concatenate them into one large output. Check every result for truncation. If any output is truncated, reread the missing range in smaller chunks before implementing; requesting a file does not mean its contents reached you. Apply the same approach when inspecting component source, ensuring the relevant implementation is visible rather than relying only on its imports or exports.

Verify the rendered result when implementing UI: check typography, alignment and wrapping with representative content, including long labels and filtered results. Source classes alone do not establish how the page renders.

For reviews, distinguish violations of these conventions and concrete user-impacting issues from optional preferences.
