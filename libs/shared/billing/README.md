# Billing

The Console integration of the billing kit from `pricing-api` (`web/src/billing-kit`), copied from commit
`2076d94` (2026-11-21). The offers and proposals are from `1300b8b`, the gated previews from `f8630a5`, and
the types, client, rules and paywall components from `1dced41` (2026-11-23, paywall intros).

- `@qovery/shared/billing/data-access` configures the generated pricing-api client and adapts its responses for the Console.
- `@qovery/shared/billing/feature` owns the billing screens, hooks and UI rules. Screens and components live directly in
  `src/lib`. Hooks and helpers live in `src/lib/hooks` and `src/lib/utils`.

When syncing from pricing-api:

- Map upstream files to their existing Console paths. Use kebab-case file names, update relative imports, and run
  the Console formatter.
- Keep the Console settings layout, responsive spacing, typography and accessible headings in the affected screens.
- Use the generated SDK types. Keep Console fixtures in the shared factories library. The website's
  `embed.tsx`, `embed.scss` and `inline.d.ts` stay in pricing-api.

`createPricingClient` calls pricing-api with the signed-in user's Qovery token. Public plan reads are unauthenticated.
