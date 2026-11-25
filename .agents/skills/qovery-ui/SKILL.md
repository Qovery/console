---
name: qovery-ui
description: Use for every user-facing UI change or review in the Qovery Console, including feature implementation, bug fixes, styling, layout, interactions, and copy. Applies to small changes without an explicit design request or skill invocation.
---

# Qovery UI Skill

Design review and implementation guidance for the Qovery Console.

## Default workflow

Apply this skill before any user-facing UI change or review, without requiring an explicit invocation. Read `.claude/design.md` and the relevant references below, then inspect comparable implementations and shared components.

Infer the approach from the request:

- For new UI, compose it using the relevant Console conventions and established patterns.
- For a specific fix, address the issue and verify its integration with the surrounding UI. Keep the scope local.
- For a review or improvement of existing UI, assess the current implementation against the conventions, including unchanged elements within the requested scope. Do not assume its existing structure or styling is already appropriate.

Let the request determine whether to explain findings or implement corrections. Do not require a command or a separate design proposal.

Treat violations of the documented Console conventions—including layout, spacing, typography, colors, and component usage—as actionable findings, even when the interface functions correctly. Separate these from optional suggestions that are not supported by a convention or concrete user impact.

## Reviewing and improving existing UI

Establish the scope before reviewing. For a page, include its relevant tabs, dialogs, and interaction states. For an area, identify its pages and creation/editing flows so nested screens are not overlooked. Keep this proportional to the request.

Choose comparable established implementations outside the UI being reviewed. Use the references to judge which parts of those examples apply; an existing implementation is not automatically correct.

Review from the outside inward:

1. Page composition and its relationship to neighboring pages.
2. Section grouping, component selection, and integration.
3. Typography, spacing, colors, and content.
4. Interaction and accessibility behavior.

Inspect the components that render the UI, including nested or reused components. A conforming page wrapper does not establish that its contents follow the conventions.

When improvements are requested, correct structural and integration issues before visual details. Preserve working behavior and unrelated code, but do not preserve an unsuitable layout solely to minimize the diff.

After implementing, reassess the complete affected surface against the same references, not only the lines changed. Report which pages and states were checked, and identify any meaningful gaps in coverage.

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

## Verification

For UI implementation and visual reviews, inspect the rendered result when available and permitted: check typography, alignment and wrapping with representative content, including long labels and filtered results. Source classes alone do not establish how the page renders. Respect explicit no-browser requests. If visual verification cannot be performed, state that limitation and distinguish source inspection from observed behavior.

When changing interactive flows, verify the affected read-only states and existing unsaved-change behavior, including nested editors. Preserve the established save and leave-page protection where applicable.
