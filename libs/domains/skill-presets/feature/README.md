# Skill presets

Organization settings > AI settings > Skill presets. Admins decide how their members' coding agents use Qovery: which Qovery skills they load, team instructions on top, the organization's own skills, and who receives each preset.

- `data-access`: types, a temporary API module (`skill-presets.api.ts`) to swap for the generated client once the endpoints are in qovery-openapi-spec, React Query keys.
- `feature`: list, assignments, skill loads, usage, template gallery, editor, history.

## Security review

Every save runs q-core's rule check, then a review by a model on AWS Bedrock. Saves take a few seconds: the button shows "Checking for security…", then "Saving…". Findings say where they came from ("Rule check" or "Model review").

## Who can configure

Only organization owners and admins (q-core's `MANAGE_ORGANIZATION_DATA`; custom roles never have it), plus Qovery staff, as on the other owner and admin settings. The page decides from the organization role in the user's token, like the other owner and admin settings, before making admin-only requests. Anyone else sees a read-only view of what their own agent receives, built from the resolved endpoints.

## Tests

The test suites use the HTTP fixtures in `skill-presets/mock` to cover API responses and errors.
