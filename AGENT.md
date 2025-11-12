# AI Agent Development Guidelines

This document provides guidelines for AI agents (Claude, GitHub Copilot, Cursor, etc.) when working on this codebase to ensure consistency with team practices and architectural decisions.

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
   - Can re-export utility functions from shared libraries for convenience

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
// libs/domains/organizations/data-access/src/lib/domains-organizations-data-access.ts
import { is2025Plan } from '@qovery/shared/util-js'

// libs/shared/util-js/src/lib/format-plan-display.ts
export function is2025Plan(plan?: string): boolean {
  return plan?.toUpperCase().includes('2025') ?? false
}

export { is2025Plan } // Re-export for convenience
```

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

## TypeScript Best Practices

1. **Use proper types over type assertions**

   - Prefer `undefined` over empty string (`''`) for optional values
   - Use `undefined` for react-hook-form's optional form fields
   - Only use `as` type assertions when absolutely necessary

2. **Example:**

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

### Before Committing

1. **Format code:**

   ```bash
   npx nx format:check
   npx nx format:write  # if needed
   ```

2. **Run linter:**

   ```bash
   npx nx affected --target=lint
   ```

3. **Run tests:**

   ```bash
   npx nx affected --target=test
   ```

4. **Check TypeScript:**
   ```bash
   npx nx affected --target=build
   ```

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

- [ ] Utility functions are in the appropriate shared library
- [ ] Complex conditional logic uses `ts-pattern` instead of nested ternaries
- [ ] Functions have clear, descriptive names
- [ ] JSDoc comments are added for exported functions
- [ ] Proper separation of concerns is maintained
- [ ] Type safety is preserved without excessive `as` assertions
- [ ] Code is formatted (`npx nx format:check` passes)
- [ ] Linter passes (`npx nx affected --target=lint` passes)
- [ ] Tests pass (`npx nx affected --target=test` passes)
- [ ] Used `yarn` (not `npm`) for all package operations
- [ ] Commit messages follow conventional commits format

## Resources

- [ts-pattern documentation](https://github.com/gvergnaud/ts-pattern)
- [Nx workspace documentation](https://nx.dev)
- [Yarn Berry documentation](https://yarnpkg.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
