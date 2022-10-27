<br  />

<p  align="center">

<a  href="https://qovery.com"  target="_blank">

<img  style="display: block; margin: auto; width: 200px;"  src="https://user-images.githubusercontent.com/533928/152318674-3d036713-8f05-4972-b6e1-1c84e27ea794.svg">
</a>
</p>

<h3 align="center">Deploy On-demand Environments on AWS, Remarkably Fast</h3>
        <p align="center">Website: https://www.qovery.com</p>

<p align="center">
<a href="https://opensource.org/licenses"><img alt="GPLv3 License" src="https://img.shields.io/badge/License-GPL%20v3-yellow.svg"></a>
<a href="https://discord.qovery.com"><img alt="Discord" src="https://img.shields.io/discord/688766934917185556?label=discord&style=flat-circle"></a>
<a href="https://codecov.io/github/Qovery/console" >
<img src="https://codecov.io/github/Qovery/console/branch/feat/ci-codecov/graph/badge.svg?token=O8SMO6PEQV"/>
</a>
</p>

<p align="center">
    At Qovery for our Console, we use a couple of technologies, like <a href="https://nx.dev" target="_blank">NX</a>, <a href="https://reactjs.org" target="_blank">React</a>, <a href="https://redux-toolkit.js.org" target="_blank">Redux</a>, <a href="https://tailwindcss.com" target="_blank">Tailwind</a>, and <a href="https://storybook.js.org" target="_blank">Storybook</a>.
</p>
<br />

## Getting Started

First use

    yarn && yarn setup

Start the project on http://localhost:4200

    yarn start

Start Storybook on http://localhost:4400

    yarn storybook

Generate a library

    nx g @nrwl/react:lib my-lib

Generate a component

    nx g @nrwl/react:component my-component

Run unit tests with Jest

    nx affected:test

Run end-to-end tests with Cypress

    nx affected:e2e

## Contributing

Qovery Console V3 is in its early stage of development and we need some help, you are welcome to contribute. To better synchronize consider joining our #v3 channel on our [Discord](https://discord.qovery.com).
Otherwise, you can directly propose improvements from the [issues](https://github.com/Qovery/console/issues) pages or add them directly from your pull request for the changes.

## Community support

For help, you can use one of the channels to ask a question:

- [Forum](https://discuss.qovery.com/): (Bug reports, Questions)
- [GitHub](https://github.com/Qovery/console): (Bug reports, Contributions)
- [Twitter](https://twitter.com/qovery_): (Get the news fast)

## FAQ

### Why does Qovery exist?

At Qovery, we believe that the Cloud must be simpler than what it is today. Our goal is to consolidate the Cloud ecosystem and makes it accessible to any developer, DevOps, and company. Qovery helps people to focus on what they build instead of wasting time doing plumbing stuff.

### Why do we use NX?

- NX works like a strong framework and it's very helpful for React app.
- It allows us to make mono-repo and we can divide our application into several entities/libraries that can reuse.
- Offers helpers to facilitate generating components, libraries, applications, and tools to check the health of our applications (circular dependencies).
- Using NX cloud, cache to deploy the application, run tests and build only what has been modified.
- Provides Framework to facilitate unit tests with [Jest](https://jestjs.io/) and e2e tests with [Cypress](https://www.cypress.io/).

### How is the project structured?

Our project is divided into several libraries, we are going to have 4 major categories of libraries:

- Domains: all our store logic is separated by domain, for each we find the slices with Redux, our providers, and mock for tests.
- Pages: each of the pages includes sub-pages.
- Shared: several elements of sharing between all components, UI components for the Storybook, enums, helpers, layout.
- Store: store initialization

We have separated the logical components “feature” and the UI components “UI” for each of the libraries. Requests and data are always called in features and flow to UI components. The goal is really to separate our features as much as possible to avoid circular dependencies and facilitate understanding of the project.

It’s an NX-proven approach, feel free to read the book “effective react with NX”, very interesting and well detailed.
