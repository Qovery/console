# shared-billing-kit

The billing kit from pricing-api (`web/src/billing-kit` in the qovery-pricing repository), the source of truth for these
components. Copied from pricing-api commit `2076d94` (main, 2026-11-21);
`offers.tsx`, `proposals.tsx`, `rules.ts` and `types.ts` from `1300b8b` (main, 2026-11-21).

What the copy changes, so the next sync can redo it:

- File names in kebab-case (`UsagePage.tsx` is `usage-page.tsx`), relative imports updated, formatted with the
  console's Prettier config.
- Left out: `embed.tsx`, `embed.scss` and `inline.d.ts`, which build the website's web component.
- No other change: the kit's own optional client methods (plan change, cancellation, reactivation, prepaid credits,
  usage history, build usage, invoice details, discounts, offers, gates and paywalls, plan proposals) let the console pick the calls it mounts (`pickConsoleCalls`).
- `src/index.ts` re-exports from `./lib/`, and adds the `Access` type and the test mock.
- `billing-usage-factory.mock.ts`, `console-paywall.tsx` (the console's client, `pickConsoleCalls`, and the paywall
  wiring behind the `billing-paywall` flag) and the `*.spec.ts(x)` files are console only.

Every call goes to pricing-api with the signed-in user's Qovery token (`createPricingClient`). Invoices and their
details, payment methods, billing information, AWS Marketplace requests, plan changes, cancellation, reactivation,
prepaid credits, usage history, build usage, discount requests, gates, feature trials, add-on purchases and plan proposals are pricing-api's customer API; core is not involved.
