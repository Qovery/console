---
name: qovery-console-standards
description: Qovery Console coding standards, architecture guidelines, naming conventions, testing practices, and development workflows. This skill should be used when writing, reviewing, or refactoring code in the Qovery Console monorepo to ensure consistency and quality.
license: MIT
metadata:
  author: qovery
  version: '1.0.0'
---

# Qovery Console Standards

Comprehensive coding standards for the Qovery Console React/TypeScript monorepo. Contains 7 rules covering architecture, React patterns, styling, testing, naming, development workflow, and pre-commit quality gates.

## When to Apply

Reference these guidelines when:

- Writing new components, hooks, or utilities in the Console
- Reviewing or refactoring existing Console code
- Setting up tests for business logic
- Making styling decisions (Tailwind, Radix, accessibility)
- Running development commands or preparing commits
- Creating new Nx libraries or components

## Rule Categories

| Rule                 | File                            | Scope                                                     |
| -------------------- | ------------------------------- | --------------------------------------------------------- |
| Project Architecture | `project-architecture.md`       | Nx monorepo structure, lib organization, layer boundaries |
| React & TypeScript   | `react-typescript-standards.md` | Import rules, component patterns, state management        |
| Styling              | `styling-standards.md`          | TailwindCSS, Radix UI, responsive design, accessibility   |
| Testing              | `testing-standards.md`          | Test setup, structure, mocking, coverage                  |
| Naming Conventions   | `naming-conventions.md`         | File, variable, component, and constant naming            |
| Development Commands | `development-commands.md`       | Daily workflow, Nx commands, package management, git      |
| Pre-commit Workflow  | `pre-commit-workflow.md`        | Conventional commits, format/test/lint checks             |

## Quick Reference

### Architecture

- Nx monorepo: `apps/` and `libs/` (domains, pages, shared)
- `data-access` = API logic, `feature` = business components, `ui` = reusable presentation
- No circular imports; use Nx generators for new libs

### React & TypeScript

- Inline type imports: `import { type Foo, bar } from './module'`
- Functional components only, no `React.FC`, destructure props in signature
- React Query for server state, `clsx`/`twMerge` for conditional classes

### Styling

- TailwindCSS only, mobile-first, Radix UI for accessibility
- No inline styles, consistent spacing via Tailwind scale

### Testing

- `renderWithProviders` from `@qovery/shared/util-tests`
- `userEvent` over `fireEvent`, Arrange-Act-Assert pattern
- Cover success, error, and edge states

### Naming

- Snake-case files (`user-profile.tsx`), PascalCase components
- `Props` suffix for interfaces, `UPPER_SNAKE_CASE` for constants

### Workflow

- Yarn Berry only (never npm), `nvm use 23`
- Conventional commits: `feat|fix|chore(scope): message`
- Pre-commit: format -> test -> snapshot review -> lint

## How to Use

Read individual rule files for detailed guidelines:

```
rules/project-architecture.md
rules/react-typescript-standards.md
rules/styling-standards.md
```

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`
