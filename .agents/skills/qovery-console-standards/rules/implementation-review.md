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
