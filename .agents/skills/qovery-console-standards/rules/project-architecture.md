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
- Reusable generic helpers belong in the shared library that owns their concern; use `@qovery/shared/util-js` when no specialized shared library fits. Import them directly, never re-export them via data-access

## Code Placement

- Before adding a folder or abstraction, follow comparable code in the same domain. A generic name alone does not make a helper shared.
- Domain feature libs: hooks in `src/lib/hooks/use-<name>/`, domain-specific pure helpers in `src/lib/utils/`. Do not create a second `hooks/` directory inside a feature folder.
- For generic helpers, prefer the existing shared library that owns their concern; otherwise use `@qovery/shared/util-js`. Reuse across callers in one domain does not make a domain-specific helper generic.
- Create a dedicated library only for a cohesive concept (types, behavior, or UI) reused across domains with no existing owner. Choose its Nx layer from its real dependencies and callers.
- `@qovery/shared/console-shared` is legacy: add nothing new to it. Existing usages can stay; do not migrate them as part of an unrelated change.

## Important Rules

- Respect Nx architecture (no circular imports)
- Use Nx generators to create new components/libs
- Keep domain logic isolated within its domain folder
