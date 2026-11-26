# shared-billing-kit

The Console integration of the billing kit from `pricing-api` (`web/src/billing-kit`), copied from commit
`86e2568e1940ad8e57e003fb8df14eff0fdceed7` (2026-11-20).

The public entry point is `src/index.ts`. Under `src/lib`, `usage`, `invoices`, `settings`, `plans` and `offers`
hold the corresponding screens and journeys. Shared billing components live in `components`, pure helpers in
`utils`, and pricing-api client wiring in `data-access`. Tests and fixtures stay next to the code they exercise.

When syncing from pricing-api:

- Map upstream files to their existing Console paths. Use kebab-case file names, update relative imports, and run
  the Console formatter.
- Keep the Console settings layout, responsive spacing, typography and accessible headings in the affected screens.
- Keep the generated TypeScript client, public exports, Console tests and billing usage fixture. The website's
  `embed.tsx`, `embed.scss` and `inline.d.ts` stay in pricing-api.

`createPricingClient` calls pricing-api with the signed-in user's Qovery token. Public plan reads are unauthenticated.
