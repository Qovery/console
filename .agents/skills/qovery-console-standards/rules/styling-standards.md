---
title: Styling Standards
impact: HIGH
tags: [tailwind, css, styling, accessibility, radix, responsive]
---

# Styling Standards

## TailwindCSS Usage

- TailwindCSS only (no CSS modules or styled-components in new code)
- Use utilities from `@qovery/shared/ui` when available
- Mobile-first responsive design
- Use `clsx` or `twMerge` from `@qovery/shared/util-js` for conditional classes

## Component Styling

- Prefer Radix UI components for accessibility
- Consistent spacing using Tailwind scale
- Use CSS variables for theme colors
- Avoid inline styles unless explicitly justified in PR description

## Responsive Design

- Mobile-first approach
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple screen sizes
- Ensure touch-friendly interfaces

## Accessibility

- Follow `jsx-a11y` rules
- Use semantic HTML elements
- Provide proper ARIA labels
- Test with screen readers
- Ensure keyboard navigation works
