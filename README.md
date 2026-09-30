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

First use

```sh
yarn && yarn setup
```

Start the project on [localhost:4200](http://localhost:4200)

```sh
yarn start
```

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
├── console/                    # Main application, entry point, and integrations
│   └── src/
│       ├── app/                # Application shell and providers
│       ├── auth/               # Application authentication
│       └── routes/             # File-based pages and layouts (TanStack Router)
└── console-e2e/                # Playwright end-to-end smoke tests

libs/
├── domains/                    # Business domains: services, environments, clusters, etc.
│   └── [domain-name]/
│       ├── data-access/        # Domain API access, types, and data hooks
│       ├── feature/            # Business logic and feature components
│       └── util/               # Domain-specific helpers, where needed
├── shared/                     # Reusable components and cross-domain functionality
│   ├── ui/                     # Shared UI components, styles, assets, and Storybook
│   ├── auth/                   # Shared authentication logic
│   ├── router/                 # Shared routing helpers
│   ├── util-js/                # General JavaScript utilities
│   ├── util-tests/             # Test helpers and providers
│   └── util-[name]/            # Other focused utilities (dates, hooks, types, etc.)
└── state/
    └── util-queries/           # Shared query state and API access

adr/                            # Architecture decision records
```

The tree shows the main layers; each domain only includes the libraries it needs. Route pages and layouts compose domain features and shared components.

Nx manages project dependencies and provides project-level build, test, lint, and generation commands. Use `yarn nx graph` to inspect the relationships between libraries.

Architecture decisions live in [adr/](./adr). Read the relevant decisions and [contribution guidelines](./.agents/skills/qovery-console-standards/SKILL.md) before changing project boundaries or shared patterns.

## Contributing

Bug reports and improvements are welcome through [GitHub issues](https://github.com/Qovery/console/issues) and pull requests.

1. Create your branch from the latest `staging` and keep changes focused.
2. Follow the [repository guide](./AGENTS.md) and relevant skills in [.agents/skills/](./.agents/skills/).
3. Format your changes, run the relevant tests, review any snapshot changes, and lint the affected projects.
4. Open a pull request targeting `staging`, using the [PR template](./pull_request_template.md). Use a Conventional Commit title such as `fix(service): correct deployment status`.

## Community and support

- [GitHub issues](https://github.com/Qovery/console/issues) — bug reports and feature requests.
- [Qovery website](https://www.qovery.com) — product information.

## License

See [LICENSE](./LICENSE) for the GNU General Public License v3 terms.
