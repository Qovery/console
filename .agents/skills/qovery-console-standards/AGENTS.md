# Qovery Console Standards - Full Guide

This document compiles all Qovery Console coding standards into a single reference. For individual rules, see the `rules/` folder. For the quick reference, see `SKILL.md`.

---

## 1. Project Architecture

This project uses:

- **Nx monorepo** with apps/ and libs/
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Query** for state management
- **Jest** for testing
- **ESLint** with strict rules

### Directory Organization

```
libs/
├── domains/         # Business logic by domain
├── pages/           # Application pages/routes
├── shared/          # Shared code
│   ├── ui/          # Reusable UI components
│   ├── util-*/      # Specialized utilities
│   └── interfaces/  # Shared types
```

### Layer Boundaries

- `apps/` reference `libs/`; never the reverse.
- `data-access` libs contain API wiring only.
- `feature` libs contain business components.
- `ui` libs contain reusable presentation components.
- Utilities that can be shared must live in `@qovery/shared/util-js` and be imported directly (never re-export via data-access).
- Respect Nx architecture (no circular imports).
- Use Nx generators to create new components/libs.

### Code Placement

- Before adding a folder or abstraction, follow comparable code in the same domain. A generic name alone does not make a helper shared.
- Domain feature libs: hooks in `src/lib/hooks/use-<name>/`, domain-specific pure helpers in `src/lib/utils/`. Do not create a second `hooks/` directory inside a feature folder.
- Generic helpers go to the shared library that owns their concern, or `@qovery/shared/util-js`.
- Create a dedicated library only for a cohesive concept (types, behavior, or UI) reused across domains with no existing owner. Choose its Nx layer from its real dependencies and callers.
- `@qovery/shared/console-shared` is legacy: add nothing new to it. Existing usages can stay; do not migrate them as part of an unrelated change.

---

## 2. React & TypeScript Standards

### Import Rules

- ALWAYS use inline type imports: `import { type MyType, myFunction } from './module'`
- Respect import order according to `.eslintrc.json`
- Use `@qovery/*` aliases defined in `tsconfig.base.json`
- DO NOT import directly from `react` (destructure React)
- Use `@qovery/shared/util-tests` instead of `@testing-library/react`

### React Components

- Functional components only.
- No explicit `React.FC`.
- Destructure props directly in parameters.
- Props interface named `<ComponentName>Props`.
- Named exports only (no default exports).
- Use `clsx` (from `clsx`) for conditional classes and `twMerge` (from `@qovery/shared/util-js`) to resolve conflicting Tailwind classes, such as defaults and a caller's `className`.
- Prefer Radix UI components when available.

### Route Parameters

- In a component scoped to a TanStack Router route, read identifiers already present in the URL with `useParams({ strict: false })`.
- Do not pass `organizationId`, `projectId`, `environmentId`, `clusterId`, or `serviceId` through route/page props solely so a descendant can fetch its own data.
- Default optional route parameters when a downstream hook requires a string, for example: `const { organizationId = '', clusterId = '' } = useParams({ strict: false })`.
- Keep identifiers as explicit props when the component is reusable outside that route, must render an arbitrary resource, or the identifier is not a route parameter.
- In unit tests, mock `useParams` with the relevant route identifiers and verify their use when it is part of the component contract.

### State Management

- Use React Query for API calls and server state.
- Keep React state local and minimal.
- Prefer `ts-pattern` for branching logic.
- Use discriminated unions for complex flows.

### TypeScript

- Avoid `any` and `as any`; keep types narrow.
- Use `unknown` + type guards when needed.
- Optional values return `undefined` (not empty strings).

### Performance

- Use `React.memo()` for expensive components.
- `useCallback` and `useMemo` only when necessary.

---

## 3. Styling Standards

### TailwindCSS Usage

- TailwindCSS only (no CSS modules or styled-components in new code).
- Use utilities from `@qovery/shared/ui` when available.
- Mobile-first responsive design.
- Use `clsx` (from `clsx`) for conditional classes and `twMerge` (from `@qovery/shared/util-js`) to resolve conflicting Tailwind classes, such as defaults and a caller's `className`.

### Component Styling

- Prefer Radix UI components for accessibility.
- Consistent spacing using Tailwind scale.
- Use CSS variables for theme colors.
- Avoid inline styles unless explicitly justified in PR description.

### Responsive Design

- Mobile-first approach.
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
- Test on multiple screen sizes.
- Ensure touch-friendly interfaces.

### Accessibility

- Follow `jsx-a11y` rules.
- Use semantic HTML elements.
- Provide proper ARIA labels.
- Test with screen readers.
- Ensure keyboard navigation works.

---

## 4. Testing Standards

### Test Setup

- Use `renderWithProviders` from `@qovery/shared/util-tests`.
- In React tests, do not use `fireEvent`; treat it as deprecated in this repository. Use awaited `userEvent` interactions instead.
- Allow exceptions only when `userEvent` cannot represent the browser event, and document why.
- Unit tests are mandatory for business logic.
- Snapshots for complex UI components.

### Test Structure

- Arrange-Act-Assert pattern.
- Descriptive test names.
- Group related tests with `describe` blocks.
- Use `beforeEach` for common setup.

### Mocking

- Mock external dependencies appropriately.
- Avoid over-mocking -- test real behavior when possible.

### Coverage

- Focus on critical paths and edge cases.
- Test user interactions, not implementation details.
- Ensure error states are covered.
- Cover success, error, and edge states for every business rule you add or change.

---

## 5. Naming Conventions

### File Naming

- **Components**: Snake case (`user-profile.tsx`)
- **Hooks**: Snake case with `use` prefix (`use-user.ts`)
- **Utilities**: Snake case (`format-date.ts`)
- **Types/Interfaces**: PascalCase with `Props` suffix for interfaces if needed
- **Types**: PascalCase with `Type` suffix
- **Enums**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

### Variable Naming

- **Variables**: camelCase
- **Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefix with underscore `_privateMember`

### Component Structure

- Export components as named exports.
- Props interface should match component name + `Props`.
- Use descriptive, self-documenting names.
- Avoid abbreviations unless commonly understood.

### Comments

- Avoid comments unless absolutely necessary.
- Comments in English only.

---

## 6. Development Commands & Workflows

### Daily Development

```bash
yarn start                    # Start console app
yarn storybook               # Start Storybook
yarn test                    # Run all tests
npx nx format:write          # Format code
npx nx run-many --all --target=lint --parallel  # Lint all projects
yarn build                   # Production build
```

### Nx Commands

```bash
npx nx generate @nx/react:component MyComponent
npx nx generate @nx/react:library my-lib
npx nx test my-project
npx nx lint my-project
npx nx build my-project
npx nx graph
```

### Package Management

- **Package Manager**: Yarn Berry (via corepack); never use npm.
- Run `yarn install` after pulling changes.
- Update dependencies carefully and test thoroughly.

### Git Workflow

- Conventional commits: `feat|fix|chore(scope): message`.
- Create feature branches from `staging`.
- Squash commits when merging PRs.

### Environment Setup

- Node.js 24 LTS: `nvm use`.
- IDE configurations for ESLint and Prettier are included.

---

## 7. Pre-commit Verification Workflow

### Commit Message Format

Semantic-release with conventional commits: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Required Checks Before Commit

1. **Format**: `npx nx format:check` (fix with `npx nx format:write`)
2. **Tests**: `yarn test --passWithNoTests`
3. **Snapshots**: Review any `.snap` changes carefully
4. **Lint**: `npx nx run-many --all --target=lint --parallel`

### Quality Standards

- No linting errors allowed.
- All tests must pass.
- Code must be properly formatted.
- Snapshot changes must be intentional and reviewed.

---

## 8. Implementation & Review Decisions

### Keep Shared Changes Necessary

- Every new prop, abstraction, or shared-component change needs a concrete caller or behavior today. No props or tokens for hypothetical future needs.
- Prefer the existing API when it covers the need. When extending, keep existing callers working and check the behavior in their flows, not only in the new screen.

### Separate Business Rules from Rendering

- Keep payload construction, API parsing, and business transformations in domain hooks or helpers that can be tested on their own, not in rendering components.
- Prefer typed API fields over parsing opaque payloads. If the contract cannot change, parse and validate once at the domain boundary.
- An action's label, icon, and description must describe the same operation. A neutral icon shared by several operations is fine.
- Name helpers after the resource or capability they identify, not after a version, rollout, or feature flag.

### Choose State Ownership Explicitly

- Derive values from props or state instead of copying them into state.
- Use controlled inputs when the caller owns the value; use default values only for initialization.
- Reserve effects for synchronization with external systems. See the `react-useeffect` skill for alternatives.

### Validate and Review Proportionally

- Test the behavior and boundaries the change affects, including invalid or legacy API data when relevant. Extract complex pure logic for direct tests; small expressions do not need extraction.
- Classify each finding as a **bug** (give the concrete trigger and consequence), a **convention** departure (cite the rule or comparable code), or an optional **suggestion**. Only bugs are blocking by default.
- Check current callers and comparable implementations before recommending a new abstraction or shared change.
- Treat automated review findings and "resolved" labels as leads, not proof: check the fix against the current diff before closing a finding.

### Write Actionable Review Rules

When adding a rule, state its scope, the behavior to flag, why it matters, and legitimate exceptions. Prefer checks lint does not already enforce, and avoid generalizing a rule from a single PR.
