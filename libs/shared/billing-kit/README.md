# shared-billing-kit

The billing kit from pricing-api (`web/src/billing-kit` in the qovery-pricing repository), the source of truth for these
components. Copied from pricing-api commit `fa3c1182fcc998bf41c970db15563e1c4579ac38` (main, 2026-11-20).

What the copy changes, so the next sync can redo it:

- File names in kebab-case (`UsagePage.tsx` is `usage-page.tsx`), relative imports updated, formatted with the
  console's Prettier config.
- Left out: `embed.tsx`, `embed.scss` and `inline.d.ts`, which build the website's web component.
- No other change: the kit's own optional client methods (plan change, cancellation, usage history, offers) let the
  console pick the calls it mounts (`pickConsoleCalls`).
- `src/index.ts` re-exports from `./lib/`, and adds the `Access` type and the test mock.
- `billing-usage-factory.mock.ts` and the `*.spec.ts(x)` files are console only.

Every call goes to pricing-api with the signed-in user's Qovery token (`createPricingClient`). Invoices, payment
methods, billing information, AWS Marketplace requests, plan changes, cancellation and usage history are pricing-api's
customer API; core is not involved.
