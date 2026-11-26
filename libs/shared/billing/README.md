# Billing

The Console integration of the billing kit from `pricing-api` (`web/src/billing-kit`), copied from commit
`2076d94` (2026-11-21). The offers and proposals are from `1300b8b`, the gated previews from `f8630a5`, and
the types, client, rules and paywall components from `1dced41` (2026-11-23, paywall intros).

- `@qovery/shared/billing/data-access` owns the pricing-api client, transport and wire types.
- `@qovery/shared/billing/feature` owns the billing screens, hooks and UI rules. Its `src/lib` groups code by
  workflow, with shared components in `components` and shared helpers in `utils`.

When syncing from pricing-api:

- Map upstream files to their existing Console paths. Use kebab-case file names, update relative imports, and run
  the Console formatter.
- Keep the Console settings layout, responsive spacing, typography and accessible headings in the affected screens.
- Keep the generated TypeScript client, public exports, Console tests and billing usage fixture. The website's
  `embed.tsx`, `embed.scss` and `inline.d.ts` stay in pricing-api.

`createPricingClient` calls pricing-api with the signed-in user's Qovery token. Public plan reads are unauthenticated.
