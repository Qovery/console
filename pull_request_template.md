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
<!-- step-by-step instructions for reviewers -->

## What

- <!-- bullet list of changes -->

## Why

- <!-- reasons / problems solved -->

## How

- <!-- highlight the key implementation details -->

## Testing

- [ ] Changes tested locally in the relevant Console or Storybook
- [ ] `yarn test` or `yarn test -u` (if you need to regenerate snapshots)
- [ ] `yarn format`
- [ ] `yarn lint`

## Screenshots / Recordings

<!--
| Before                              | After                      |
| ----------------------------------- | -------------------------- |
| drag & drop image optional | drag & drop image |
-->

## Additional Notes

<!-- Optional extra context, rollout plan, feature flags, etc. -->

## PR Checklist

- [ ] I followed naming, styling, and TypeScript rules (see `.cursor/rules`)
- [ ] I performed a self-review (diff inspected, dead code removed)
- [ ] I titled the PR using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#commit-message-with-scope) with a scope when possible (e.g. `feat(service): add new Terraform service`) - required for semantic-release
- [ ] I only kept comments that are necessary and in English (watch for useless AI comments)
- [ ] I involved a designer to validate UI changes if I am not a designer
- [ ] I covered new business logic with tests (unit)
- [ ] I confirmed CI is green (Codecov red can be accepted)
- [ ] I reviewed and executed locally any AI-assisted code
