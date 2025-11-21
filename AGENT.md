# AI Agent Development Guidelines

This document provides guidelines for AI agents (Claude, GitHub Copilot, Cursor, etc.) when working on this codebase to ensure consistency with team practices and architectural decisions.

## Project Overview

This project uses:

- **Nx monorepo** with apps/ and libs/
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Query** for state management
- **Jest** for testing
- **ESLint** with strict rules
- **Yarn Berry (v3+)** for package management

### Directory Organization

```
libs/
├── domains/         # Business logic by domain
│   ├── */data-access/  # API calls and data fetching
│   ├── */feature/      # Business components
│   └── */ui/           # Domain-specific UI components
├── pages/           # Application pages/routes
├── shared/          # Shared code
│   ├── ui/          # Reusable UI components
│   ├── util-*/      # Specialized utilities
│   └── interfaces/  # Shared types
```

**Important Notes:**

- Respect Nx architecture (no circular imports)
- Use Nx generators to create new components/libs
- `data-access` libs contain API logic only
- `feature` libs contain business components
- `ui` libs contain reusable components

## Architecture Guidelines

### Utility Functions Location

**Rule:** Utility functions should be placed in the appropriate shared library based on their purpose, not in domain-specific data-access layers.

#### Placement Rules:

1. **General utility functions** (formatting, validation, conversion):

   - Location: `/libs/shared/util-js/src/lib/`
   - Examples: `format-plan-display.ts`, `pluralize.ts`, `uppercase-first-letter.ts`
   - These functions should be pure and have no external dependencies on domain logic

2. **Data-access layer** (`/libs/domains/*/data-access/`):

   - Should contain only API calls, data fetching logic, and domain-specific data transformations
   - Should NOT contain utility functions that could be reused across domains
   - **Avoid unnecessary re-exports:** Import utility functions directly from `shared/util-js` in consuming files instead of re-exporting them through data-access layers
   - Only re-export domain-specific types (like enums) when they're tightly coupled to the domain's API

3. **Domain-specific utilities**:
   - If a utility function is truly domain-specific and tightly coupled to domain logic, it can live in the domain's feature or data-access layer
   - However, if there's any chance it could be reused elsewhere, prefer placing it in shared utilities

#### Example:

❌ **Incorrect** - Placing utility functions in data-access:

```typescript
// libs/domains/organizations/data-access/src/lib/domains-organizations-data-access.ts
export function is2025Plan(plan?: string): boolean {
  return plan?.toUpperCase().includes('2025') ?? false
}
```

✅ **Correct** - Placing utility functions in shared/util-js:

```typescript
// libs/pages/settings/src/lib/feature/plan-selection-modal-feature.tsx
import { is2025Plan } from '@qovery/shared/util-js'

// libs/shared/util-js/src/lib/format-plan-display.ts
export function is2025Plan(plan?: string): boolean {
  return plan?.toUpperCase().includes('2025') ?? false
}
```

**Note:** Import utility functions directly from `@qovery/shared/util-js` in consuming files rather than re-exporting them through data-access layers. This makes the architecture clearer and more explicit about where shared utilities come from.

### Pattern Matching with ts-pattern

**Rule:** Prefer using `ts-pattern` library over nested ternary operators or long if-else chains for complex conditional logic.

#### Benefits:

- Improved readability and maintainability
- Type safety with exhaustive checking
- Better pattern matching capabilities
- More declarative code style

#### When to Use ts-pattern:

1. **Multiple conditional branches** based on string matching
2. **Type discrimination** in union types
3. **Complex nested conditions**
4. **Mapping values** from one enum/type to another

#### Example:

❌ **Avoid** - Nested ternary operators:

```typescript
const normalizedPlan = is2025Plan(currentPlan)
  ? currentPlan?.toUpperCase().includes('USER')
    ? PlanEnum.USER_2025
    : currentPlan?.toUpperCase().includes('TEAM')
      ? PlanEnum.TEAM_2025
      : currentPlan?.toUpperCase().includes('BUSINESS')
        ? PlanEnum.BUSINESS_2025
        : undefined
  : undefined
```

✅ **Prefer** - Using ts-pattern:

```typescript
import { P, match } from 'ts-pattern'

function normalizePlanSelection(currentPlan?: string): PlanEnum | undefined {
  if (!is2025Plan(currentPlan)) {
    return undefined
  }

  return match(currentPlan?.toUpperCase())
    .with(P.string.includes('USER'), () => PlanEnum.USER_2025)
    .with(P.string.includes('TEAM'), () => PlanEnum.TEAM_2025)
    .with(P.string.includes('BUSINESS'), () => PlanEnum.BUSINESS_2025)
    .with(P.string.includes('ENTERPRISE'), () => PlanEnum.ENTERPRISE_2025)
    .otherwise(() => undefined)
}
```

## Code Organization Best Practices

### Separation of Concerns

1. **Extract complex logic into separate functions**

   - Keep component logic simple and readable
   - Extract complex conditional logic into well-named utility functions
   - Add JSDoc comments to explain the purpose and behavior

2. **Layer responsibilities**
   - UI components: Presentation and user interaction
   - Feature components: Business logic and state management
   - Data-access: API calls and data fetching
   - Utilities: Pure functions for formatting, validation, transformation

### Testing Considerations

When adding new utility functions:

1. Add unit tests in a `.spec.ts` file alongside the utility
2. Test edge cases (undefined, null, empty strings)
3. Document expected behavior in tests

## React & TypeScript Standards

### Import Rules

- **ALWAYS use inline type imports:** `import { type MyType, myFunction } from './module'`
- Respect import order according to `.eslintrc.json`
- Use `@qovery/*` aliases defined in `tsconfig.base.json`
- DO NOT import directly from `react` (destructure React)
- Use `@qovery/shared/util-tests` instead of `@testing-library/react`

### React Components

- **Functional components only** (no class components)
- **No explicit `React.FC`** type annotation
- **Destructure props directly** in function parameters
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes
- Prefer Radix UI components when available for accessibility

### Component Structure

- Export components as named exports
- Props interface should match component name + `Props` suffix
- Use descriptive, self-documenting names
- Avoid abbreviations unless commonly understood

### State Management

- Use React Query for API calls and server state
- Use `React.memo()` for expensive components
- Use `useCallback` and `useMemo` only when necessary (avoid premature optimization)

### TypeScript Best Practices

1. **Avoid `any` types**

   - **Never use `any` type** - it defeats TypeScript's type safety
   - Always use proper types from packages or define custom types
   - Use `unknown` for truly unknown types (then narrow with type guards)
   - Avoid `as any` casts - they bypass all type checking
   - When integrating third-party libraries, check for `@types` packages or define custom interfaces
   - Example: Use `CbInstance` from `@chargebee/chargebee-js-types` instead of `any`

2. **Use proper types over type assertions**

   - Prefer `undefined` over empty string (`''`) for optional values
   - Use `undefined` for react-hook-form's optional form fields
   - Only use `as` type assertions when absolutely necessary

3. **Example:**

❌ **Avoid:**

```typescript
function normalizePlan(plan?: string): PlanEnum | '' {
  return '' as PlanEnum // Type assertion abuse
}

const methods = useForm<{ plan: PlanEnum }>({
  defaultValues: { plan: normalizedPlan as PlanEnum },
})
```

✅ **Prefer:**

```typescript
function normalizePlan(plan?: string): PlanEnum | undefined {
  return undefined // Proper optional type
}

const methods = useForm<{ plan: PlanEnum }>({
  defaultValues: { plan: normalizedPlan as PlanEnum },
})
```

3. **Use discriminated unions** for complex conditional types

4. **Prefer readonly types** for constants and configuration

## Naming Conventions

### File Naming

- **Components**: Snake case (`user-profile.tsx`)
- **Hooks**: Snake case with `use` prefix (`use-user.ts`)
- **Utilities**: Snake case (`format-date.ts`)
- **Test files**: Match source file name with `.spec.ts` or `.spec.tsx` extension

### Variable Naming

- **Variables**: camelCase
- **Functions**: camelCase
- **Classes**: PascalCase
- **Types/Interfaces**: PascalCase
  - Props interfaces: Component name + `Props` suffix (e.g., `UserProfileProps`)
  - Type aliases: PascalCase with `Type` suffix if needed
- **Enums**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: Prefix with underscore `_privateMember`

### Comments

- Avoid comments unless absolutely necessary (code should be self-documenting)
- Comments in English only
- Use JSDoc for exported functions and complex logic

## Styling Standards

### TailwindCSS Usage

- **TailwindCSS only** (no CSS modules or styled-components in new code)
- Use utilities from `@qovery/shared/ui` when available
- **Mobile-first responsive design**
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes

### Component Styling

- Prefer Radix UI components for accessibility
- Consistent spacing using Tailwind scale
- Use CSS variables for theme colors
- Avoid inline styles

### Responsive Design

- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple screen sizes
- Ensure touch-friendly interfaces

### Accessibility

- Follow `jsx-a11y` rules
- Use semantic HTML elements
- Provide proper ARIA labels
- Test with screen readers
- Ensure keyboard navigation works

## Testing Standards

### Test Setup

- Use `renderWithProviders` from `@qovery/shared/util-tests`
- Prefer `userEvent` over `fireEvent` for user interactions
- Unit tests are mandatory for business logic
- Snapshots for complex UI components

### Test Structure

- **Arrange-Act-Assert pattern**
- Descriptive test names (describe what the test does)
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup

### Mocking

- Mock external dependencies appropriately
- Avoid over-mocking - test real behavior when possible
- Mock API calls using React Query's testing utilities

### Coverage

- Focus on critical paths and edge cases
- Test user interactions, not implementation details
- Ensure error states are covered
- All tests must pass before committing

## Package Management

### This Project Uses Yarn Berry

**Important:** This project uses Yarn Berry (Yarn v3+), **not npm**.

#### Key Rules:

1. **Never run `npm install`** - This will break the yarn.lock file
2. **Always use `yarn install`** to install dependencies
3. **Enable Yarn via corepack:** `corepack enable`
4. **Use Yarn for all package operations:**

   - Install: `yarn install`
   - Add package: `yarn add package-name`
   - Remove package: `yarn remove package-name`
   - Run scripts: `yarn start`, `yarn test`, etc.

5. **If dependencies get corrupted:**
   ```bash
   git checkout HEAD -- yarn.lock
   yarn install
   ```

## Code Quality

### Formatting

**Always run formatting checks before committing:**

```bash
npx nx format:check
```

If formatting issues are found, fix them:

```bash
npx nx format:write
```

### Import Order

Prettier will automatically sort imports. The general order is:

1. External packages
2. Internal packages from `@qovery/*`
3. Relative imports
4. Type imports (if using separate import statements)

Example:

```typescript
import { PlanEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { P, match } from 'ts-pattern'
// ← Prettier sorts P before match
import { is2025Plan } from '@qovery/domains/organizations/data-access'
import { useChangePlan } from '@qovery/domains/organizations/feature'
import PlanSelectionModal from '../../../ui/page-organization-billing-summary/plan-selection-modal/plan-selection-modal'
```

## Commit Guidelines

### Commit Message Format

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `style`: Code style changes (formatting)

**Example:**

```
refactor(organizations): move plan utilities to shared layer

Move is2025Plan, formatPlanName, and formatPlanDisplay functions from
the organizations data-access layer to shared/util-js as they are
general-purpose utilities that can be reused across domains.

Addresses PR feedback: https://github.com/Qovery/console/pull/2118

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### When Addressing PR Feedback

1. Create a separate commit for each distinct change/refactor
2. Use descriptive commit messages that explain the "why"
3. Reference the PR or issue in the commit message when applicable
4. Keep commits focused and atomic

## Development Workflow

### Before Starting Work

1. Make sure you're on the correct Node.js version:

   ```bash
   nvm use 23
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a new branch from staging:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feat/your-feature-name
   ```

### Daily Development Commands

```bash
# Start development server
yarn start                    # Start console app
yarn storybook               # Start Storybook

# Code quality
yarn test                    # Run all tests
npx nx format:write          # Format code
npx nx run-many --all --target=lint --parallel  # Lint all projects

# Build
yarn build                   # Production build
```

### Nx Commands

```bash
# Generate new components/libs
npx nx generate @nx/react:component MyComponent
npx nx generate @nx/react:library my-lib

# Run specific project commands
npx nx test my-project
npx nx lint my-project
npx nx build my-project

# Dependency graph
npx nx graph

# Run affected projects only
npx nx affected --target=lint
npx nx affected --target=test
npx nx affected --target=build
```

### Git Workflow

- **Conventional commits** required (enforced by semantic-release)
- Create feature branches from `staging`
- Use descriptive commit messages
- Squash commits when merging PRs

## Pre-commit Verification Workflow

This project uses **semantic-release** with conventional commit format. Follow these steps before every commit:

### Required Checks Before Commit

#### 1. Format Check

```bash
npx nx format:check
```

If failed: Run `npx nx format:write` to fix formatting

#### 2. Tests

```bash
yarn test --passWithNoTests
```

All tests must pass before committing

#### 3. Snapshot Verification

```bash
git diff --name-only --cached | grep -E '\.snap$'
```

Review any snapshot changes carefully - they must be intentional

#### 4. Lint Check

```bash
npx nx run-many --all --target=lint --parallel
```

Fix all linting errors before committing

### Complete Pre-commit Script

```bash
#!/bin/bash

# 1. Format check
npx nx format:check
if [ $? -ne 0 ]; then
  echo "❌ Format check failed. Run 'npx nx format:write' to fix."
  exit 1
fi

# 2. Tests
yarn test --passWithNoTests
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix failing tests before committing."
  exit 1
fi

# 3. Snapshot check
git diff --name-only --cached | grep -E '\.snap$'
if [ $? -eq 0 ]; then
  echo "⚠️  Snapshot files detected. Review changes carefully."
  echo "Updated snapshots:"
  git diff --name-only --cached | grep -E '\.snap$'
fi

# 4. Lint check
npx nx run-many --all --target=lint --parallel
if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Fix linting errors before committing."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
```

### Quality Standards

- No linting errors allowed
- All tests must pass
- Code must be properly formatted
- Snapshot changes must be intentional and reviewed

### Common Issues and Solutions

#### Issue: "Unable to find eslint"

**Solution:** Clean install dependencies

```bash
rm -rf node_modules
yarn install
```

#### Issue: "Package doesn't seem to be present in your lockfile"

**Solution:** You probably ran `npm install`. Restore yarn.lock:

```bash
git checkout HEAD -- yarn.lock
yarn install
```

#### Issue: Pre-commit hook fails

**Solution:** The project uses Husky and pretty-quick for pre-commit formatting. If it fails:

1. Run `npx nx format:write` manually
2. Re-attempt the commit

## Summary Checklist

Before submitting code, verify:

### Architecture & Code Organization

- [ ] Utility functions are in the appropriate shared library (`shared/util-js`)
- [ ] No circular imports (respect Nx architecture)
- [ ] Proper separation of concerns is maintained (UI/Feature/Data-access layers)
- [ ] Complex conditional logic uses `ts-pattern` instead of nested ternaries

### Naming & Style

- [ ] File names use snake-case (`user-profile.tsx`)
- [ ] Component names use PascalCase
- [ ] Props interfaces have `Props` suffix
- [ ] Functions have clear, descriptive names
- [ ] Constants use UPPER_SNAKE_CASE

### React & TypeScript

- [ ] Inline type imports used: `import { type MyType, myFunction }`
- [ ] Functional components only (no class components, no React.FC)
- [ ] No `any` types used (check for proper types from packages or define custom types)
- [ ] Type safety is preserved without excessive `as` assertions
- [ ] Used `undefined` for optional values (not empty strings)
- [ ] JSDoc comments added for exported functions

### Styling

- [ ] TailwindCSS only (no inline styles or CSS modules)
- [ ] Mobile-first responsive design
- [ ] Accessibility standards followed (ARIA labels, keyboard navigation)
- [ ] Used `clsx` or `twMerge` for conditional classes

### Testing

- [ ] Unit tests added for business logic
- [ ] Tests use `renderWithProviders` from `@qovery/shared/util-tests`
- [ ] Tests use `userEvent` instead of `fireEvent`
- [ ] All tests pass (`yarn test --passWithNoTests`)
- [ ] Snapshot changes are intentional and reviewed

### Code Quality

- [ ] Code is formatted (`npx nx format:check` passes)
- [ ] Linter passes (`npx nx run-many --all --target=lint --parallel`)
- [ ] No ESLint errors or warnings
- [ ] Used `yarn` (not `npm`) for all package operations

### Git & Commits

- [ ] Commit messages follow conventional commits format
- [ ] Commit type is accurate (feat/fix/refactor/docs/test/chore)
- [ ] Commit scope is meaningful
- [ ] Branch created from `staging`

## Resources

- [ts-pattern documentation](https://github.com/gvergnaud/ts-pattern)
- [Nx workspace documentation](https://nx.dev)
- [Yarn Berry documentation](https://yarnpkg.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
