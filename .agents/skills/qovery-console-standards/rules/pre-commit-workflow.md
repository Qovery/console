---
title: Pre-commit Verification Workflow
impact: HIGH
tags: [pre-commit, quality, lint, test, format, conventional-commits]
---

# Pre-commit Verification Workflow

## Commit Message Format

This project uses **semantic-release** with conventional commit format:

### Format Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
# Features
feat(button): add loading state animation
feat(auth): implement OAuth2 login flow

# Bug fixes
fix(modal): prevent background scroll when open
fix(api): handle network timeout errors

# Other types
docs(readme): update installation instructions
style(header): improve responsive layout
refactor(utils): simplify date formatting function
test(user-service): add integration tests
chore(deps): update react to v18.2.0
```

### Required Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Scope Guidelines

- Use component name: `button`, `modal`, `header`
- Use feature area: `auth`, `api`, `routing`
- Use domain: `user-management`, `billing`

## Required Checks Before Commit

### 1. Format Check

```bash
npx nx format:check
```

If failed: Run `npx nx format:write` to fix formatting

### 2. Tests

```bash
yarn test --passWithNoTests
```

All tests must pass before committing

### 3. Snapshot Verification

```bash
git diff --name-only --cached | grep -E '\.snap$'
```

Review any snapshot changes carefully

### 4. Lint Check

```bash
npx nx run-many --all --target=lint --parallel
```

Fix all linting errors before committing

## Quality Standards

- No linting errors allowed
- All tests must pass
- Code must be properly formatted
- Snapshot changes must be intentional and reviewed
