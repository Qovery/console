<br  />

<p  align="center">

<a  href="https://qovery.com"  target="_blank">

<img  style="display: block; margin: auto; width: 200px;"  src="https://user-images.githubusercontent.com/533928/152318674-3d036713-8f05-4972-b6e1-1c84e27ea794.svg">
</a>
</p>

<h3 align="center">Web Console</h3>
        <p align="center">Website: https://www.qovery.com</p>

<p align="center">
<a href="https://opensource.org/licenses"><img alt="GPLv3 License" src="https://img.shields.io/badge/License-GPL%20v3-yellow.svg"></a>
<a href="https://codecov.io/github/Qovery/console" >
<img src="https://codecov.io/github/Qovery/console/branch/feat/ci-codecov/graph/badge.svg?token=O8SMO6PEQV"/>
</a>
</p>

<p align="center">
    At Qovery for our Console, we use a couple of technologies, like <a href="https://nx.dev" target="_blank">Nx</a>, <a href="https://reactjs.org" target="_blank">React</a>, <a href="https://tanstack.com/query/v3/" target="_blank">React Query</a>, <a href="https://tailwindcss.com" target="_blank">Tailwind</a>, and <a href="https://storybook.js.org" target="_blank">Storybook</a>.
</p>
<br />

## Getting Started

First use

    yarn && yarn setup

Start the project on http://localhost:4200

    yarn start

Start Storybook on http://localhost:4400

    yarn storybook

Run tests

    yarn test

Generate a library

    nx g @nx/react:lib my-lib

Generate a component

    nx g @nx/react:component my-component

Run unit tests with Jest

    nx affected:test

Run end-to-end tests with Cypress

    nx affected:e2e

## Contributing

Qovery Console is actively develop and we need some help, you are welcome to contribute! You can propose improvements directly from the [issues](https://github.com/Qovery/console/issues) page or include them in your pull request for changes.

## Architecture Decision Records

We try to document our architecture decisions using [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture-decision-record) principle.
You can find our [ADR documents here](https://github.com/Qovery/console/tree/staging/adr) and the template used follows [this one](https://github.com/joelparkerhenderson/architecture-decision-record/tree/ab49e5ecad09b0e80c6ebeaf4f41c7958a2ad291/locales/en/templates/decision-record-template-by-michael-nygard)

## Community support

For help, you can use one of the channels to ask a question:

- [Forum](https://discuss.qovery.com/): (Bug reports, Questions)
- [GitHub](https://github.com/Qovery/console): (Bug reports, Contributions)
- [Twitter](https://twitter.com/qovery_): (Get the news fast)

## FAQ

### Why does Qovery exist?

At Qovery, we believe that the Cloud must be simpler than what it is today. Our goal is to consolidate the Cloud ecosystem and makes it accessible to any developer, DevOps, and company. Qovery helps people to focus on what they build instead of wasting time doing plumbing stuff.

### Why do we use Nx?

- Nx acts as a robust framework, providing significant benefits for React applications.
- It supports mono-repo architecture, allowing us to divide our application into multiple reusable entities/libraries.
- It offers tools to generate components, libraries, applications, and to check the health of our applications (e.g., circular dependencies).
- By using [Nx Cloud](https://cloud.nx.app/orgs/62aaef82e814d400050ea393/workspaces/635932a66ecea758758f0563/overview), we can cache deployments, run tests, and build only the modified parts of the application.
- It provides a framework for unit tests with [Jest](https://jestjs.io/) and end-to-end tests with [Cypress](https://www.cypress.io/).

### How is the project structured?

To help you navigate through the project, here is a brief overview of its structure.

```
apps/
└── console/                # General application with main router and tools like PostHog, Sentry, etc.

libs/
├── domains/                # Domain-specific by features
│   └── [feature-name]/
│       ├── data-access/    # Data access layer for the feature
│       └── feature/        # Core logic and components for the feature
│       ...
├── pages/                  # Page components for routing and layout, calling features from domain and common shared utilities and components
└── shared/                 # Shared utilities and components across the application
    ├── ui/                 # Storybook - UI components for reusable user interface elements
    ├── util-[name]/        # Utility functions and helpers
    └── util-queries/       # Shared utility functions for queries
    ...
```

This organization aims to make the codebase more maintainable and understandable, based on our structure and Nx recommendations. For more information about it, read this article: [Organizing and Structuring a React Project with Nx](https://www.qovery.com/blog/nx-architecture-part-1-organizing-and-structuring-a-react-project-with-nx/).
