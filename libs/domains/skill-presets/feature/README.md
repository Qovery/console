# Skill presets

Organization settings > AI settings > Skill presets. Admins decide how their members' coding agents use Qovery: which Qovery skills they load, team instructions on top, the organization's own skills, and who receives each preset.

- `data-access`: types, a temporary API module (`skill-presets.api.ts`) to swap for the generated client once the endpoints are in qovery-openapi-spec, React Query keys, and the in-browser mock.
- `feature`: list, assignments, skill loads, usage, template gallery, editor, history.

## Run it with mock data

The mock only exists in builds made with `NX_PUBLIC_SKILL_PRESETS_MOCK=true` (local runs and preview environments). Without the flag, the URL changes nothing. Every other Console page keeps using the real API.

```sh
NX_PUBLIC_SKILL_PRESETS_MOCK=true yarn start
```

Then open `/organization/<id>/settings/skill-presets?mockSkillPresets=<scenario>`. The scenario sticks for the browser tab, the data is stateful (create, edit, delete and restore add revisions and audit entries) and resets on reload. A "Mock data" bar with a scenario switcher shows on every page while the mock is on. `?mockSkillPresets=off` goes back to the API for the tab.

| Scenario             | What it shows                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `empty`              | No preset yet: empty state, template gallery, first create                                                                                                                     |
| `typical` (default)  | Three presets (organization default on Full base, Lean for the Devops role, None base with two own skills for two members), revisions by several editors, about 40 skill loads |
| `conflicts`          | Typical, plus a preset holding the Admin role and a member: assigning them again is blocked in the form, and the API answers 409                                               |
| `security-rejection` | Typical, plus a "Copy unsafe sample" button: paste it in any text field and save to get a 422 with findings                                                                    |
| `large`              | 40 presets, more than 100 revisions on one preset, 600 skill loads, a 60 KB skill                                                                                              |
| `errors`             | The preset list answers 500                                                                                                                                                    |
| `slow`               | Every response takes 2 seconds                                                                                                                                                 |
| `member`             | A member without admin rights: admin endpoints answer 403 and the page shows what their own agent receives                                                                     |

The mock runs a partial port of q-core's content inspector, for testing only. q-core stays the only gate.
