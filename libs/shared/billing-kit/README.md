# shared-billing-kit

The billing kit from pricing-api (`web/src/billing-kit` in the qovery-pricing repository), the source of truth for these
components. Copied from pricing-api commit `e53ddc41556c9e981349f69c2c0dc0660710b1d1` (main, 2026-11-20).

What the copy changes, so the next sync can redo it:

- File names in kebab-case (`UsagePage.tsx` is `usage-page.tsx`), relative imports updated, formatted with the
  console's Prettier config.
- Left out: `embed.tsx`, `embed.scss` and `inline.d.ts`, which build the website's web component.
- `PricingClient.planOptions`, `quotePlanChange` and `changePlan` are optional. Without them `<UsagePage>` hides
  Compare plans, Change plan and "Upgrade to get more". The console's client leaves them out until core relays plan
  changes.
- `billing-usage-factory.mock.ts` is console only (test data).

Every call goes to pricing-api with the signed-in user's Qovery token (`createPricingClient`). Invoices, payment
methods, billing information and AWS Marketplace requests are pricing-api's customer API; core is not involved.
