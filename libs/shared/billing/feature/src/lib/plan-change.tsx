/*
 * Change plan: pick a plan (monthly or yearly, the current one marked), review what changes and
 * what it costs today and on the next invoice, then confirm. A paid plan without a card on file
 * asks for one first (Chargebee's page) and comes back. When this organization cannot change its
 * plan from the console (read-only billing, an account not handed over yet, a contract, AWS
 * Marketplace, a cancellation scheduled), the flow still compares and quotes, and says what to
 * do instead of confirming. Upgrades apply now; downgrades wait for the end of the term.
 * With `proposal` (a plan Qovery staff suggested), it opens on the review of that plan and period
 * and quotes and confirms through the proposal, so its concession applies; picking another plan
 * makes it a plain plan change.
 */
import type { BillingUsage, Period, PlanOption, PublicPlans } from 'qovery-pricing-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import {
  BillingError,
  type PlanChangeResult,
  type PlanOptions,
  type PlanProposal,
  type PricingClient,
} from '@qovery/shared/billing/data-access'
import { Badge, Button, Callout, Icon, Modal, RadioGroup, SegmentedControl } from '@qovery/shared/ui'
import { date, money, monthly, valueText } from './format'
import { openPaymentMethodPage } from './invoices-page'
import { errorText } from './parts'
import { ProposalNote, hideProposal } from './proposals'
import { changeBlockedText, changeKind, isProposalChange, newIdempotencyKey } from './rules'

/** A labelled figure in a review (what changes, today, the next invoice). */
export function Fact({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded border border-neutral bg-surface-neutral p-4">
      <div className="mb-1 text-sm text-neutral-subtle">{label}</div>
      <div className="text-sm font-medium text-neutral">{children}</div>
      {hint && <div className="mt-0.5 text-sm text-neutral-subtle">{hint}</div>}
    </div>
  )
}

export function PlanChangeFlow({
  organizationId,
  client,
  usage,
  preselect,
  prePeriod,
  onClose,
  onDone,
  onContactSales,
  proposal,
}: {
  organizationId: string
  client: PricingClient
  usage: BillingUsage
  preselect?: string
  prePeriod?: Period
  onClose: () => void
  onDone: () => void
  onContactSales?: () => void
  /** A plan proposal to review: its plan, period and concession. */
  proposal?: PlanProposal
}) {
  const [options, setOptions] = useState<PlanOptions>()
  const [plans, setPlans] = useState<PublicPlans>()
  const [period, setPeriod] = useState<Period>(proposal?.period ?? prePeriod ?? usage.billing.period)
  const [pick, setPick] = useState<string | undefined>(proposal?.plan.code ?? preselect)
  const [step, setStep] = useState<'choose' | 'card' | 'review' | 'done'>('choose')
  const [result, setResult] = useState<PlanChangeResult>()
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = () =>
    client
      .planOptions?.(organizationId)
      .then(setOptions)
      .catch((e) => setError(errorText(e)))
  useEffect(() => {
    load()
    client
      .publicPlans()
      .then(setPlans)
      .catch(() => undefined)
  }, [client, organizationId]) // eslint-disable-line react-hooks/exhaustive-deps
  // A proposal opens straight on its review, once the plans are read.
  const [opened, setOpened] = useState(false)
  useEffect(() => {
    if (!proposal || opened || !options) return
    setOpened(true)
    review()
  }, [proposal, options]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = options?.currency ?? usage.billing.currency
  const currentPeriod = options?.period ?? usage.billing.period
  const current = options?.results.find((o) => o.current)
  const blocked = changeBlockedText(options?.change, 'plan')
  const saving = Math.max(
    0,
    ...(plans?.plans ?? []).flatMap((p) => p.yearly_saving.filter((s) => s.currency === cur).map((s) => s.saving_pct))
  )
  const priceOf = (o: PlanOption) => {
    const p = plans?.plans.find((x) => x.code === o.plan.code)
    if (!p) {
      if (!o.quote || o.quote.period !== period) return null
      return period === 'year'
        ? { amount: Math.round(o.quote.total / 12), yearly: o.quote.total }
        : { amount: o.quote.total }
    }
    const m = monthly(p.prices, cur, period)
    return m == null
      ? null
      : {
          amount: m,
          yearly:
            period === 'year' ? p.prices.find((x) => x.currency === cur && x.period === 'year')?.amount : undefined,
        }
  }
  // The current plan is selectable on the other billing period (monthly to yearly and back).
  const selectable = (o: PlanOption) => !o.current || period !== currentPeriod
  const contactOnly = (o: PlanOption) => !priceOf(o) || plans?.plans.find((x) => x.code === o.plan.code)?.contact_sales
  const chosen = options?.results.find((o) => o.plan.code === pick)
  const q = result?.quote
  const bill = result?.bill
  const recommended = useMemo(
    () =>
      options?.results.find((o) => !o.current && o.quote?.direction === 'upgrade' && o.quote.conflicts.length === 0)
        ?.plan.code,
    [options]
  )

  // The proposal's own change goes through the proposal (its concession); another pick does not.
  const viaProposal = isProposalChange(proposal, pick, period)
  const unsupportedProposal = viaProposal && (!client.quoteProposal || !client.acceptProposal)
  const canConfirm = client.mode === 'live' && !blocked && (viaProposal ? !!client.acceptProposal : !!client.changePlan)
  async function review() {
    if (!pick || busy || (!viaProposal && !client.quotePlanChange)) return
    if (unsupportedProposal) {
      setError('This proposal cannot be reviewed here. Contact Qovery for help.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const r =
        viaProposal && proposal
          ? await client.quoteProposal!(organizationId, proposal.id)
          : await client.quotePlanChange!(organizationId, pick, period)
      setResult(r)
      setKey(newIdempotencyKey())
      setStep(
        r.quote.total > 0 && options?.payment_method_on_file === false && r.quote.direction !== 'same'
          ? 'card'
          : 'review'
      )
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  async function addCard() {
    setError('')
    try {
      await openPaymentMethodPage(client, organizationId)
    } catch (e) {
      setError(errorText(e))
    }
  }
  async function cardAdded() {
    setBusy(true)
    setError('')
    try {
      const o = await client.planOptions!(organizationId)
      setOptions(o)
      if (o.payment_method_on_file === false)
        setError('No payment method yet. Add one on the page that opened, then try again.')
      else setStep('review')
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  async function confirm() {
    if (busy || !pick || !q?.can_apply || unsupportedProposal) return
    if (client.mode === 'preview') {
      setStep('done')
      return
    }
    if (!canConfirm) return
    setBusy(true)
    setError('')
    try {
      setResult(
        viaProposal && proposal
          ? await client.acceptProposal!(organizationId, proposal.id, key)
          : await client.changePlan!(organizationId, pick, period, key)
      )
      if (viaProposal && proposal) hideProposal(client, organizationId, proposal.id)
      setStep('done')
      onDone()
    } catch (e) {
      if (e instanceof BillingError && e.code === 'PAYMENT_METHOD_REQUIRED') setStep('card')
      setError(errorText(e))
    }
    setBusy(false)
  }

  const title =
    step === 'choose'
      ? 'Change plan'
      : step === 'card'
        ? 'Add a payment method'
        : step === 'review'
          ? `${q ? changeKind(q, currentPeriod) : 'Review'}: ${chosen?.plan.name ?? ''}`
          : 'Done'
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o && !busy) onClose()
      }}
      width="min(760px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex max-h-[75vh] flex-col">
        <div className="flex items-start gap-3 border-b border-neutral px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="h4 text-neutral">{title}</h2>
            <p className="text-sm text-neutral-subtle">
              {step === 'choose' &&
                `You are on ${usage.plan.name}, billed ${currentPeriod === 'year' ? 'yearly' : 'monthly'}.`}
              {step === 'card' && 'The new plan is paid by card. Add one, then come back here.'}
              {step === 'review' && 'Check what changes and what you pay before you confirm.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            disabled={busy}
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
          {blocked && step !== 'done' && (
            <Callout.Root color="neutral">
              <Callout.Icon>
                <Icon iconName="circle-info" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>{blocked.title}</Callout.TextHeading>
                {blocked.body}
              </Callout.Text>
            </Callout.Root>
          )}

          {step === 'choose' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SegmentedControl.Root
                  className="max-sm:auto-cols-auto"
                  value={period}
                  aria-disabled={busy}
                  onValueChange={(v) => {
                    if (busy) return
                    setPeriod(v as Period)
                    setPick(undefined)
                  }}
                >
                  <SegmentedControl.Item value="month">Monthly</SegmentedControl.Item>
                  <SegmentedControl.Item value="year">
                    Yearly{saving ? ` (save ${Math.round(saving)}%)` : ''}
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
                {options?.scheduled_change && (
                  <span className="text-sm text-neutral-subtle">
                    {options.scheduled_change.name} is planned from {date(options.scheduled_change.effective_on)}
                  </span>
                )}
              </div>
              {!options && !error && <div className="text-sm text-neutral-subtle">Loading plans…</div>}
              <RadioGroup.Root
                className="flex flex-col gap-2"
                value={pick ?? ''}
                disabled={busy}
                onValueChange={setPick}
              >
                {options?.results.map((o) => {
                  const price = priceOf(o)
                  const sales = contactOnly(o)
                  const disabled = !selectable(o) || !!sales
                  return (
                    <label
                      key={o.plan.code}
                      htmlFor={`plan-${o.plan.code}`}
                      className={`flex items-start gap-3 rounded border p-4 transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer hover:bg-surface-neutral-subtle'} ${pick === o.plan.code ? 'border-brand-strong bg-surface-neutral' : 'border-neutral'}`}
                    >
                      <RadioGroup.Item
                        id={`plan-${o.plan.code}`}
                        value={o.plan.code}
                        disabled={disabled}
                        className="mt-0.5"
                      />
                      {/* On a phone the price goes under the plan, so the badges keep the full width */}
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-neutral">{o.plan.name}</span>
                            {o.current && (
                              <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                                {period === currentPeriod
                                  ? 'Current plan'
                                  : `Current plan, billed ${currentPeriod === 'year' ? 'yearly' : 'monthly'}`}
                              </Badge>
                            )}
                            {recommended === o.plan.code && (
                              <Badge className="font-medium" color="brand" variant="surface" size="sm">
                                Recommended
                              </Badge>
                            )}
                            {!o.current && current && o.plan.rank < current.plan.rank && (
                              <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                                From the end of your term
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-neutral-subtle">
                            {o.highlights.map((h) => `${valueText(h.value)} ${h.sku.split('.')[0]}`).join(' · ')}
                          </div>
                          {o.quote && o.quote.conflicts.length > 0 && (
                            <div className="mt-1 text-sm text-warning">
                              {o.quote.conflicts.length} limit{o.quote.conflicts.length > 1 ? 's' : ''} above this plan
                              today
                            </div>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-sm text-neutral sm:text-right">
                          {sales ? (
                            onContactSales ? (
                              <button type="button" className="text-brand hover:underline" onClick={onContactSales}>
                                Talk to sales
                              </button>
                            ) : (
                              'On request'
                            )
                          ) : (
                            price && (
                              <>
                                {money(price.amount, cur)}
                                <span className="text-sm text-neutral-subtle"> / month</span>
                                {price.yearly != null && (
                                  <div className="text-sm text-neutral-subtle">
                                    {money(price.yearly, cur)} billed yearly
                                  </div>
                                )}
                              </>
                            )
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </RadioGroup.Root>
            </>
          )}

          {step === 'card' && (
            <div className="flex flex-col gap-3 text-sm text-neutral">
              <p>
                Your card is saved on Chargebee's secure page, never by Qovery. It opens in a new tab: add the card
                there, then come back to finish the change.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="md" onClick={addCard}>
                  <Icon iconName="credit-card" iconStyle="regular" />
                  Add a payment method
                </Button>
                <Button size="md" variant="outline" color="neutral" loading={busy} onClick={cardAdded}>
                  I added it, continue
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && q && (
            <div className="flex flex-col gap-4">
              {viaProposal && proposal && <ProposalNote proposal={proposal} />}
              {q.direction === 'same' ? (
                <p className="text-sm text-neutral">{q.message}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Fact label="What changes" hint={`Billed ${q.period === 'year' ? 'yearly' : 'monthly'}`}>
                      {usage.plan.name} → {chosen?.plan.name}
                    </Fact>
                    <Fact
                      label="Takes effect"
                      hint={
                        q.effective_at === 'now' ? 'New limits apply at once' : 'You keep your current plan until then'
                      }
                    >
                      {q.effective_at === 'now'
                        ? 'Today'
                        : date(bill?.effective_on ?? options?.term_end ?? usage.billing.term_end)}
                    </Fact>
                    <Fact
                      label="Today"
                      hint={
                        bill && bill.charge_today > 0 ? (
                          <>
                            {money(bill.charge_today, q.currency)} for {chosen?.plan.name}{' '}
                            {q.period === currentPeriod
                              ? `until ${date(bill.next_invoice_on)}`
                              : `for the first ${q.period}`}
                            , less {money(bill.credit_today, q.currency)} unused on {usage.plan.name}
                            {bill.credit_left > 0
                              ? `. ${money(bill.credit_left, q.currency)} stays as credit for your next invoices`
                              : ''}
                          </>
                        ) : (
                          'Nothing is charged today'
                        )
                      }
                    >
                      {bill ? money(bill.due_today, q.currency) : '—'}
                    </Fact>
                    <Fact
                      label="Next invoice"
                      hint={bill ? `On ${date(bill.next_invoice_on)}, then every ${q.period}` : undefined}
                    >
                      {money(bill?.next_invoice ?? q.total, q.currency)}
                      <span className="text-sm font-normal text-neutral-subtle"> / {q.period}</span>
                    </Fact>
                  </div>
                  {result?.concession && (
                    <p className="text-sm text-positive">
                      {result.concession.label}: {money(result.concession.amount, q.currency)} less per {q.period},
                      already taken off above.
                    </p>
                  )}
                  {result?.discount && (
                    <p className="text-sm text-positive">
                      {result.discount.label}: {result.discount.percent}% off,{' '}
                      {money(result.discount.amount, q.currency)} less per {q.period}.
                    </p>
                  )}
                  {q.auto_addons.length > 0 && (
                    <div className="rounded border border-neutral p-4 text-sm">
                      <div className="mb-1 font-medium text-neutral">Added to keep what you use today</div>
                      {q.auto_addons.map((a) => (
                        <div key={a.code} className="flex justify-between text-neutral-subtle">
                          <span>
                            {a.quantity} × {a.name}
                          </span>
                          <span>
                            {money(a.amount, q.currency)} / {q.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.kept_addons.length > 0 && (
                    <div className="text-sm text-neutral-subtle">
                      Kept: {q.kept_addons.map((a) => `${a.quantity} × ${a.name}`).join(', ')}
                    </div>
                  )}
                  {q.projected_overage > 0 && (
                    <div className="text-sm text-neutral-subtle">
                      At today's usage, about {money(q.projected_overage, q.currency)} per {q.period} would be billed
                      above the plan.
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
                  <p className="text-sm text-neutral-subtle">
                    Amounts are estimates before tax: Chargebee computes the exact invoice.
                  </p>
                </>
              )}
            </div>
          )}

          {step === 'done' && q && (
            <Callout.Root color={result?.applied ? 'green' : 'sky'}>
              <Callout.Text>
                <Callout.TextHeading>
                  {!result?.applied
                    ? 'Preview: this is what the customer would get'
                    : q.direction === 'same'
                      ? `You keep ${usage.plan.name}`
                      : q.effective_at === 'now'
                        ? `You are now on ${chosen?.plan.name}`
                        : `${chosen?.plan.name} starts on ${date(bill?.effective_on ?? options?.term_end ?? usage.billing.term_end)}`}
                </Callout.TextHeading>
                {!result?.applied
                  ? `${money(q.total, q.currency)} per ${q.period}, ${q.effective_at === 'now' ? 'from today' : 'at the end of the term'}. Nothing was changed.`
                  : q.direction === 'same'
                    ? 'The change planned for the renewal is cancelled.'
                    : q.effective_at === 'now'
                      ? 'Your new limits apply right away. The billing roles get an email.'
                      : 'Until then nothing changes. You can keep your current plan from the usage page.'}
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
              {blocked?.contact && onContactSales && (
                <Button size="lg" variant="outline" color="neutral" onClick={onContactSales}>
                  Contact us
                </Button>
              )}
              <Button size="lg" disabled={!pick || busy} loading={busy} onClick={review}>
                Review
              </Button>
            </>
          )}
          {step === 'card' && (
            <Button size="lg" variant="plain" color="neutral" onClick={() => setStep('choose')}>
              Back
            </Button>
          )}
          {step === 'review' && (
            <>
              <Button size="lg" variant="plain" color="neutral" onClick={() => setStep('choose')}>
                Back
              </Button>
              {blocked?.contact && onContactSales ? (
                <Button size="lg" onClick={onContactSales}>
                  Contact us
                </Button>
              ) : (
                <Button
                  size="lg"
                  loading={busy}
                  disabled={busy || !q?.can_apply || !(canConfirm || client.mode === 'preview')}
                  onClick={confirm}
                >
                  {q?.direction === 'same'
                    ? 'Keep my current plan'
                    : q?.effective_at === 'now'
                      ? bill && bill.due_today > 0
                        ? `Confirm and pay ${money(bill.due_today, q.currency)}`
                        : 'Confirm'
                      : 'Schedule the change'}
                </Button>
              )}
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
