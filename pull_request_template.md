<!--
Thanks for contributing to the Qovery Console.

Before opening the PR:
- A JIRA ticket exists and you are assigned to it (unless it is a trivial fix)
- Changes were tested locally (app and/or Storybook as relevant)
- `yarn test` passes
- `npx nx format:check` pass
- The code follows the rules under `.cursor/rules`
-->

## Summary

**Issue**: <!-- QOV-1234 -->

<!-- Brief description of what this PR does -->

## What

- <!-- bullet list of changes -->

## Why

- <!-- reasons / problems solved -->

## How

- <!-- highlight the key implementation details -->

## Testing

- [ ] Changes tested locally in the relevant Console or Storybook
- [ ] `yarn test` or `yarn test -u` if you need to regenerate snapshots
- [ ] `npx nx format:check`
- [ ] Additional targeted tests (specify below)

### Test Instructions

1. <!-- step-by-step instructions for reviewers -->

## Screenshots / Recordings

<!--
| Before                              | After                      |
| ----------------------------------- | -------------------------- |
| drag & drop image optional | drag & drop image |
-->

## Additional Notes

<!-- Optional extra context, rollout plan, feature flags, etc. -->

## PR Checklist

- [ ] Code follows naming, styling, and TypeScript rules (see `.cursor/rules`)
- [ ] Self-review performed (diff inspected, dead code removed)
- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-scope) with a scope when possible (e.g., `feat(service): add new Terraform service`) - required for semantic-release
- [ ] Comments added only where necessary and in English (be careful with useless AI comment)
- [ ] UI changes validated with a designer if you are not a designer
- [ ] New business logic covered by tests (unit/UI)
- [ ] All green with the CI (note: if Codecov red can be accepted)
- [ ] If AI assistance was used, the generated code was reviewed and executed locally
