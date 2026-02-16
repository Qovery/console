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
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes.
- Prefer Radix UI components when available.

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
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes.

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
- Prefer `userEvent` over `fireEvent`.
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

- Node.js 23: `nvm use 23`.
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
