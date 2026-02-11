---
title: Naming Conventions
impact: MEDIUM
tags: [naming, files, variables, components, constants]
---

# Naming Conventions

## File Naming

- **Components**: Snake case (`user-profile.tsx`)
- **Hooks**: Snake case with `use` prefix (`use-user.ts`)
- **Utilities**: Snake case (`format-date.ts`)
- **Types/Interfaces**: PascalCase with `Props` suffix for interfaces if needed
- **Types**: PascalCase with `Type` suffix
- **Enums**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

## Variable Naming

- **Variables**: camelCase
- **Functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Private members**: prefix with underscore `_privateMember`

## Component Structure

- Export components as named exports
- Props interface should match component name + `Props`
- Use descriptive, self-documenting names
- Avoid abbreviations unless commonly understood

## Comments

- Avoid comments unless absolutely necessary
- Comments in English only
