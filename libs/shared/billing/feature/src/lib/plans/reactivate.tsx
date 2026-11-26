/*
 * Once the subscription has ended: the usage page says so ("Your subscription ended on …") with
 * the way back. "Reactivate" opens a plan picker (monthly or yearly, the last plan picked), then
 * a review of what is charged today and when it renews, ending with "Reactivate and pay $X". A
 * contract, or an account not managed from the console yet, sends a request staff act on instead.
 * Before the end date, "Keep my subscription" (PlannedBanners) is the way back.
 */
import { useRef, useState } from 'react'
import {
  BillingError,
  type Period,
  type PricingClient,
  type Reactivation,
  type ReactivationResult,
} from '@qovery/shared/billing/data-access'
import { Badge, Button, Callout, Icon, Modal, RadioGroup, SegmentedControl } from '@qovery/shared/ui'
import { errorText, notifySuccess } from '../components/parts'
import { openPaymentMethodPage } from '../invoices/invoices-page'
import { date, money, monthly } from '../utils/format'
import { changeBlockedText, newIdempotencyKey } from '../utils/rules'
import { Fact } from './plan-change'

/** The banner shown while the subscription has ended. Billing roles only. */
export function SubscriptionEndedBanner({
  view,
  onReactivate,
  onContactSales,
  preview = false,
}: {
  view: Reactivation
  onReactivate: () => void
  onContactSales?: () => void
  /** A staff preview simulates the reactivation even where the customer could not confirm it. */
  preview?: boolean
}) {
  const blocked =
    view.mode === 'unavailable' && !preview ? changeBlockedText(view.unavailable ?? undefined, 'reactivate') : null
  const requested = view.mode === 'request' && view.current?.status === 'requested'
  return (
    <Callout.Root color="yellow">
      <Callout.Icon>
        <Icon iconName="calendar-xmark" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>
          Your subscription ended{view.ended_on ? ` on ${date(view.ended_on)}` : ''}
        </Callout.TextHeading>
        New deployments are paused. Running applications, databases and clusters keep running.
        {requested ? (
          <div className="mt-2">
            You asked on {date(view.current!.requested_at)} to reactivate it. We get back to you shortly.
          </div>
        ) : blocked ? (
          <div className="mt-2">
            {blocked.body}
            {blocked.contact && onContactSales && (
              <>
                {' '}
                <button type="button" className="font-medium text-brand hover:underline" onClick={onContactSales}>
                  Contact us
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-2">
            <Button size="sm" onClick={onReactivate}>
              {view.mode === 'request' ? 'Ask us to reactivate' : 'Reactivate'}
            </Button>
          </div>
        )}
      </Callout.Text>
    </Callout.Root>
  )
}

/** Pick a plan, review today's charge and the renewal, reactivate (or send the request). */
export function ReactivateFlow({
  organizationId,
  client,
  view,
  onClose,
  onDone,
}: {
  organizationId: string
  client: PricingClient
  view: Reactivation
  onClose: () => void
  onDone: () => void
}) {
  const [period, setPeriod] = useState<Period>(view.period)
  const [pick, setPick] = useState<string | undefined>(view.default_plan || view.plans[0]?.code)
  const [step, setStep] = useState<'choose' | 'card' | 'review' | 'done'>('choose')
  const [result, setResult] = useState<ReactivationResult>()
  const [done, setDone] = useState<ReactivationResult>()
  const attempts = useRef(new Map<string, string>())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = view.mode === 'request'
  const cur = view.currency
  const chosen = view.plans.find((p) => p.code === pick)
  const q = result?.quote

  async function review() {
    if (!pick) return
    setBusy(true)
    setError('')
    try {
      const r = await client.quoteReactivation!(organizationId, pick, period)
      setResult(r)
      setStep(
        !request && r.quote && r.quote.charge_today > 0 && view.payment_method_on_file === false ? 'card' : 'review'
      )
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  async function cardAdded() {
    setBusy(true)
    setError('')
    try {
      const v = await client.reactivation!(organizationId)
      if (v.payment_method_on_file === false)
        setError('No payment method yet. Add one on the page that opened, then try again.')
      else setStep('review')
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  async function confirm() {
    if (!pick || busy) return
    if (client.mode === 'preview') {
      setDone({ preview: true })
      setStep('done')
      return
    }
    if (!client.reactivate) return
    const selection = JSON.stringify([organizationId, pick, period])
    const key = attempts.current.get(selection) ?? newIdempotencyKey()
    attempts.current.set(selection, key)
    setBusy(true)
    setError('')
    try {
      const r = await client.reactivate(organizationId, pick, period, key)
      setDone(r)
      setStep('done')
      notifySuccess(
        client,
        r.status === 'requested' ? 'Request sent' : 'Subscription reactivated',
        r.status === 'requested' ? 'We get back to you shortly.' : 'New deployments resume now.'
      )
      onDone()
    } catch (e) {
      if (e instanceof BillingError) {
        if (e.code === 'PAYMENT_FAILED' || e.code === 'PAYMENT_METHOD_REQUIRED') attempts.current.delete(selection)
        if (e.code === 'PAYMENT_METHOD_REQUIRED') setStep('card')
      }
      setError(
        e instanceof BillingError && e.code === 'PAYMENT_FAILED'
          ? `The payment failed: ${e.message} Nothing was started.`
          : errorText(e)
      )
    }
    setBusy(false)
  }

  const title =
    step === 'choose'
      ? 'Reactivate your subscription'
      : step === 'card'
        ? 'Add a payment method'
        : step === 'review'
          ? `Review: ${chosen?.name ?? ''}`
          : 'Done'
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o && !busy) onClose()
      }}
      width="min(720px, calc(100vw - 24px))"
      buttonClose={false}
      dismissible={!busy}
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="flex items-start gap-3 border-b border-neutral px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="h4 text-neutral">{title}</h2>
            <p className="text-sm text-neutral-subtle">
              {step === 'choose' &&
                (request
                  ? 'Pick the plan you want. Your account manager starts it with you.'
                  : 'A new term starts today, on the plan you pick.')}
              {step === 'card' && 'The new term is paid by card. Add one, then come back here.'}
              {step === 'review' &&
                (request ? 'Check the plan before you send the request.' : 'Check what you pay before you confirm.')}
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
          {step === 'choose' && (
            <>
              <SegmentedControl.Root
                value={period}
                onValueChange={(v) => {
                  if (v !== 'month' && v !== 'year') return
                  setPeriod(v)
                  setPick((code) =>
                    view.plans.some((p) => p.code === code && monthly(p.prices, cur, v) != null) ? code : undefined
                  )
                }}
              >
                <SegmentedControl.Item value="month">Monthly</SegmentedControl.Item>
                <SegmentedControl.Item value="year">Yearly</SegmentedControl.Item>
              </SegmentedControl.Root>
              <RadioGroup.Root className="flex flex-col gap-2" value={pick ?? ''} onValueChange={setPick}>
                {view.plans.map((p) => {
                  const m = monthly(p.prices, cur, period)
                  const sold = m != null
                  return (
                    <label
                      key={p.code}
                      htmlFor={`reactivate-${p.code}`}
                      className={`flex items-start gap-3 rounded border p-4 ${sold ? 'cursor-pointer hover:bg-surface-neutral-subtle' : 'cursor-default opacity-60'} ${pick === p.code ? 'border-brand-strong bg-surface-neutral' : 'border-neutral'}`}
                    >
                      <RadioGroup.Item id={`reactivate-${p.code}`} value={p.code} disabled={!sold} className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-neutral">{p.name}</span>
                          {view.last_plan?.code === p.code && (
                            <Badge className="font-medium" color="neutral" variant="surface" size="sm">
                              Your last plan
                            </Badge>
                          )}
                        </div>
                        {p.description && <div className="text-sm text-neutral-subtle">{p.description}</div>}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-neutral">
                        {sold ? (
                          <>
                            {money(m, cur)}
                            <span className="text-sm text-neutral-subtle"> / month</span>
                            {period === 'year' && (
                              <div className="text-sm text-neutral-subtle">
                                {money(p.prices.find((x) => x.period === 'year' && x.currency === cur)!.amount, cur)}{' '}
                                billed yearly
                              </div>
                            )}
                          </>
                        ) : (
                          'Not sold per ' + period
                        )}
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
                there, then come back to finish.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="md"
                  onClick={() => openPaymentMethodPage(client, organizationId).catch((e) => setError(errorText(e)))}
                >
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Fact label="Plan" hint={`Billed ${q.period === 'year' ? 'yearly' : 'monthly'}`}>
                  {q.name}
                </Fact>
                <Fact
                  label="Starts"
                  hint={request ? 'Once your account manager starts it' : 'New deployments resume at once'}
                >
                  {request ? 'When confirmed' : 'Today'}
                </Fact>
                <Fact label={request ? 'First invoice' : 'Today'} hint={`For the first ${q.period}`}>
                  {money(q.charge_today, q.currency)}
                </Fact>
                <Fact label="Renews" hint={`Then ${money(q.next_invoice, q.currency)} every ${q.period}`}>
                  {request ? `Every ${q.period}` : date(q.next_renewal_on)}
                </Fact>
              </div>
              <p className="text-sm text-neutral-subtle">{q.tax_note}</p>
            </div>
          )}
          {step === 'done' && (
            <Callout.Root color={done?.status === 'requested' ? 'sky' : 'green'}>
              <Callout.Text>
                <Callout.TextHeading>
                  {client.mode === 'preview'
                    ? 'Preview: this is what the customer would get'
                    : done?.status === 'requested'
                      ? 'Request sent'
                      : `You are on ${chosen?.name} again`}
                </Callout.TextHeading>
                {client.mode === 'preview'
                  ? 'Nothing was changed.'
                  : done?.status === 'requested'
                    ? 'Your account manager starts the subscription with you.'
                    : `New deployments resume now. Your next invoice is on ${date(q?.next_renewal_on)}.`}
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
            <Button
              size="lg"
              disabled={!chosen || monthly(chosen.prices, cur, period) == null || busy}
              loading={busy}
              onClick={review}
            >
              Review
            </Button>
          )}
          {step === 'card' && (
            <Button size="lg" variant="plain" color="neutral" disabled={busy} onClick={() => setStep('choose')}>
              Back
            </Button>
          )}
          {step === 'review' && (
            <>
              <Button size="lg" variant="plain" color="neutral" onClick={() => setStep('choose')}>
                Back
              </Button>
              <Button
                size="lg"
                disabled={busy || (client.mode !== 'preview' && !client.reactivate)}
                loading={busy}
                onClick={confirm}
              >
                {client.mode === 'preview'
                  ? 'Finish preview'
                  : request
                    ? 'Send the request'
                    : q && q.charge_today > 0
                      ? `Reactivate and pay ${money(q.charge_today, q.currency)}`
                      : 'Reactivate'}
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
