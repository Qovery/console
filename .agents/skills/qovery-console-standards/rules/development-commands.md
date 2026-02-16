---
title: Development Commands & Workflows
impact: MEDIUM
tags: [commands, yarn, nx, git, workflow, setup]
---

# Development Commands & Workflows

## Daily Development

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

## Nx Commands

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
```

## Package Management

- **Package Manager**: Yarn Berry (via corepack); never use npm
- Always use `yarn` instead of `npm`
- Run `yarn install` after pulling changes
- Update dependencies carefully and test thoroughly

## Git Workflow

- Conventional commits: `feat|fix|chore(scope): message`
- Create feature branches from `staging`
- Use descriptive commit messages
- Squash commits when merging PRs

## Environment Setup

- Node.js 23: `nvm use 23`
- Use `nvm use` to switch to correct Node version
- IDE configurations for ESLint and Prettier are included
