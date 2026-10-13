---
title: Implementation and Review Decisions
impact: HIGH
tags: [architecture, review, api, state]
---

# Implementation and Review Decisions

## Follow the Domain's Existing Structure

Before adding a folder or abstraction, inspect comparable code in the same domain. Place hooks and utilities alongside their existing equivalents. Keep domain-specific helpers in the domain; move genuinely reusable helpers to the appropriate shared library. A generic name alone does not establish shared ownership.

## Keep Shared Changes Necessary

Each new prop, abstraction, or shared-component change should have a concrete caller or behavior it enables. Prefer the existing API when it covers the need. When an extension is necessary, preserve existing callers and check that the behavior makes sense across flows rather than only for the new screen.

## Separate Business Rules from Rendering

Keep substantial payload construction, API parsing, and business transformations in domain helpers or hooks that can be tested independently. Prefer typed API fields over interpreting opaque payloads in rendering components; if the contract cannot change, isolate and validate the parsing at the domain boundary. Keep action labels, icons, and descriptions consistent when introducing a new operation.

Name business helpers after the resource or capability they identify, rather than a version or rollout label. Distinguish resource identity from access controlled by a feature flag.

## Choose State Ownership Explicitly

Derive values from existing props or state when possible. Prefer controlled inputs when the caller owns the current value; use default values for initialization. Avoid effects that copy props into state or write input values into the DOM when React can express the same behavior. Reserve effects for necessary synchronization with external systems.

## Validate and Review Proportionally

Test meaningful behavior and boundaries affected by the change, including invalid or legacy API data where relevant. Extract complex pure logic for direct tests when that makes failures easier to explain; do not require an extraction for every small expression.

Distinguish confirmed bugs, departures from repository conventions, and optional maintainability suggestions. Ground bugs in a concrete trigger and consequence. Verify current callers and comparable implementations before recommending a new abstraction or shared change; do not present personal preferences as blocking requirements.

## Write Actionable Review Rules

When adding or refining a rule, state its applicable scope, the behavior to flag, why it matters, and legitimate exceptions. Include a small example only when it helps disambiguate the rule. Prefer checks about behavior, API contracts, and repository conventions that existing lint rules do not already enforce.

## Verify Automated Review Outcomes

Treat automated findings and resolution labels as evidence to investigate, not as proof. Before declaring a finding fixed, inspect the current diff and the associated fix commit, then verify the reported scenario with an appropriate test or code trace. Explain false positives and exceptions concretely rather than broadening a rule from a single case.

These review principles also follow cubic's guidance on [custom agents](https://docs.cubic.dev/ai-review/custom-agents), [learning exceptions](https://docs.cubic.dev/ai-review/memory-and-learning), and [checking fix commits](https://docs.cubic.dev/analytics/ai-review). They do not require installing a tool or changing review automation.
