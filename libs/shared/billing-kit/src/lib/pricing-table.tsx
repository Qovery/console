/*
 * The pricing table: every public plan from pricing-api, a monthly / yearly switch, the
 * comparison by SKU and the add-ons. The same component renders www.qovery.com/pricing (through
 * the <qovery-pricing-table> element), the back office's pricing page preview and the console's
 * "Compare plans". It only uses the console design system (@qovery/shared/ui).
 */
import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, SegmentedControl, Tooltip } from '@qovery/shared/ui'
import type { PricingClient } from './client'
import { money, monthly, valueText } from './format'
import type { BuilderSize, Period, PublicBuilders, PublicEntitlement, PublicPlan, PublicPlans } from './types'

export interface PricingTableProps {
  /** The plans, or a client to fetch them. */
  plans?: PublicPlans
  client?: Pick<PricingClient, 'publicPlans'>
  currency?: string
  defaultPeriod?: Period
  /** Marks the plan the customer is on (console). */
  currentPlan?: string
  /** Called with the plan picked; contact-sales plans call onContactSales. */
  onSelect?: (plan: PublicPlan, period: Period) => void
  onContactSales?: (plan: PublicPlan) => void
  /** Shows the comparison table and the add-ons below the cards. */
  details?: boolean
  /** Lets the visitor switch currency. */
  currencySwitch?: boolean
  /** Rich tooltips (portals). Off inside a shadow DOM (the website's embed): plain titles instead. */
  tooltips?: boolean
}

// Inline icons: the table needs no icon font, so it also renders where none is loaded (the embed).
const Check = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={`inline-block h-3.5 w-3.5 fill-current ${className}`} aria-hidden="true">
    <path d="M13.5 3.5 6 11 2.5 7.5l-1 1L6 13l8.5-8.5z" />
  </svg>
)
const InfoIcon = () => (
  <svg viewBox="0 0 16 16" className="inline-block h-3 w-3 fill-current" aria-hidden="true">
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.2a5.8 5.8 0 1 1 0 11.6A5.8 5.8 0 0 1 8 2.2zM7.3 7h1.4v4.5H7.3zM8 4.3a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7z" />
  </svg>
)

// The lines shown on each card; the rest is in the comparison.
const HIGHLIGHTS = ['members.seats', 'clusters.managed', 'deploy.minutes', 'observe.clusters', 'environments']

function Cell({ e, currency }: { e?: PublicEntitlement; currency: string }) {
  if (!e) return <span className="text-neutral-subtle">—</span>
  if (e.value === true)
    return (
      <>
        <Check className="text-positive" />
        <span className="sr-only">Included</span>
      </>
    )
  if (e.value === false) return <span className="text-neutral-subtle">—</span>
  const over = e.overage_unit_price?.[currency]
  return (
    <span>
      {valueText(e.value, e.unit === 'days' ? 'days' : undefined)}
      {over ? (
        <span className="block text-sm text-neutral-subtle">
          then {money(over, currency)} / {e.unit?.replace(/s$/, '') ?? 'unit'}
        </span>
      ) : null}
    </span>
  )
}

/**
 * The builders: the listed sizes with what a build minute counts and costs on each plan, the price
 * with a year of build minutes prepaid, and the bigger sizes available on request.
 */
export function BuilderPrices({
  builders,
  plans,
  currency,
  onContactSales,
}: {
  builders?: PublicBuilders
  plans: PublicPlan[]
  currency: string
  onContactSales?: () => void
}) {
  const priced = plans
    .map((p) => {
      const e =
        p.entitlements.find((x) => x.sku === 'build.minutes' && x.overage_unit_price?.[currency]) ??
        p.entitlements.find((x) => x.sku === 'deploy.minutes' && x.overage_unit_price?.[currency])
      return { plan: p, price: e?.overage_unit_price?.[currency] }
    })
    .filter((x) => x.price)
  const listed = builders?.sizes.filter((s) => s.listed !== false) ?? []
  const onRequest = builders?.sizes.filter((s) => s.listed === false) ?? []
  if (listed.length < 2 || !priced.length) return null
  const off = builders?.annual_prepaid_discount_pct ?? 0
  const at = (price: number, s: BuilderSize, prepaid: boolean) =>
    money(Math.round(price * s.multiplier * (prepaid ? 1 - off / 100 : 1)), currency)
  const biggest = onRequest.at(-1)
  return (
    <div>
      <h3 className="mb-1 text-base font-medium text-neutral">Builders</h3>
      <p className="mb-3 text-sm text-neutral-subtle">
        Pick the builder per service. A build minute on a bigger builder counts more of your plan's minutes, and costs
        more beyond them. Deploy time always counts once.
      </p>
      {off > 0 && (
        <div className="mb-3 rounded border border-brand-strong bg-surface-brand-subtle px-4 py-3 text-sm text-neutral">
          <span className="font-medium">Prepay a year of build minutes and save {off}%.</span> The minutes stay until
          you use them, on any builder.
        </div>
      )}
      <div className="overflow-x-auto rounded border border-neutral">
        <table className="w-full text-sm">
          <thead className="bg-surface-neutral-subtle">
            <tr className="text-left text-sm text-neutral-subtle">
              <th className="px-4 py-2 font-medium">Builder</th>
              <th className="px-4 py-2 font-medium">One build minute counts</th>
              {priced.map((x) => (
                <th key={x.plan.code} className="whitespace-nowrap px-4 py-2 text-right font-medium">
                  {x.plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listed.map((s, i) => (
              <tr key={s.code} className="border-t border-neutral align-top">
                <td className="min-w-48 px-4 py-2 text-neutral">
                  {s.name}
                  {i === 0 && <span className="text-sm text-neutral-subtle"> (default)</span>}
                  <div className="text-sm text-neutral-subtle">
                    up to {s.max_cpu_milli / 1000} vCPU, {s.max_ram_gib} GiB
                  </div>
                  {s.description && <div className="mt-0.5 max-w-xs text-sm text-neutral-subtle">{s.description}</div>}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-neutral">
                  {s.multiplier === 1 ? '1 minute' : `${s.multiplier} minutes`}
                </td>
                {priced.map((x) => (
                  <td key={x.plan.code} className="whitespace-nowrap px-4 py-2 text-right text-neutral">
                    {at(x.price!, s, false)}
                    <span className="text-sm text-neutral-subtle"> / min</span>
                    {off > 0 && <div className="text-sm text-positive">{at(x.price!, s, true)} prepaid yearly</div>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-neutral-subtle">Prices apply beyond the minutes included in each plan.</p>
      {biggest && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded border border-neutral px-4 py-3">
          <div className="text-sm text-neutral">
            <span className="font-medium">Bigger builders on request</span>, up to {biggest.max_cpu_milli / 1000} vCPU
            and {biggest.max_ram_gib} GiB
            {onRequest.some((s) => s.saving) && (
              <>, with up to {Math.max(...onRequest.map((s) => s.saving ?? 0))}% off their size</>
            )}
            .
            <div className="text-sm text-neutral-subtle">
              {onRequest
                .map(
                  (s) =>
                    `${s.name}: ${s.max_cpu_milli / 1000} vCPU, ${s.max_ram_gib} GiB, counts ${s.multiplier} minutes`
                )
                .join(' · ')}
            </div>
          </div>
          {onContactSales && (
            <Button size="md" variant="outline" color="neutral" onClick={onContactSales}>
              Talk to us
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function PricingTable({
  plans: given,
  client,
  currency: cur0 = 'USD',
  defaultPeriod = 'year',
  currentPlan,
  onSelect,
  onContactSales,
  details = true,
  currencySwitch = true,
  tooltips = true,
}: PricingTableProps) {
  const [loaded, setLoaded] = useState<PublicPlans | undefined>(given)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<Period>(defaultPeriod)
  const [currency, setCurrency] = useState(cur0)
  useEffect(() => setLoaded(given), [given])
  useEffect(() => {
    if (given || !client) return
    let live = true
    setError('')
    client
      .publicPlans()
      .then((value) => {
        if (live) setLoaded(value)
      })
      .catch((e) => {
        if (live) setError(String(e?.message ?? e))
      })
    return () => {
      live = false
    }
  }, [given, client])
  const data = loaded
  const plans = useMemo(() => [...(data?.plans ?? [])].sort((a, b) => a.rank - b.rank), [data])
  if (!data && error)
    return (
      <div className="rounded border border-neutral p-6 text-sm text-neutral-subtle">
        The plans could not be loaded ({error}).
      </div>
    )
  if (!data) return <div className="rounded border border-neutral p-6 text-sm text-neutral-subtle">Loading plans…</div>
  const saving = Math.max(
    0,
    ...plans.flatMap((p) => p.yearly_saving.filter((s) => s.currency === currency).map((s) => s.saving_pct))
  )
  const skus = new Map<string, PublicEntitlement>()
  for (const plan of plans) {
    for (const entitlement of plan.entitlements) {
      if (!skus.has(entitlement.sku)) skus.set(entitlement.sku, entitlement)
    }
  }
  const salesPlan = plans.find((p) => p.contact_sales)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SegmentedControl.Root value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SegmentedControl.Item value="month">Monthly</SegmentedControl.Item>
          <SegmentedControl.Item value="year">
            Yearly{saving ? ` (save ${Math.round(saving)}%)` : ''}
          </SegmentedControl.Item>
        </SegmentedControl.Root>
        {currencySwitch && data.currencies.length > 1 && (
          <SegmentedControl.Root value={currency} onValueChange={setCurrency}>
            {data.currencies.map((c) => (
              <SegmentedControl.Item key={c} value={c}>
                {c}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p, i) => {
          const m = monthly(p.prices, currency, period)
          const yearly = p.prices.find((x) => x.currency === currency && x.period === 'year')
          const current = currentPlan === p.code
          const popular = !p.contact_sales && i === Math.min(1, plans.length - 1)
          return (
            <div
              key={p.code}
              className={`flex flex-col rounded border bg-surface-neutral p-6 ${popular ? 'border-brand-strong' : 'border-neutral'}`}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium text-neutral">{p.name}</h3>
                {popular && (
                  <Badge className="font-medium" color="brand" variant="surface" size="sm">
                    Most popular
                  </Badge>
                )}
                {current && (
                  <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                    Current plan
                  </Badge>
                )}
                {p.draft && (
                  <Badge className="font-medium" color="yellow" variant="surface" size="sm">
                    Draft v{p.version}
                  </Badge>
                )}
              </div>
              <p className="mb-5 min-h-10 text-sm text-neutral-subtle">{p.description}</p>
              <div className="mb-5 min-h-16">
                {p.free ? (
                  <div>
                    <span className="text-3xl font-medium text-neutral">Free</span>
                    <div className="text-sm text-neutral-subtle">no credit card</div>
                  </div>
                ) : p.contact_sales || m == null ? (
                  <div className="text-2xl font-medium text-neutral">Custom</div>
                ) : (
                  <>
                    <div>
                      <span className="text-3xl font-medium text-neutral">{money(m, currency)}</span>
                      <span className="text-sm text-neutral-subtle"> / month</span>
                    </div>
                    <div className="text-sm text-neutral-subtle">
                      {period === 'year' && yearly
                        ? `${money(yearly.amount, currency)} billed yearly`
                        : 'billed monthly'}
                    </div>
                  </>
                )}
              </div>
              {p.contact_sales ? (
                <Button
                  size="lg"
                  variant="outline"
                  color="neutral"
                  className="mb-5 w-full justify-center"
                  disabled={!onContactSales}
                  onClick={() => onContactSales?.(p)}
                >
                  Contact sales
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={popular ? 'solid' : 'outline'}
                  color={popular ? 'brand' : 'neutral'}
                  className="mb-5 w-full justify-center"
                  disabled={current || !onSelect}
                  onClick={() => onSelect?.(p, period)}
                >
                  {current ? 'Current plan' : currentPlan ? `Switch to ${p.name}` : 'Get started'}
                </Button>
              )}
              <ul className="flex flex-col gap-2 text-sm text-neutral">
                {HIGHLIGHTS.map((k) => p.entitlements.find((e) => e.sku === k))
                  .filter((e): e is PublicEntitlement => !!e && e.value !== false && e.value !== 0)
                  .map((e) => (
                    <li key={e.sku} className="flex items-start gap-2">
                      <Check className="mt-1 shrink-0 text-positive" />
                      <span>{e.value === true ? e.name : `${valueText(e.value)} ${e.name.toLowerCase()}`}</span>
                    </li>
                  ))}
                {p.support && (
                  <li className="flex items-start gap-2">
                    <Check className="mt-1 shrink-0 text-positive" />
                    <span>Support: {p.support}</span>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      {details && (
        <div className="overflow-x-auto rounded border border-neutral">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral bg-surface-neutral-subtle text-left text-sm text-neutral-subtle">
                <th className="px-4 py-3 font-medium">Compare plans</th>
                {plans.map((p) => (
                  <th key={p.code} className="px-4 py-3 font-medium text-neutral">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {[...skus.values()].map((row) => (
                <tr key={row.sku}>
                  <td className="px-4 py-3 text-neutral">
                    <span className="inline-flex items-center gap-1.5">
                      {row.name}
                      {row.preview && (
                        <Badge className="font-medium" color="sky" variant="surface" size="sm">
                          Preview
                        </Badge>
                      )}
                      {row.description &&
                        (tooltips ? (
                          <Tooltip content={<span className="max-w-64 text-xs">{row.description}</span>}>
                            <span className="cursor-help text-neutral-subtle">
                              <InfoIcon />
                            </span>
                          </Tooltip>
                        ) : (
                          <span title={row.description} className="cursor-help text-neutral-subtle">
                            <InfoIcon />
                          </span>
                        ))}
                    </span>
                  </td>
                  {plans.map((p) => (
                    <td key={p.code} className="px-4 py-3 text-neutral">
                      <Cell e={p.entitlements.find((e) => e.sku === row.sku)} currency={currency} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3 text-neutral">Support</td>
                {plans.map((p) => (
                  <td key={p.code} className="px-4 py-3 text-neutral">
                    {p.support || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {details && (
        <BuilderPrices
          builders={data?.builders}
          plans={plans}
          currency={currency}
          onContactSales={onContactSales && salesPlan ? () => onContactSales(salesPlan) : undefined}
        />
      )}

      {details && plans.some((p) => p.addons.length) && (
        <div>
          <h3 className="mb-3 text-base font-medium text-neutral">Add-ons</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...new Map(plans.flatMap((p) => p.addons).map((a) => [a.code, a])).values()].map((a) => {
              const m = monthly(a.prices, currency, period)
              return (
                <div key={a.code} className="rounded border border-neutral bg-surface-neutral p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium text-neutral">{a.name}</div>
                    {m != null && (
                      <div className="whitespace-nowrap text-sm text-neutral">
                        {money(m, currency)}
                        <span className="text-sm text-neutral-subtle"> / month</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-neutral-subtle">
                    {a.gives.map((g) => (g.enable ? g.name : `+${g.adds} ${g.name.toLowerCase()}`)).join(', ')}
                    {' · '}on{' '}
                    {plans
                      .filter((p) => p.addons.some((x) => x.code === a.code))
                      .map((p) => p.name)
                      .join(', ')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
