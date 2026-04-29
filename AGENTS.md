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

- **Yarn Berry** only (never npm). `nvm use 23`.
- Branch from `staging`. Conventional commits: `feat|fix|chore(scope): message`.
- Before commit: format -> test -> snapshot review -> lint.
- `ts-pattern` for branching logic. React Query for server state.
- Shared utilities live in `@qovery/shared/util-js`.

## Agent Behavior

- Do not revert changes you did not author.
- State assumptions clearly.
- Keep diffs focused.
