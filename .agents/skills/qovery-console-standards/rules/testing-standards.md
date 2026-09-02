---
title: Testing Standards
impact: HIGH
tags: [testing, jest, unit-tests, mocking, coverage]
---

# Testing Standards

## Test Setup

- Use `renderWithProviders` from `@qovery/shared/util-tests`
- In React tests, do not use `fireEvent`; treat it as deprecated in this repository. Use awaited `userEvent` interactions instead.
- Allow exceptions only when `userEvent` cannot represent the browser event, and document why.
- Unit tests are mandatory for business logic
- Snapshots for complex UI components

## Test Structure

- Arrange-Act-Assert pattern
- Descriptive test names
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup

## Mocking

- Mock external dependencies appropriately
- Avoid over-mocking -- test real behavior when possible

## Coverage

- Focus on critical paths and edge cases
- Test user interactions, not implementation details
- Ensure error states are covered
- Cover success, error, and edge states for every business rule you add or change
