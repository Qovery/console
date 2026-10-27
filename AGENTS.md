# AI Agent Guide -- Qovery Console

Before working on this repo, read the relevant skills in `.agents/skills/`. Each skill has a `SKILL.md` with a summary and a `rules/` folder with detailed guidelines.

## Skills

| Skill                         | Description                                                            |
| ----------------------------- | ---------------------------------------------------------------------- |
| `qovery-console-standards`    | Architecture, React/TS, styling, testing, naming, workflow, pre-commit |
| `vercel-react-best-practices` | React performance optimization (57 rules)                              |
| `web-design-guidelines`       | UI/UX and accessibility audit                                          |
| `qovery-ui`                   | Design review, component selection, and UI generation for the console  |

For design work, use `/qovery-ui` commands: `/qovery-ui audit` (review existing UI), `/qovery-ui craft` (design something new), `/qovery-ui polish` (spacing/color refinement), `/qovery-ui component` (find the right component). Always read `.claude/design.md` first for the design context and non-negotiables.

Symlinks: `.cursor/skills/` and `.claude/skills/` point to `.agents/skills/`.

## Essential Facts

- **Yarn Berry** only (never npm). `nvm use`.
- Before creating any new branch, run `git fetch origin staging` successfully, then create the branch explicitly from the freshly fetched `origin/staging` (for example, `git switch -c <branch-name> origin/staging`). Never use local `staging` or the current HEAD as a substitute. If fetching fails, do not silently fall back to a stale local reference. Only use another base when the user explicitly requests it.
- Before opening a PR targeting `staging`, fetch `origin/staging` again and check for merge conflicts; do not assume the base is still current.
- Conventional commits: `feat|fix|chore(scope): message`.
- Before commit: format -> test -> snapshot review -> lint.
- `ts-pattern` for branching logic. React Query for server state.
- Shared utilities live in `@qovery/shared/util-js`.

## Testing

- In React tests, do not use `fireEvent`; treat it as deprecated in this repository. Use awaited `userEvent` interactions instead.
- Allow exceptions only when `userEvent` cannot represent the browser event, and document why.

## Agent Behavior

- Do not revert changes you did not author.
- State assumptions clearly.
- Keep diffs focused.
