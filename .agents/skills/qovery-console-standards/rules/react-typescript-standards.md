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

## Route Parameters

- In a component scoped to a TanStack Router route, read identifiers already present in the URL with `useParams({ strict: false })`.
- Do not pass `organizationId`, `projectId`, `environmentId`, `clusterId`, or `serviceId` through route/page props solely so a descendant can fetch its own data.
- Default optional route parameters when a downstream hook requires a string, for example: `const { organizationId = '', clusterId = '' } = useParams({ strict: false })`.
- Keep identifiers as explicit props when the component is reusable outside that route, must render an arbitrary resource, or the identifier is not a route parameter.
- In unit tests, mock `useParams` with the relevant route identifiers and verify their use when it is part of the component contract.

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
