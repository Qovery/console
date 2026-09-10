<p align="center">
  <a href="https://qovery.com">
    <img width="350" src="https://console.qovery.com/assets/logos/logo-white-on-brand.svg" alt="Qovery" />
  </a>
</p>

<h3 align="center"><a href="https://console.qovery.com">Qovery Console</a></h3>
<p align="center">The web interface for managing your infrastructure, applications, and deployments with Qovery.</p>

## Development stack

The Console is a TypeScript and React application in an Nx monorepo. It uses Vite for development and builds, TanStack Router for file-based routing, TanStack Query (React Query) for server state, and Tailwind CSS with Radix UI for the interface. Shared UI components are developed in Storybook; Jest and Playwright cover unit and end-to-end tests.

See [package.json](./package.json) for the versions and available scripts.

## Getting started

### Prerequisites

- **Node.js 23**, matching the repository's development guidelines and CI. With nvm, run `nvm install 23` and `nvm use 23`.
- **Yarn Berry**. Enable Yarn with `corepack enable`; the repository pins its Yarn release in [.yarnrc.yml](./.yarnrc.yml). Use Yarn for dependency management and commands.
- Access to the package registry configured in `.yarnrc.yml` (`https://npm-registry.qovery.com`). If dependency installation fails with an access error, ask the maintainers about registry access.

### Install and run

```sh
git clone https://github.com/Qovery/console.git
cd console
git switch staging
yarn install
yarn setup
yarn start
```

Open [localhost:4200](http://localhost:4200).

`yarn setup` runs [s.sh](./s.sh), which appends default configuration to a root `.env` file. Run it once for a fresh checkout; review an existing `.env` before rerunning it to avoid duplicate entries. The defaults point to the production Qovery API and authentication service, so you need a Qovery account to use authenticated pages. Local development does not start a backend.

### Environment configuration

The Console reads `.env` files from the repository root by default. The setup script provides the initial `NX_PUBLIC_*` values for API, WebSocket, authentication, and integrations. Review these values when targeting a different environment. Values loaded by the [Vite configuration](./apps/console/vite.config.ts) are exposed to the browser; do not put server-side secrets in these files.

To reuse an existing environment configuration across Git worktrees, place the `.env` file in a stable directory and start the Console with:

```sh
QOVERY_CONSOLE_ENV_DIR="$HOME/.config/qovery-console" yarn start
```

That directory must already contain your configuration. Vite loads `.env`, `.env.local`, and mode-specific environment files from it. Without `QOVERY_CONSOLE_ENV_DIR`, the repository root remains the default. `yarn setup` always writes to the current directory's `.env`, regardless of this setting.

## Development commands

Run commands from the repository root.

| Command                | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `yarn start`           | Start the Console at `http://localhost:4200`         |
| `yarn storybook`       | Start shared UI Storybook at `http://localhost:4400` |
| `yarn build:console`   | Build the Console into `dist/apps/console`           |
| `yarn build-storybook` | Build Storybook into `dist/storybook/design-system`  |
| `yarn test`            | Run unit tests across all projects                   |
| `yarn lint`            | Lint all projects                                    |
| `yarn format:check`    | Check formatting with Nx                             |
| `yarn format`          | Apply formatting with Nx                             |
| `yarn nx graph`        | Explore project dependencies                         |

For a focused change, target a project or only projects affected by your branch:

```sh
yarn nx test shared-ui
yarn nx lint shared-ui
yarn nx affected -t test --base=origin/staging
yarn nx affected -t lint --base=origin/staging
```

Generate libraries and components with the local Nx CLI:

```sh
yarn nx generate @nx/react:library --help
yarn nx generate @nx/react:component --help
```

### End-to-end tests

The Playwright smoke test runs against [Console staging](https://console-staging.qovery.com) by default. It requires `E2E_AUTH_TOKEN`, `E2E_PROJECT_ID`, and `E2E_ENVIRONMENT_ID` in the shell environment, with access to the target project and environment. Ask the maintainers for the test environment configuration.

```sh
yarn playwright install chromium
yarn e2e:staging
```

Set `E2E_BASE_URL` to target another running Console instance. The test runner does not start a local server. See the [Playwright configuration](./apps/console-e2e/playwright.config.ts) and [smoke test](./apps/console-e2e/src/staging-smoke.spec.ts) for details.

## Project structure

```text
apps/
├── console/
│   └── src/routes/         # File-based application routes
└── console-e2e/            # Playwright smoke tests

libs/
├── domains/                # Domain features and data access
├── shared/                 # Shared UI, authentication, routing, and utilities
│   ├── ui/                 # Reusable components and Storybook
│   ├── util-js/            # Shared JavaScript utilities
│   └── util-tests/         # Test helpers and providers
└── state/
    └── util-queries/       # Shared query state and API access

adr/                        # Architecture decision records
```

Nx manages project dependencies and provides project-level build, test, lint, and generation commands. Use `yarn nx graph` to inspect the relationships between libraries.

Architecture decisions live in [adr/](./adr). Read the relevant decisions and [contribution guidelines](./.agents/skills/qovery-console-standards/SKILL.md) before changing project boundaries or shared patterns.

## Contributing

Bug reports and improvements are welcome through [GitHub issues](https://github.com/Qovery/console/issues) and pull requests.

1. Create your branch from the latest `staging` and keep changes focused.
2. Follow the [repository guide](./AGENTS.md) and relevant skills in [.agents/skills/](./.agents/skills/).
3. Format your changes, run the relevant tests, review any snapshot changes, and lint the affected projects.
4. Open a pull request targeting `staging`, using the [PR template](./pull_request_template.md). Use a Conventional Commit title such as `fix(service): correct deployment status`.

## Community and support

- [Qovery forum](https://discuss.qovery.com/) — questions and discussions.
- [GitHub issues](https://github.com/Qovery/console/issues) — bug reports and feature requests.
- [Qovery website](https://www.qovery.com) — product information.

## License

See [LICENSE](./LICENSE) for the GNU General Public License v3 terms.
