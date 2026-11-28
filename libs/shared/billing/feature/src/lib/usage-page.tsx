/*
 * The console's plan and usage page, from pricing-api: the plan, the estimated bill, what is
 * above the plan this month, usage against every limit, prepaid credits (balances, purchases,
 * buy), discounts in exchange for counterparts (billing roles), usage over a period the person picks, build usage per builder size and service, and the journeys around the plan: change plan
 * (pick, review the quote and what it costs today, confirm), keep the current plan when a change
 * is planned, cancel at the end of the term, keep the subscription, and reactivate it once it
 * ended. Alerts (an overdue invoice, a card that expires) sit under the page's
 * heading, as on the Invoices and Billing pages; a host can draw that heading itself (`heading`).
 * It only uses @qovery/shared/ui, so the console
 * mounts it as is:
 *
 *   <UsagePage organizationId={id} client={createPricingClient({ pricingApiUrl, getToken })} onNavigate={go} />
 */
import * as Dialog from '@radix-ui/react-dialog'
import type {
  BillingUsage,
  Cancellation,
  Entitlement,
  Offer,
  Period,
  PlanOptions,
  PlanProposal,
  Reactivation,
  Spend,
} from 'qovery-pricing-typescript-axios'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { Badge, Button, Callout, Heading, Icon, Modal, Navbar } from '@qovery/shared/ui'
import { BillingAlerts } from './billing-alerts'
import { BuildUsage } from './build-usage'
import { CancelDialog, PlannedBanners } from './cancel'
import { PrepaidCredits } from './credits'
import { DiscountsCard } from './discounts'
import { EmailPreferencesLink, EmailPreferencesPanel } from './email-preferences-panel'
import { useProposals } from './hooks/use-proposal/use-proposal'
import { AskAdminModal, OfferHost } from './offers'
import { errorText } from './parts'
import { PlanChangeFlow } from './plan-change'
import { PricingTable } from './pricing-table'
import { ProposalHost } from './proposals'
import { ReactivateFlow, SubscriptionEndedBanner } from './reactivate'
import { UsageHistory } from './usage-history'
import { date, money, num, valueText } from './utils/format'
import { estimateLineLabel } from './utils/format'
import { INTERNAL_NOTHING_BILLED, changeBlockedText, signupTrialText } from './utils/subscription-rules'

export interface UsagePageProps {
  organizationId: string
  client: PricingClient
  initialUsage?: BillingUsage
  /** Called when the user asks for sales (Enterprise, a contract change). */
  onContactSales?: () => void
  /** Links to the spend limits page, when the host has one. */
  onManageSpendLimits?: () => void
  /** all: offer cards and the sign-in popup (default); cards: the console's layout shows the popup. */
  offers?: 'all' | 'cards' | 'none'
  /** Opens a journey on load: the plan comparison, or the plan change (on `plan` when given). For deep links.
   * `proposal`: the plan proposal of that id, opened on its review (the email's "Review the plan"). */
  open?: { modal: 'compare' | 'upgrade'; plan?: string; period?: Period; proposal?: number }
  /** Shows <BillingAlerts> under the page heading (default). Hosts that place alerts themselves pass false. */
  alerts?: boolean
  /** Where the alerts' buttons go: the invoices page or the billing settings page. */
  onNavigate?: (to: 'invoices' | 'billing') => void
  /** Draws the page heading with the host's own component (the console's SettingsHeading). Default: the kit's heading, the same layout. */
  heading?: (h: UsagePageHeading) => ReactNode
  /** Opens the host's email settings page: the page then shows a link to it instead of the email preferences. */
  onManageEmails?: () => void
}

/** What the page heading shows: the title, its description and the plan buttons. */
export interface UsagePageHeading {
  title: string
  description: string
  actions: ReactNode
}

// Mirrors the console's SettingsHeading: actions at the top right, stacked under the text only on narrow screens.
function PageHeading({ title, description, actions }: UsagePageHeading) {
  return (
    <div className="mb-8 flex w-full flex-col gap-4 border-b border-neutral pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <Heading level={1}>{title}</Heading>
        <p className="max-w-2xl text-sm text-neutral-subtle">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 md:shrink-0">{actions}</div>}
    </div>
  )
}

function Card({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="flex-1 rounded border border-neutral bg-surface-neutral p-4">
      <div className="mb-1 text-sm text-neutral-subtle">{label}</div>
      <div className="mb-1 text-sm font-medium text-neutral">{children}</div>
      {hint && <div className="text-sm text-neutral-subtle">{hint}</div>}
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
  currency,
  onUpgrade,
  onAsk,
}: {
  e: Entitlement
  currency: string
  onUpgrade: () => void
  onAsk?: () => void
}) {
  const finite = typeof e.value === 'number' && !isSetting(e)
  // A hard limit refuses the next one at the limit, not above it.
  const atLimit = e.mode === 'hard' && (e.over || (finite && e.used >= (e.value as number) && (e.value as number) > 0))
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-neutral">{e.name}</span>
          {e.kind === 'meter' && <span className="ml-2 text-sm text-neutral-subtle">this month</span>}
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
      {finite && (
        <div className="my-1">
          <UsageBar used={e.used} value={e.value as number} over={e.over} />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-subtle">
        <span>
          {e.customer_note}
          {e.prepaid ? ` · ${num(e.prepaid)} prepaid` : ''}
          {e.mode === 'soft' && e.overage_unit_price > 0
            ? ` · then ${money(e.overage_unit_price, currency)} per ${e.unit.replace(/s$/, '')}`
            : ''}
        </span>
        <span className="flex items-center gap-3">
          {atLimit &&
            (onAsk ? (
              <button type="button" className="cursor-pointer font-medium text-brand hover:underline" onClick={onAsk}>
                Ask an admin for more
              </button>
            ) : (
              <button
                type="button"
                className="cursor-pointer font-medium text-brand hover:underline"
                onClick={onUpgrade}
              >
                Upgrade to get more
              </button>
            ))}
          {e.over && e.mode === 'soft' && <span className="text-warning">Billed above the plan</span>}
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ the page

export function UsagePage({
  organizationId,
  client,
  initialUsage,
  onContactSales,
  onManageSpendLimits,
  offers = 'all',
  open,
  alerts = true,
  onNavigate,
  heading = PageHeading,
  onManageEmails,
}: UsagePageProps) {
  const [u, setU] = useState(initialUsage)
  const [spend, setSpend] = useState<Spend>()
  const [plan, setPlan] = useState<PlanOptions>()
  const [cancellation, setCancellation] = useState<Cancellation>()
  const [reactivation, setReactivation] = useState<Reactivation>()
  // The view the reactivation flow opened with: it stays mounted after the page reloads.
  const [reactivating, setReactivating] = useState<Reactivation>()
  const [error, setError] = useState('')
  // A proposal deep link waits for the proposal before opening the plan change.
  const [modal, setModal] = useState<'compare' | 'upgrade' | 'cancel' | 'reactivate' | null>(
    open?.proposal ? null : open?.modal ?? null
  )
  const [proposal, setProposal] = useState<PlanProposal>()
  const [usageView, setUsageView] = useState('organization')
  const [ask, setAsk] = useState<Entitlement>()
  const [comparePeriod, setComparePeriod] = useState<Period | undefined>(open?.period)
  const [round, setRound] = useState(0)
  const [preselect, setPreselect] = useState<string | undefined>(open?.plan)
  const load = useCallback(
    (usage?: BillingUsage) => {
      const request = usage ? Promise.resolve(usage) : client.billingUsage(organizationId)
      request
        .then((x) => {
          setU(x)
          setError('')
          // What is planned (a plan change, a cancellation) and what can be changed: billing roles only.
          if (x.access === 'member') return
          client
            .planOptions?.(organizationId)
            .then(setPlan)
            .catch(() => setPlan(undefined))
          client
            .cancellation?.(organizationId)
            .then(setCancellation)
            .catch(() => setCancellation(undefined))
          // Once the subscription ended: when it ended and how to start it again.
          if (x.billing.status === 'cancelled')
            client
              .reactivation?.(organizationId)
              .then(setReactivation)
              .catch(() => setReactivation(undefined))
          else setReactivation(undefined)
        })
        .catch((e) => setError(errorText(e)))
      client
        .spendLimits(organizationId)
        .then(setSpend)
        .catch(() => setSpend(undefined))
      setRound((n) => n + 1)
    },
    [client, organizationId]
  )
  useEffect(() => load(initialUsage), [initialUsage, load])
  const canReviewProposal =
    !!u &&
    u.access !== 'member' &&
    !u.billing.internal &&
    u.billing.status !== 'cancelled' &&
    !!client.quoteProposal &&
    !!client.acceptProposal
  const { proposal: linkedProposal } = useProposals(
    organizationId,
    client,
    canReviewProposal && Boolean(open?.proposal)
  )
  const openedProposal = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!canReviewProposal || !linkedProposal || linkedProposal.id !== open?.proposal) return
    if (openedProposal.current === linkedProposal.id) return
    openedProposal.current = linkedProposal.id
    setProposal(linkedProposal)
    setModal('upgrade')
  }, [canReviewProposal, linkedProposal, open?.proposal])
  const usageError = error && (
    <Callout.Root color="red">
      <Callout.Text>
        <Callout.TextHeading>Usage could not be loaded</Callout.TextHeading>
        {error}
      </Callout.Text>
      <Button size="sm" variant="outline" color="neutral" onClick={() => load()}>
        Retry
      </Button>
    </Callout.Root>
  )
  if (!u) return usageError || <div className="p-6 text-sm text-neutral-subtle">Loading billing…</div>
  const signupTrial = u.signup_trial && signupTrialText(u.signup_trial)
  const cur = u.billing.currency
  const amounts = u.access !== 'member'
  // Once the subscription ended, Reactivate replaces Change plan.
  // Qovery's own organizations (internal accounts): usage as usual, nothing billed, nothing to change.
  const internal = !!u.billing.internal
  const canReactivate = !!client.quoteReactivation && !!client.reactivate
  const canChangePlan =
    amounts && !internal && !!client.planOptions && !!client.quotePlanChange && u.billing.status !== 'cancelled'
  // A limit the plan does not include (0, nothing used) reads as "not included", with the features.
  const notIncluded = (e: Entitlement) => e.kind !== 'feature' && e.value === 0 && e.used === 0
  const limits = u.entitlements.filter(
    (e) => e.kind !== 'feature' && e.value !== 'unlimited' && e.lifecycle !== 'preview' && !notIncluded(e)
  )
  const upgrade = (p?: string) => {
    setProposal(undefined)
    setPreselect(p)
    setModal('upgrade')
  }
  const reviewProposal = (p: PlanProposal) => {
    setProposal(p)
    setModal('upgrade')
  }
  const sp = spend ?? u.spend
  const skuName = (sku: string) => u.entitlements.find((e) => e.sku === sku)?.name ?? sku
  const unitOf = (sku: string) => u.entitlements.find((e) => e.sku === sku)?.unit ?? ''
  // Usage above the plan in this period's estimate (meters: this month so far).
  const estimatedAbove = (u.estimate?.lines ?? [])
    .filter((l) => l.kind === 'overage' && l.meter)
    .reduce((a, l) => a + l.amount / (u.estimate?.period === 'year' ? 12 : 1), 0)
  const ended = u.billing.status === 'cancelled'
  const ending =
    !ended &&
    cancellation?.current &&
    (cancellation.current.status === 'scheduled' || cancellation.current.status === 'requested')
  const cancelBlocked =
    cancellation?.mode === 'unavailable' ? changeBlockedText(cancellation.unavailable ?? undefined, 'cancel') : null
  // An offer's button opens the journey it is about.
  const onOffer = (o: Offer) => {
    const a = o.content.action
    if (a.type === 'trial') return load() // OfferHost started it: show the new limits
    if (a.type === 'upgrade' && canChangePlan) upgrade(a.plan)
    else if (a.type === 'annualize') {
      setComparePeriod('year')
      setModal('compare')
    } else if (a.type === 'url' && a.url) window.open(a.url, '_blank', 'noopener')
    else if (a.type === 'upgrade') setModal('compare')
    else onContactSales?.()
  }
  const actions = (
    <>
      <Button variant="outline" color="neutral" size="md" onClick={() => setModal('compare')}>
        <Icon iconName="table-columns" iconStyle="regular" />
        Compare plans
      </Button>
      {canChangePlan && (
        <Button size="md" onClick={() => upgrade()}>
          Change plan
        </Button>
      )}
    </>
  )
  return (
    <div>
      {heading({
        title: 'Plan details',
        description: 'Your plan and monthly consumption.',
        actions,
      })}
      <div className="flex flex-col gap-8">
        {usageError}
        {internal && (
          <Callout.Root color="neutral">
            <Callout.Text>
              <Callout.TextHeading>{INTERNAL_NOTHING_BILLED}</Callout.TextHeading>
            </Callout.Text>
          </Callout.Root>
        )}
        {alerts && !internal && (
          <BillingAlerts organizationId={organizationId} client={client} access={u.access} onNavigate={onNavigate} />
        )}
        {u.status.status === 'payment_failed' && (
          <Callout.Root color="red">
            <Callout.Text>
              <Callout.TextHeading>Your last payment failed</Callout.TextHeading>
              {u.status.message ?? 'Update your payment method'}
              {u.status.grace_until ? ` before ${date(u.status.grace_until)} to keep creating resources.` : '.'}
            </Callout.Text>
          </Callout.Root>
        )}
        {amounts && ended && reactivation?.ended && canReactivate && (
          <SubscriptionEndedBanner
            view={reactivation}
            onReactivate={() => {
              setReactivating(reactivation)
              setModal('reactivate')
            }}
            onContactSales={onContactSales}
            preview={client.mode === 'preview'}
          />
        )}
        {(u.billing.locked || u.status.status === 'locked') &&
          !(amounts && ended && reactivation?.ended && canReactivate) && (
            <Callout.Root color="red">
              <Callout.Text>
                <Callout.TextHeading>New resources are paused</Callout.TextHeading>Your subscription is paused,
                cancelled or unpaid. Running services are not affected.
              </Callout.Text>
            </Callout.Root>
          )}
        {signupTrial ? (
          <Callout.Root color="sky">
            <Callout.Text>
              <Callout.TextHeading>{signupTrial.title}</Callout.TextHeading>
              {signupTrial.body}
            </Callout.Text>
          </Callout.Root>
        ) : (
          u.billing.phase && (
            <Callout.Root color="sky">
              <Callout.Text>
                <Callout.TextHeading>
                  {u.billing.phase.kind === 'poc' ? 'Proof of concept' : 'Trial'} until {date(u.billing.phase.until)}
                </Callout.TextHeading>
                Limits are not enforced until then.
              </Callout.Text>
            </Callout.Root>
          )
        )}
        {amounts && !ended && (
          <PlannedBanners
            organizationId={organizationId}
            client={client}
            scheduled={plan?.scheduled_change}
            cancellation={cancellation}
            onChanged={load}
          />
        )}
        {amounts && !internal && u.billing.cadence === 'monthly' && !ending && !ended && (
          <Callout.Root color="neutral">
            <Callout.Text>
              <Callout.TextHeading>Save with yearly billing</Callout.TextHeading>Yearly plans cost about 20% less than
              12 monthly payments.
              {canChangePlan && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    color="neutral"
                    onClick={() => {
                      setPreselect(u.plan.code)
                      setComparePeriod('year')
                      setModal('upgrade')
                    }}
                  >
                    Switch to yearly billing
                  </Button>
                </div>
              )}
            </Callout.Text>
          </Callout.Root>
        )}

        {offers !== 'none' && (
          <OfferHost
            key={'offers' + round}
            modal={offers === 'all'}
            organizationId={organizationId}
            client={client}
            onAction={onOffer}
            onReviewRequests={canChangePlan ? () => upgrade() : undefined}
            skuName={skuName}
          />
        )}
        {/* A plan proposal from Qovery staff, with or without offers. */}
        {canReviewProposal && (
          <ProposalHost organizationId={organizationId} client={client} onReview={reviewProposal} />
        )}

        <div className="flex flex-col gap-2 md:flex-row">
          <Card
            label={ended ? 'Last plan' : 'Current plan'}
            hint={
              ended
                ? `Ended ${date(reactivation?.ended_on ?? u.billing.term_end)}`
                : `${u.billing.period === 'year' ? 'Yearly' : 'Monthly'}, term ends ${date(u.billing.term_end)}`
            }
          >
            {u.plan.name}
            {plan?.scheduled_change && (
              <Badge className="ml-2 font-medium" color="sky" variant="surface" size="sm">
                {plan.scheduled_change.name} from {date(plan.scheduled_change.effective_on)}
              </Badge>
            )}
          </Card>
          {amounts && u.estimate && !ended && (
            <Card label="Estimated bill" hint="Includes plan and usage">
              {money(u.estimate.total, cur)}{' '}
              <span className="text-sm font-normal text-neutral-subtle">/ {u.estimate.period}</span>
            </Card>
          )}
          {amounts && sp && (
            <Card
              label="Additional usage this month"
              hint={
                <>
                  {estimatedAbove > sp.spent ? (
                    <>{money(sp.spent, cur)} recorded so far toward your spend limit. </>
                  ) : null}
                  {sp.account.monthly_limit != null ? (
                    <>
                      {sp.account.used_pct == null
                        ? `${money(sp.account.monthly_limit, cur)} spend limit`
                        : `${Math.round(sp.account.used_pct)}% of the ${money(sp.account.monthly_limit, cur)} spend limit`}
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
                  )}
                </>
              }
            >
              {money(Math.max(sp.spent, estimatedAbove), cur)}{' '}
              <span className="text-sm font-normal text-neutral-subtle">
                {estimatedAbove > sp.spent ? 'estimated' : 'recorded'}
              </span>
            </Card>
          )}
        </div>

        {amounts && !ended && u.estimate && u.estimate.lines.length > 1 && (
          <div className="rounded border border-neutral bg-surface-neutral">
            <div className="border-b border-neutral px-4 py-2 text-sm font-medium text-neutral-subtle">
              Estimated bill for this {u.estimate.period}
            </div>
            {u.estimate.lines.map((l, i) => (
              <div
                key={i}
                className="flex justify-between gap-3 border-b border-neutral px-4 py-2 text-sm last:border-b-0"
              >
                <span className="text-neutral">
                  {estimateLineLabel(l, unitOf)}
                  {l.kind === 'overage' && <span className="text-sm text-neutral-subtle"> (estimate)</span>}
                </span>
                <span className={l.amount < 0 ? 'text-positive' : 'text-neutral'}>{money(l.amount, cur)}</span>
              </div>
            ))}
          </div>
        )}

        {amounts && !ended && (
          <DiscountsCard
            key={'discounts' + round}
            organizationId={organizationId}
            client={client}
            usage={u}
            onChanged={load}
          />
        )}

        {limits.length > 0 && (
          <div>
            <Heading level={2} className="mb-3">
              Plan allowances
            </Heading>
            <div className="divide-y divide-neutral rounded border border-neutral bg-surface-neutral">
              {limits.map((e) => (
                <UsageRow
                  key={e.sku}
                  e={e}
                  currency={cur}
                  onUpgrade={() => (canChangePlan ? upgrade() : setModal('compare'))}
                  onAsk={!amounts && client.requestUpgrade ? () => setAsk(e) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        <PrepaidCredits
          organizationId={organizationId}
          client={client}
          usage={u}
          onContactSales={onContactSales}
          onChanged={load}
        />

        {(client.usageHistory || client.buildUsage) && (
          <div>
            <Heading level={2} className="mb-3">
              Usage
            </Heading>
            <div className="rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle px-4 pb-2">
              <Navbar.Root activeId={usageView} ariaLabel="Usage views">
                {(client.usageHistory || client.buildUsage) && (
                  <Navbar.Item
                    id="organization"
                    active={usageView === 'organization'}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setUsageView('organization')
                    }}
                  >
                    Organization
                  </Navbar.Item>
                )}
                {client.buildUsage && (
                  <Navbar.Item
                    id="services"
                    active={usageView === 'services'}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setUsageView('services')
                    }}
                  >
                    Services
                  </Navbar.Item>
                )}
              </Navbar.Root>
            </div>
            <div className="relative -mt-2 overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
              {usageView === 'organization' ? (
                <div className="divide-y divide-neutral">
                  {client.usageHistory ? (
                    <UsageHistory
                      organizationId={organizationId}
                      client={client}
                      embedded
                      renderDetails={
                        client.buildUsage
                          ? (range) => (
                              <BuildUsage
                                organizationId={organizationId}
                                client={client}
                                view="summary"
                                embedded
                                periodRange={range}
                              />
                            )
                          : undefined
                      }
                    />
                  ) : client.buildUsage ? (
                    <BuildUsage organizationId={organizationId} client={client} view="summary" embedded />
                  ) : null}
                </div>
              ) : (
                <BuildUsage organizationId={organizationId} client={client} view="services" embedded />
              )}
            </div>
          </div>
        )}

        {onManageEmails ? (
          client.emailPreferences && <EmailPreferencesLink onConfigure={onManageEmails} />
        ) : (
          <EmailPreferencesPanel organizationId={organizationId} client={client} />
        )}

        {amounts && !internal && cancellation && !ending && cancellation.unavailable?.code !== 'SUBSCRIPTION_ENDED' && (
          <div className="text-sm text-neutral-subtle">
            {!cancelBlocked ? (
              <Button type="button" size="md" variant="outline" color="red" onClick={() => setModal('cancel')}>
                Cancel subscription
              </Button>
            ) : cancelBlocked.contact &&
              onContactSales &&
              cancellation.unavailable?.code !== 'PAYMENT_ACTIONS_UNAVAILABLE' ? (
              <button
                type="button"
                className="text-neutral-subtle underline-offset-2 hover:text-neutral hover:underline"
                onClick={onContactSales}
              >
                {cancellation.unavailable?.code === 'AWS_MARKETPLACE'
                  ? 'Your subscription is managed in AWS Marketplace: contact us to cancel'
                  : 'Contact us to cancel'}
              </button>
            ) : (
              <span>
                {cancelBlocked.title}. {cancelBlocked.body}
              </span>
            )}
          </div>
        )}

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
            <div className="max-h-[75vh] overflow-y-auto p-5">
              <Dialog.Title asChild>
                <Heading level={2} className="mb-4 pr-8">
                  Compare plans
                </Heading>
              </Dialog.Title>
              <PricingTable
                client={client}
                currency={cur}
                defaultPeriod={comparePeriod ?? u.billing.period}
                currentPlan={u.plan.code}
                currentPlanName={u.plan.name}
                onSelect={
                  canChangePlan
                    ? (p, period) => {
                        setComparePeriod(period)
                        upgrade(p.code)
                      }
                    : undefined
                }
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
        {modal === 'upgrade' && (
          <PlanChangeFlow
            organizationId={organizationId}
            client={client}
            usage={u}
            preselect={preselect}
            prePeriod={comparePeriod}
            proposal={proposal}
            onClose={() => {
              setModal(null)
              setComparePeriod(undefined)
              setProposal(undefined)
            }}
            onDone={load}
            onContactSales={onContactSales}
          />
        )}
        {modal === 'reactivate' && reactivating && canReactivate && (
          <ReactivateFlow
            organizationId={organizationId}
            client={client}
            view={reactivating}
            onClose={() => {
              setModal(null)
              setReactivating(undefined)
            }}
            onDone={load}
          />
        )}
        {modal === 'cancel' && cancellation && (
          <CancelDialog
            organizationId={organizationId}
            client={client}
            view={cancellation}
            onClose={() => setModal(null)}
            onDone={load}
          />
        )}
      </div>
    </div>
  )
}
