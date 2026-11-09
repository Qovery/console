---
title: React & TypeScript Standards
impact: HIGH
tags: [react, typescript, components, imports, state]
---

# React & TypeScript Standards

## Import Rules

- ALWAYS use inline type imports: `import { type MyType, myFunction } from './module'`
- Respect import order according to `.prettierrc`
- Use `@qovery/*` aliases defined in `tsconfig.base.json`
- DO NOT import directly from `react` (destructure React)
- Use `@qovery/shared/util-tests` instead of `@testing-library/react`

## React Components

- Functional components only
- No explicit `React.FC`
- Destructure props directly in parameters
- Props interface named `<ComponentName>Props`
- Named exports only (no default exports)
- Use `clsx` (from `clsx`) for conditional classes and `twMerge` (from `@qovery/shared/util-js`) to resolve conflicting Tailwind classes, such as defaults and a caller's `className`
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

## API Integrations

Apply these rules when adding or reviewing API reads and mutations, including integrations with services outside the main Qovery API:

- Before adding requests, inspect a comparable data-access client and its feature hooks. For ordinary CRUD, follow `libs/domains/organizations/data-access/src/lib/domains-organizations-data-access.ts` and `libs/domains/organizations/feature/src/lib/hooks/use-webhooks/use-webhooks.ts` / `libs/domains/organizations/feature/src/lib/hooks/use-create-webhook/use-create-webhook.ts`.
- Keep request wiring, request/response types, and query definitions in the owning data-access library. Consume them through feature hooks using `useQuery` and `useMutation`, with query keys from `@qovery/state/util-queries`, targeted cache invalidation, and the existing notification metadata where applicable.
- Reuse the existing authenticated client. For a separate service, follow the dedicated Axios instance in `libs/shared/devops-copilot/data-access/src/lib/domains-devops-copilot-data-access.ts` and its `useAuthInterceptor` registration in `apps/console/src/main.tsx`. A different base URL or missing generated SDK does not justify bypassing shared authentication and error handling.
- Do not put ordinary CRUD `fetch`/Axios calls, token acquisition, or duplicated request/error handling in rendering components. Do not recreate query loading, error, or refetch behavior with `useEffect`, local server-data state, and manual reload callbacks; keep local state for form drafts and UI interactions.
- Exceptions require a concrete transport need, such as streaming responses, or a browser flow such as an OAuth navigation or file download. Reuse a comparable implementation, keep transport logic in data-access and lifecycle logic in hooks, and document why the standard client/query flow does not fit. Preserve authentication, cancellation, and HTTP-error handling appropriate to that flow; a failed request must not become a successful empty result.
- In review, flag parallel request/state machinery that bypasses this foundation and name the existing client/hooks to reuse. Check success, HTTP failure, authentication failure, and cache refresh after mutations when validating the integration.

## TypeScript

- Avoid `any` and `as any`; keep types narrow
- Use `unknown` + type guards when needed
- Optional values return `undefined` (not empty strings)

## Performance

- Use `React.memo()` for expensive components
- `useCallback` and `useMemo` only when necessary
