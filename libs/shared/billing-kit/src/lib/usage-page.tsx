/*
 * The console's plan and usage page, from pricing-api: the plan, the current bill, this month's spend,
 * usage against every limit, deployments over 30 days, and the upgrade journey (pick a plan, see
 * the quote with its add-ons and conflicts, confirm). It mirrors the console's "Plan details"
 * page, explains the bill with usage over time (UsageInsights), and only uses @qovery/shared/ui, so the console can mount it as is:
 *
 *   <UsagePage organizationId={id} client={createPricingClient({ pricingApiUrl, coreApiUrl, getToken })} />
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, Button, Callout, Chart, Icon, Modal, RadioGroup } from '@qovery/shared/ui'
import type { PricingClient } from './client'
import { date, money, num, valueText } from './format'
import { AskAdminModal, EmailPreferencesPanel, OfferHost } from './offers'
import { PricingTable } from './pricing-table'
import type {
  BillingUsage,
  Entitlement,
  Offer,
  Period,
  PlanChangeResult,
  PlanOption,
  PlanOptions,
  Spend,
  UsageSeries,
} from './types'
import { UsageChart, UsageInsights } from './usage-insights'

export interface UsagePageProps {
  organizationId: string
  client: PricingClient
  /** Called when the user asks for sales (Enterprise, a contract change). */
  onContactSales?: () => void
  /** Links to the spend limits page, when the host has one. */
  onManageSpendLimits?: () => void
  /** all: offer cards and the sign-in popup (default); cards: the console's layout shows the popup. */
  offers?: 'all' | 'cards' | 'none'
  /** Opens a journey on load: the plan comparison, or the plan change (on `plan` when given). For deep links. */
  open?: { modal: 'compare' | 'upgrade'; plan?: string; period?: Period }
}

function Card({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="min-h-[114px] flex-1 rounded border border-neutral bg-surface-neutral p-5">
      <div className="mb-1 text-xs font-medium text-neutral-subtle">{label}</div>
      <div className="mb-1 text-sm font-medium text-neutral">{children}</div>
      {hint && <div className="text-xs text-neutral-subtle">{hint}</div>}
    </div>
  )
}

function UsageBar({ used, value, over }: { used: number; value: number; over: boolean }) {
  const pct = value > 0 ? Math.min(100, (used / value) * 100) : used > 0 ? 100 : 0
  const color = over ? 'var(--negative-9)' : pct >= 80 ? 'var(--warning-9)' : 'var(--brand-9)'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-neutral-component">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

// Settings measured in days (log retention) are a value, not a usage.
const isSetting = (e: Entitlement) => e.unit === 'days'

function UsageRow({
  e,
  onUpgrade,
  onDetails,
  onAsk,
}: {
  e: Entitlement
  onUpgrade?: () => void
  onDetails?: () => void
  onAsk?: () => void
}) {
  const finite = typeof e.value === 'number' && !isSetting(e)
  // A hard limit refuses the next one at the limit, not above it.
  const atLimit = e.mode === 'hard' && (e.over || (finite && e.used >= (e.value as number) && (e.value as number) > 0))
  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-neutral">{e.name}</span>
          {e.kind === 'meter' && <span className="ml-2 text-xs text-neutral-subtle">this month</span>}
        </div>
        <div className="text-sm text-neutral">
          {isSetting(e) ? (
            <span>{valueText(e.value, e.unit)}</span>
          ) : (
            <>
              <span className={e.over ? 'font-medium text-negative' : ''}>{num(e.used)}</span>
              <span className="text-neutral-subtle">
                {' '}
                / {valueText(e.value)}
                {e.unit && finite ? ` ${e.unit}` : ''}
              </span>
            </>
          )}
        </div>
      </div>
      {finite && <UsageBar used={e.used} value={e.value as number} over={e.over} />}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-subtle">
        <span>
          {e.customer_note}
          {e.prepaid ? ` · ${num(e.prepaid)} prepaid` : ''}
          {e.mode === 'soft' && e.overage_unit_price > 0
            ? ` · then ${money(e.overage_unit_price)} per ${e.unit.replace(/s$/, '')}`
            : ''}
        </span>
        <span className="flex items-center gap-3">
          {onDetails && (
            <button type="button" className="font-medium text-brand hover:underline" onClick={onDetails}>
              View usage
            </button>
          )}
          {atLimit &&
            (onAsk ? (
              <button type="button" className="font-medium text-brand hover:underline" onClick={onAsk}>
                Ask an admin for more
              </button>
            ) : (
              onUpgrade && (
                <button type="button" className="font-medium text-brand hover:underline" onClick={onUpgrade}>
                  Upgrade to get more
                </button>
              )
            ))}
          {e.over && e.mode === 'soft' && <span className="text-warning">Billed above the plan</span>}
        </span>
      </div>
    </div>
  )
}

function SeriesModal({ series, onClose }: { series: UsageSeries; onClose: () => void }) {
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(860px, calc(100vw - 24px))"
    >
      <div className="p-6">
        <h2 className="h4 text-neutral">{series.name}</h2>
        <p className="mb-4 text-sm text-neutral-subtle">
          {series.kind === 'meter'
            ? 'Consumed per day and month to date, over three months.'
            : 'In use each day, over three months.'}
          {series.included != null
            ? ` ${series.included.toLocaleString('en-US')} ${series.unit} included${series.kind === 'meter' ? ' per month' : ''}.`
            : ''}
        </p>
        <UsageChart series={series} height={280} />
      </div>
    </Modal>
  )
}

// ------------------------------------------------------------------ the upgrade journey

function UpgradeFlow({
  organizationId,
  client,
  usage,
  preselect,
  onClose,
  onDone,
  onContactSales,
}: {
  organizationId: string
  client: PricingClient
  usage: BillingUsage
  preselect?: string
  onClose: () => void
  onDone: () => void
  onContactSales?: () => void
}) {
  const [options, setOptions] = useState<PlanOptions>()
  const [pick, setPick] = useState<string | undefined>(preselect)
  const [step, setStep] = useState<'choose' | 'review' | 'done'>('choose')
  const [result, setResult] = useState<PlanChangeResult>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    client.planOptions!(organizationId)
      .then(setOptions)
      .catch((e) => setError(e.message))
  }, [client, organizationId])
  const chosen = options?.results.find((o) => o.plan.code === pick)
  const over = usage.entitlements.filter((e) => e.over && e.mode === 'hard')
  // The first upgrade whose limits cover what is over today is the recommended one.
  const recommended = useMemo(
    () =>
      options?.results.find((o) => !o.current && o.quote?.direction === 'upgrade' && o.quote.conflicts.length === 0)
        ?.plan.code,
    [options]
  )
  const cur = options?.currency ?? usage.billing.currency

  async function review() {
    if (!pick) return
    setBusy(true)
    setError('')
    try {
      setResult(await client.quotePlanChange!(organizationId, pick, options?.period))
      setStep('review')
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(false)
  }
  async function confirm() {
    if (!pick) return
    setBusy(true)
    setError('')
    try {
      setResult(await client.changePlan!(organizationId, pick, options?.period))
      setStep('done')
      onDone()
    } catch (e) {
      setError((e as Error).message)
    }
    setBusy(false)
  }
  const q = result?.quote
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o) onClose()
      }}
      width="min(720px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="flex items-start gap-3 border-b border-neutral px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="h4 text-neutral">
              {step === 'choose' ? 'Change plan' : step === 'review' ? `Move to ${chosen?.plan.name}` : 'Done'}
            </h2>
            <p className="text-sm text-neutral-subtle">
              {step === 'choose'
                ? `You are on ${usage.plan.name}.`
                : step === 'review'
                  ? 'Review what changes before you confirm.'
                  : ''}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-subtle hover:bg-surface-neutral-componentHover"
          >
            <Icon iconName="xmark" iconStyle="solid" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {client.mode === 'preview' && step !== 'done' && (
            <Callout.Root color="sky">
              <Callout.Text>Preview: quotes are real, nothing is applied.</Callout.Text>
            </Callout.Root>
          )}
          {options && !options.self_serve && (
            <Callout.Root color="neutral">
              <Callout.Text>
                <Callout.TextHeading>Your plan is managed by your account manager</Callout.TextHeading>Prices below are
                list prices; your contract may differ. Ask your account manager to change it.
              </Callout.Text>
            </Callout.Root>
          )}
          {step === 'choose' && (
            <>
              {over.length > 0 && (
                <p className="text-sm text-neutral">
                  You are at the limit of {over.map((e) => e.name.toLowerCase()).join(', ')}.
                </p>
              )}
              {!options && !error && <div className="text-sm text-neutral-subtle">Loading plans…</div>}
              <RadioGroup.Root className="flex flex-col gap-2" value={pick ?? ''} onValueChange={setPick}>
                {options?.results.map((o: PlanOption) => (
                  <label
                    key={o.plan.code}
                    htmlFor={`plan-${o.plan.code}`}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-4 transition-colors hover:bg-surface-neutral-subtle ${pick === o.plan.code ? 'border-brand-strong bg-surface-neutral' : 'border-neutral'} ${o.current ? 'opacity-70' : ''}`}
                  >
                    <RadioGroup.Item
                      id={`plan-${o.plan.code}`}
                      value={o.plan.code}
                      disabled={o.current}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-neutral">{o.plan.name}</span>
                        {o.current && (
                          <Badge color="neutral" variant="surface" size="sm">
                            Current plan
                          </Badge>
                        )}
                        {recommended === o.plan.code && (
                          <Badge color="brand" variant="surface" size="sm">
                            Recommended
                          </Badge>
                        )}
                        {o.quote?.direction === 'downgrade' && (
                          <Badge color="neutral" variant="surface" size="sm">
                            At the end of the term
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-subtle">
                        {o.highlights.map((h) => `${valueText(h.value)} ${h.sku.split('.')[0]}`).join(' · ')}
                      </div>
                      {o.quote && o.quote.conflicts.length > 0 && (
                        <div className="mt-1 text-xs text-warning">
                          {o.quote.conflicts.length} limit{o.quote.conflicts.length > 1 ? 's' : ''} to bring down first
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-neutral">
                      {o.quote ? (
                        o.plan.code.startsWith('ENTERPRISE') && !o.quote.total ? (
                          'on request'
                        ) : (
                          <>
                            {money(o.quote.total, cur)}
                            <span className="text-xs text-neutral-subtle"> / {o.quote.period}</span>
                          </>
                        )
                      ) : o.current ? (
                        ''
                      ) : (
                        '—'
                      )}
                    </div>
                  </label>
                ))}
              </RadioGroup.Root>
            </>
          )}
          {step === 'review' && q && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Card label="From">{usage.plan.name}</Card>
                <Card label="To">{chosen?.plan.name}</Card>
                <Card
                  label={`New price per ${q.period}`}
                  hint={
                    <>
                      {usage.estimate && usage.estimate.period === q.period && (
                        <>
                          {q.total >= usage.estimate.total ? '+' : '−'}
                          {money(Math.abs(q.total - usage.estimate.total), q.currency)} per {q.period} ·{' '}
                        </>
                      )}
                      {q.effective_at === 'now'
                        ? 'from today, prorated'
                        : `from ${date(usage.billing.term_end)}, the end of your term`}
                    </>
                  }
                >
                  {money(q.total, q.currency)}
                </Card>
              </div>
              {q.auto_addons.length > 0 && (
                <div className="rounded border border-neutral p-4 text-sm">
                  <div className="mb-1 font-medium text-neutral">Added to keep what you use today</div>
                  {q.auto_addons.map((a) => (
                    <div key={a.code} className="flex justify-between text-neutral-subtle">
                      <span>
                        {a.quantity} × {a.name}
                      </span>
                      <span>{money(a.amount, q.currency)}</span>
                    </div>
                  ))}
                </div>
              )}
              {q.kept_addons.length > 0 && (
                <div className="text-xs text-neutral-subtle">
                  Kept: {q.kept_addons.map((a) => `${a.quantity} × ${a.name}`).join(', ')}
                </div>
              )}
              {q.projected_overage > 0 && (
                <div className="text-xs text-neutral-subtle">
                  At today's usage, about {money(q.projected_overage, q.currency)} per {q.period} would be billed above
                  the plan.
                </div>
              )}
              {q.conflicts.length > 0 && (
                <Callout.Root color="yellow">
                  <Callout.Text>
                    <Callout.TextHeading>Before the switch</Callout.TextHeading>
                    {q.conflicts.map((c) => (
                      <div key={c.sku}>{c.fix}</div>
                    ))}
                  </Callout.Text>
                </Callout.Root>
              )}
              {q.message && <p className="text-sm text-neutral-subtle">{q.message}</p>}
            </div>
          )}
          {step === 'done' && q && (
            <Callout.Root color={result?.applied ? 'green' : 'sky'}>
              <Callout.Text>
                <Callout.TextHeading>
                  {result?.applied
                    ? q.effective_at === 'now'
                      ? `You are now on ${chosen?.plan.name}`
                      : `The switch to ${chosen?.plan.name} is scheduled`
                    : 'Preview: this is what the customer would get'}
                </Callout.TextHeading>
                {result?.applied
                  ? q.effective_at === 'now'
                    ? 'Your new limits apply right away.'
                    : `It takes effect on ${date(usage.billing.term_end)}.`
                  : `${money(q.total, q.currency)} per ${q.period}, ${q.effective_at === 'now' ? 'from today' : 'at the end of the term'}. Nothing was changed.`}
              </Callout.Text>
            </Callout.Root>
          )}
          {error && (
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral px-6 py-3">
          {step === 'choose' && (
            <>
              {onContactSales && (
                <Button size="lg" variant="plain" color="neutral" onClick={onContactSales}>
                  Talk to sales
                </Button>
              )}
              <Button
                size="lg"
                disabled={!pick || busy || (options && !options.self_serve && client.mode === 'live')}
                loading={busy}
                onClick={review}
              >
                Review
              </Button>
            </>
          )}
          {step === 'review' && (
            <>
              <Button size="lg" variant="plain" color="neutral" onClick={() => setStep('choose')}>
                Back
              </Button>
              <Button
                size="lg"
                loading={busy}
                disabled={!q?.can_apply || (options && !options.self_serve && client.mode === 'live')}
                onClick={confirm}
              >
                {q?.effective_at === 'now' ? 'Confirm and upgrade' : 'Schedule the switch'}
              </Button>
            </>
          )}
          {step === 'done' && (
            <Button size="lg" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ------------------------------------------------------------------ the page

export function UsagePage({
  organizationId,
  client,
  onContactSales,
  onManageSpendLimits,
  offers = 'all',
  open,
}: UsagePageProps) {
  const [u, setU] = useState<BillingUsage>()
  const [spend, setSpend] = useState<Spend>()
  const [error, setError] = useState('')
  const [modal, setModal] = useState<'compare' | 'upgrade' | null>(open?.modal ?? null)
  const [detail, setDetail] = useState<UsageSeries>()
  const [ask, setAsk] = useState<Entitlement>()
  const [comparePeriod, setComparePeriod] = useState<Period | undefined>(open?.period)
  const [round, setRound] = useState(0)
  const [preselect, setPreselect] = useState<string | undefined>(open?.plan)
  const load = useCallback(() => {
    client
      .billingUsage(organizationId)
      .then((x) => {
        setU(x)
        setError('')
      })
      .catch((e) => setError(e.message))
    client
      .spendLimits(organizationId)
      .then(setSpend)
      .catch(() => setSpend(undefined))
    setRound((n) => n + 1)
  }, [client, organizationId])
  useEffect(load, [load])
  if (error)
    return (
      <Callout.Root color="red">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>
    )
  if (!u) return <div className="p-6 text-sm text-neutral-subtle">Loading billing…</div>
  const cur = u.billing.currency
  const amounts = u.access !== 'member'
  // The console copy hides plan changes until core relays them (client without changePlan).
  const canChangePlan = !!client.changePlan
  // A limit the plan does not include (0, nothing used) reads as "not included", with the features.
  const notIncluded = (e: Entitlement) => e.kind !== 'feature' && e.value === 0 && e.used === 0
  const limits = u.entitlements.filter((e) => e.kind !== 'feature' && e.lifecycle !== 'preview' && !notIncluded(e))
  const features = u.entitlements
    .filter((e) => e.kind === 'feature' || notIncluded(e))
    .map((e) => (e.kind === 'feature' ? e : { ...e, value: false as const }))
  const upgrade = (plan?: string) => {
    setPreselect(plan)
    setModal('upgrade')
  }
  const sp = spend ?? u.spend
  const skuName = (sku: string) => u.entitlements.find((e) => e.sku === sku)?.name ?? sku
  // An offer's button opens the journey it is about.
  const onOffer = (o: Offer) => {
    const a = o.content.action
    if (a.type === 'trial') return load() // OfferHost started it: show the new limits
    if (a.type === 'upgrade' && amounts) upgrade(a.plan)
    else if (a.type === 'annualize') {
      setComparePeriod('year')
      setModal('compare')
    } else if (a.type === 'url' && a.url) window.open(a.url, '_blank', 'noopener')
    else if (a.type === 'upgrade') setModal('compare')
    else onContactSales?.()
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral pb-5">
        <div>
          <h2 className="h4 text-neutral">Plan details</h2>
          <p className="text-sm text-neutral-subtle">
            Your plan, what it includes and what you use. Limits are shared by every organization of your contract.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canChangePlan && (
            <Button variant="surface" color="neutral" size="md" onClick={() => setModal('compare')}>
              Compare plans
              <Icon iconName="table-columns" iconStyle="regular" />
            </Button>
          )}
          {amounts && canChangePlan && (
            <Button size="md" onClick={() => upgrade()}>
              Change plan
            </Button>
          )}
        </div>
      </div>

      {u.status.status === 'payment_failed' && (
        <Callout.Root color="red">
          <Callout.Text>
            <Callout.TextHeading>Your last payment failed</Callout.TextHeading>
            {u.status.message ?? 'Update your payment method'}
            {u.status.grace_until ? ` before ${date(u.status.grace_until)} to keep creating resources.` : '.'}
          </Callout.Text>
        </Callout.Root>
      )}
      {u.billing.locked && (
        <Callout.Root color="red">
          <Callout.Text>
            <Callout.TextHeading>New resources are paused</Callout.TextHeading>Your subscription is paused, cancelled or
            unpaid. Running services are not affected.
          </Callout.Text>
        </Callout.Root>
      )}
      {u.billing.phase && (
        <Callout.Root color="sky">
          <Callout.Text>
            <Callout.TextHeading>
              {u.billing.phase.kind === 'poc' ? 'Proof of concept' : 'Trial'} until {date(u.billing.phase.until)}
            </Callout.TextHeading>
            Limits are not enforced until then.
          </Callout.Text>
        </Callout.Root>
      )}
      {amounts && u.billing.cadence === 'monthly' && (
        <Callout.Root color="neutral">
          <Callout.Text>
            <Callout.TextHeading>Save with yearly billing</Callout.TextHeading>Yearly plans cost about 20% less than 12
            monthly payments.
          </Callout.Text>
        </Callout.Root>
      )}

      {offers !== 'none' && (
        <OfferHost
          key={round}
          modal={offers === 'all'}
          organizationId={organizationId}
          client={client}
          onAction={onOffer}
          onReviewRequests={amounts && canChangePlan ? () => upgrade() : undefined}
          skuName={skuName}
        />
      )}

      <div className="flex flex-col gap-2 md:flex-row">
        <Card
          label="Current plan"
          hint={`${u.billing.period === 'year' ? 'Yearly' : 'Monthly'} · term ends ${date(u.billing.term_end)}`}
        >
          {u.plan.name}
        </Card>
        {amounts && u.estimate && (
          <Card label="Current bill" hint={`Next invoice: ${date(u.estimate.term_end || u.billing.term_end)}`}>
            {money(u.estimate.total, cur)}{' '}
            <span className="text-xs font-normal text-neutral-subtle">/ {u.estimate.period}</span>
          </Card>
        )}
        {amounts && sp && (
          <Card
            label="Spend this month"
            hint={
              sp.account.monthly_limit != null ? (
                <>
                  {Math.round(sp.account.used_pct ?? 0)}% of the {money(sp.account.monthly_limit, cur)} limit
                  {onManageSpendLimits && (
                    <>
                      {' '}
                      ·{' '}
                      <button type="button" className="text-brand hover:underline" onClick={onManageSpendLimits}>
                        Manage
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  No spend limit
                  {onManageSpendLimits && (
                    <>
                      {' '}
                      ·{' '}
                      <button type="button" className="text-brand hover:underline" onClick={onManageSpendLimits}>
                        Set one
                      </button>
                    </>
                  )}
                </>
              )
            }
          >
            {money(sp.spent, cur)} <span className="text-xs font-normal text-neutral-subtle">beyond the plan</span>
          </Card>
        )}
      </div>

      {amounts && u.estimate && u.estimate.lines.length > 1 && (
        <div className="rounded border border-neutral bg-surface-neutral">
          {u.estimate.lines.map((l, i) => (
            <div
              key={i}
              className="flex justify-between gap-3 border-b border-neutral px-5 py-2 text-sm last:border-b-0"
            >
              <span className="text-neutral">
                {l.label}
                {l.quantity > 1 ? ` × ${l.quantity}` : ''}
              </span>
              <span className={l.amount < 0 ? 'text-positive' : 'text-neutral'}>{money(l.amount, cur)}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-3 text-base font-medium text-neutral">Usage</h3>
        <div className="divide-y divide-neutral rounded border border-neutral bg-surface-neutral">
          {limits.map((e) => {
            const series = u.usage_insights?.series.find((x) => x.sku === e.sku)
            return (
              <UsageRow
                key={e.sku}
                e={e}
                onUpgrade={canChangePlan ? () => upgrade() : undefined}
                onDetails={series ? () => setDetail(series) : undefined}
                onAsk={!amounts && client.requestUpgrade ? () => setAsk(e) : undefined}
              />
            )
          })}
        </div>
        {features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {features.map((f) => (
              <span
                key={f.sku}
                className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 ${f.value === true ? 'border-neutral text-neutral' : 'border-neutral text-neutral-subtle'}`}
              >
                <Icon
                  iconName={f.value === true ? 'check' : 'lock'}
                  iconStyle="regular"
                  className={f.value === true ? 'text-positive' : ''}
                />
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-base font-medium text-neutral">Usage details</h3>
        <p className="mb-3 text-sm text-neutral-subtle">
          How this organization used the plan over the last three months, and where this month is heading.
        </p>
        <UsageInsights usage={u} />
      </div>

      <EmailPreferencesPanel organizationId={organizationId} client={client} />

      {u.notes.length > 0 && <p className="text-xs text-neutral-subtle">{u.notes.join(' ')}</p>}

      {modal === 'compare' && (
        <Modal
          externalOpen
          setExternalOpen={(o) => {
            if (!o) {
              setModal(null)
              setComparePeriod(undefined)
            }
          }}
          width="min(1200px, calc(100vw - 24px))"
        >
          <div className="max-h-[85vh] overflow-y-auto p-6">
            <h2 className="h4 mb-4 text-neutral">Compare plans</h2>
            <PricingTable
              client={client}
              currency={cur}
              defaultPeriod={comparePeriod ?? u.billing.period}
              currentPlan={u.plan.code}
              onSelect={(p) => upgrade(p.code)}
              onContactSales={() => onContactSales?.()}
              currencySwitch={false}
            />
          </div>
        </Modal>
      )}
      {ask && (
        <AskAdminModal
          organizationId={organizationId}
          client={client}
          sku={ask.sku}
          skuName={ask.name}
          onClose={() => {
            setAsk(undefined)
            setRound((n) => n + 1)
          }}
        />
      )}
      {detail && <SeriesModal series={detail} onClose={() => setDetail(undefined)} />}
      {modal === 'upgrade' && (
        <UpgradeFlow
          organizationId={organizationId}
          client={client}
          usage={u}
          preselect={preselect}
          onClose={() => setModal(null)}
          onDone={load}
          onContactSales={onContactSales}
        />
      )}
    </div>
  )
}
