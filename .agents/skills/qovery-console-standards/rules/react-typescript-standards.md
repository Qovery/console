---
title: React & TypeScript Standards
impact: HIGH
tags: [react, typescript, components, imports, state]
---

# React & TypeScript Standards

## Import Rules

- ALWAYS use inline type imports: `import { type MyType, myFunction } from './module'`
- Respect import order according to `.eslintrc.json`
- Use `@qovery/*` aliases defined in `tsconfig.base.json`
- DO NOT import directly from `react` (destructure React)
- Use `@qovery/shared/util-tests` instead of `@testing-library/react`

## React Components

- Functional components only
- No explicit `React.FC`
- Destructure props directly in parameters
- Props interface named `<ComponentName>Props`
- Named exports only (no default exports)
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes
- Prefer Radix UI components when available

## State Management

- Use React Query for API calls and server state
- Keep React state local and minimal
- Prefer `ts-pattern` for branching logic
- Use discriminated unions for complex flows

## TypeScript

- Avoid `any` and `as any`; keep types narrow
- Use `unknown` + type guards when needed
- Optional values return `undefined` (not empty strings)

## Performance

- Use `React.memo()` for expensive components
- `useCallback` and `useMemo` only when necessary
