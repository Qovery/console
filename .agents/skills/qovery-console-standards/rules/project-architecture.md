---
title: Project Architecture
impact: CRITICAL
tags: [architecture, nx, monorepo, structure]
---

# Qovery Console Architecture

## Project Structure

This project uses:

- **Nx monorepo** with apps/ and libs/
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Query** for state management
- **Jest** for testing
- **ESLint** with strict rules

## Directory Organization

```
libs/
├── domains/         # Business logic by domain
├── pages/           # Application pages/routes
├── shared/          # Shared code
│   ├── ui/          # Reusable UI components
│   ├── util-*/      # Specialized utilities
│   └── interfaces/  # Shared types
```

## Layer Boundaries

- `apps/` reference `libs/`; never the reverse
- `data-access` libs contain API wiring only
- `feature` libs contain business components
- `ui` libs contain reusable presentation components
- Utilities that can be shared must live in `@qovery/shared/util-js` and be imported directly (never re-export via data-access)

## Important Rules

- Respect Nx architecture (no circular imports)
- Use Nx generators to create new components/libs
- Keep domain logic isolated within its domain folder
