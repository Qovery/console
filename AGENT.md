# AI Agent Guide

## Purpose

This document tells every coding agent how to work inside the Qovery Console repo. It stays short on purpose and points to the single source of truth that lives under `.cursor/rules`.

## How to Consume the Rules

- All mandatory rules are Markdown+frontmatter files inside `.cursor/rules`.
- When you need details, open them through Cursor with `@rules/<file-name>` (example: `@rules/project-architecture`).
- Treat the rule files as canonical; this guide only summarizes them.

### Rule Index

| Topic                 | File                             | Highlights                                              |
| --------------------- | -------------------------------- | ------------------------------------------------------- |
| Architecture & layers | `project-architecture.mdc`       | Nx layout, domains/pages/shared split, no circular deps |
| React & TypeScript    | `react-typescript-standards.mdc` | Hooks/components rules, inline type imports, no `any`   |
| Styling & design      | `styling-standards.mdc`          | Tailwind-only, accessibility, Radix defaults            |
| Testing               | `testing-standards.mdc`          | `@qovery/shared/util-tests`, user-event, coverage focus |
| Naming                | `naming-conventions.mdc`         | File naming, props suffixes, constant casing            |
| Dev workflow          | `development-commands.mdc`       | Daily commands, Nx helpers, yarn scripts                |
| Quality gates         | `pre-commit-workflow.mdc`        | Format/test/lint steps, semantic-release expectations   |

## Quick Workflow

1. **Environment** – `nvm use 23`, `yarn install` (Yarn Berry only, via corepack).
2. **Branching** – branch from `staging`, keep commits conventional (`feat|fix|chore(scope): message`).
3. **Development loop** – follow the relevant rule file for the area you touch, keep utilities in `shared/util-*`, prefer `ts-pattern` for branching logic.
4. **Before commit** – run the sequence from `pre-commit-workflow.mdc` (format → test → snapshot scan → lint). No failures allowed.
5. **Review readiness** – double-check imports order, optional values use `undefined`, and there are unit tests for any new business logic.

## Standards Snapshot

### Architecture & Layering

- apps reference libs; libs split into `domains/*`, `pages/*`, `shared/*`.
- `data-access` = API wiring only, `feature` = business logic, `ui` = reusable presentation.
- Utilities that can be shared must live in `@qovery/shared/util-js` and be imported directly (never re-export via data-access).

### React & TypeScript

- Functional components only, named exports, props interface named `<ComponentName>Props`.
- Destructure props in the signature, avoid `React.FC`, avoid `any`/`as any`, keep types narrow (`unknown` + guards when needed).
- Use inline type imports (`import { type Foo, bar } from ...`) and prefer discriminated unions for complex flows.

### Styling

- TailwindCSS utilities only, composed with `clsx`/`twMerge` from `@qovery/shared/util-js`.
- Prefer Radix primitives for accessibility; follow spacing & breakpoint conventions from `styling-standards.mdc`.
- No inline styles unless explicitly justified in PR description.

### Testing

- Render via `renderWithProviders` from `@qovery/shared/util-tests`, interact with `userEvent`.
- Arrange–Act–Assert structure, descriptive `describe/it` blocks, snapshot only when UI is complex.
- Cover success, error, and edge states for every business rule you add or change.

### Naming & Files

- Snake-case file names (`cluster-migration-modal.tsx`), hooks start with `use-`, utilities use snake-case.
- Components in PascalCase, constants in `UPPER_SNAKE_CASE`, optional values return `undefined` (not empty strings).
- Keep comments minimal and in English; prefer self-documenting code.

### Quality Gates

- Formatting: `npx nx format:check`.
- Tests: `yarn test --passWithNoTests`.
- Lint: `npx nx run-many --all --target=lint --parallel`.
- Snapshot review: inspect `*.snap` changes before committing.

## Collaboration Checklist for Agents

- Do not revert user changes you did not author; ask when unsure.
- Clearly state assumptions, especially for architectural or styling decisions.
- Keep diffs focused and reference the relevant rule file when explaining decisions in the PR/response.
- Avoid long-running commands unless the user asks; document any command outputs the user needs to know.

## Common Commands (see `development-commands.mdc` for full list)

- `yarn start` – run the console app.
- `yarn storybook` – explore shared UI components.
- `npx nx test <project>` – run focused tests.
- `npx nx graph` – inspect project dependencies.

## Need-to-Know Facts

- Package manager is **Yarn Berry**; never run npm.
- ts-pattern is the preferred way to express branching logic.
- React Query handles server state; keep React state local and minimal.
- Accessibility is first-class: respect `jsx-a11y` lint rules and Radix patterns.

Follow this guide, dive into the detailed rule files when needed, and you will stay aligned with the Console team's expectations.
