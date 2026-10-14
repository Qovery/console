---
title: Implementation and Review Decisions
impact: HIGH
tags: [architecture, review, api, state]
---

# Implementation and Review Decisions

Code placement and library ownership are covered in [project-architecture.md](project-architecture.md#code-placement).

## Keep Shared Changes Necessary

- Every new prop, abstraction, or shared-component change needs a concrete caller or behavior today. No props or tokens for hypothetical future needs.
- Prefer the existing API when it covers the need. When extending, keep existing callers working and check the behavior in their flows, not only in the new screen.

## Separate Business Rules from Rendering

- Keep payload construction, API parsing, and business transformations in domain hooks or helpers that can be tested on their own, not in rendering components.
- Prefer typed API fields over parsing opaque payloads. If the contract cannot change, parse and validate once at the domain boundary.
- An action's label, icon, and description must describe the same operation. A neutral icon shared by several operations is fine.
- Name helpers after the resource or capability they identify, not after a version, rollout, or feature flag.

## Choose State Ownership Explicitly

- Derive values from props or state instead of copying them into state.
- Use controlled inputs when the caller owns the value; use default values only for initialization.
- Reserve effects for synchronization with external systems. See the `react-useeffect` skill for alternatives.

## Validate and Review Proportionally

- Test the behavior and boundaries the change affects, including invalid or legacy API data when relevant. Extract complex pure logic for direct tests; small expressions do not need extraction.
- Classify each finding as a **bug** (give the concrete trigger and consequence), a **convention** departure (cite the rule or comparable code), or an optional **suggestion**. Only bugs are blocking by default.
- Check current callers and comparable implementations before recommending a new abstraction or shared change.
- Treat automated review findings and "resolved" labels as leads, not proof: check the fix against the current diff before closing a finding.

## Write Actionable Review Rules

When adding a rule, state its scope, the behavior to flag, why it matters, and legitimate exceptions. Prefer checks lint does not already enforce, and avoid generalizing a rule from a single PR.
