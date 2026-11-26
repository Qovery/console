/*
 * Prepaid credits on the usage page: what is left of each balance, the purchases, and "Buy
 * credits": pick what to buy and how much, see the live quote (today's charge, the saving against
 * pay as you go, the balance after), then pay with the card on file. Credits are added only once
 * the payment goes through. Members see their balances, never prices or the buy button.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BillingError,
  type BillingUsage,
  type CreditOption,
  type CreditPurchaseResult,
  type Credits,
  type PricingClient,
} from '@qovery/shared/billing/data-access'
import { Button, Callout, Icon, InputText, Modal, RadioGroup, SegmentedControl } from '@qovery/shared/ui'
import { errorText, notifySuccess } from '../components/parts'
import { openPaymentMethodPage } from '../invoices/invoices-page'
import { Fact } from '../plans/plan-change'
import { date, money, num } from '../utils/format'
import { changeBlockedText, creditQuantityError, newIdempotencyKey, quantity } from '../utils/rules'

const NO_EXPIRY = 'No expiry date'

/** The usage page's Prepaid credits card. */
export function PrepaidCredits({
  organizationId,
  client,
  usage,
  onContactSales,
  onChanged,
}: {
  organizationId: string
  client: PricingClient
  usage: BillingUsage
  onContactSales?: () => void
  onChanged?: () => void
}) {
  const billing = usage.access !== 'member' && !!client.credits
  const [credits, setCredits] = useState<Credits>()
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  // A pricing-api without the credits API (404) shows no card rather than an error.
  const load = () =>
    client
      .credits?.(organizationId)
      .then((c) => {
        setCredits(c)
        setError('')
      })
      .catch((e) => setError(e instanceof BillingError && e.status === 404 ? '' : errorText(e)))
  useEffect(() => {
    if (billing) load()
  }, [client, organizationId, billing]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!billing) {
    // Members: balances only, from the plan and usage answer.
    if (usage.prepaid_credits.length === 0) return null
    return (
      <section className="rounded border border-neutral bg-surface-neutral">
        <Header />
        <div className="divide-y divide-neutral border-t border-neutral">
          {usage.prepaid_credits.map((c) => (
            <div key={c.sku} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 text-sm">
              <span className="font-medium text-neutral">{c.name}</span>
              <span className="text-neutral">
                {quantity(c.remaining, c.unit)} left{' '}
                <span className="text-sm text-neutral-subtle">· {NO_EXPIRY.toLowerCase()}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    )
  }
  const loadError = error && (
    <Callout.Root color="red">
      <Callout.Text>{error}</Callout.Text>
      <Button size="sm" variant="outline" color="neutral" onClick={load}>
        Retry
      </Button>
    </Callout.Root>
  )
  if (!credits) return loadError || null
  if (credits.options.length === 0 && credits.balances.length === 0 && credits.purchases.length === 0) return null
  const cur = credits.currency
  const blocked = changeBlockedText(credits.buy, 'credits')
  return (
    <section className="rounded border border-neutral bg-surface-neutral">
      <Header
        action={
          credits.options.length > 0 && client.buyCredits ? (
            <Button size="md" onClick={() => setOpen(true)}>
              <Icon iconName="plus" iconStyle="regular" />
              Buy credits
            </Button>
          ) : undefined
        }
      />
      {loadError && <div className="px-5 pb-4">{loadError}</div>}
      {blocked && (
        <div className="px-5 pb-4">
          <p className="text-sm text-neutral-subtle">
            {blocked.title}. {blocked.body}
          </p>
        </div>
      )}
      <div className="border-t border-neutral">
        {credits.balances.length === 0 ? (
          <p className="px-5 py-4 text-sm text-neutral-subtle">
            No prepaid credits yet. Prepaid units cost the same as pay as you go, are paid upfront and are used before
            any overage.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-neutral-subtle">
                <th className="px-5 py-2 font-medium">Credits</th>
                <th className="px-3 py-2 text-right font-medium">Bought</th>
                <th className="px-3 py-2 text-right font-medium">Used this month</th>
                <th className="px-3 py-2 text-right font-medium">Left</th>
                <th className="px-5 py-2 text-right font-medium">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {credits.balances.map((b) => (
                <tr key={b.sku}>
                  <td className="px-5 py-2 text-neutral">{b.name}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-neutral">{quantity(b.bought, b.unit)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-neutral">{quantity(b.drawing, b.unit)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-neutral">
                    {quantity(b.remaining, b.unit)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-2 text-right text-neutral-subtle">
                    {b.expires_on ? date(b.expires_on) : NO_EXPIRY}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {credits.auto_reload
        .filter((a) => a.enabled)
        .map((a) => (
          <p key={a.sku} className="border-t border-neutral px-5 py-3 text-sm text-neutral-subtle">
            Auto-reload is on for {a.name.toLowerCase()}: {quantity(a.reload_units, '')} more are bought when{' '}
            {quantity(a.below_units, '')} or fewer are left.
          </p>
        ))}
      {credits.purchases.length > 0 && (
        <div className="border-t border-neutral">
          <h4 className="px-5 pb-1 pt-4 text-sm font-medium text-neutral">Purchases</h4>
          <div className="max-h-[320px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-neutral">
                <tr className="text-left text-sm text-neutral-subtle">
                  <th className="px-5 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Credits</th>
                  <th className="px-3 py-2 text-right font-medium">Quantity</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-5 py-2 font-medium">Bought by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {credits.purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-5 py-2 text-neutral">{date(p.date)}</td>
                    <td className="px-3 py-2 text-neutral">
                      <span className="whitespace-nowrap">{p.name}</span>
                      {p.invoice_id && (
                        <span className="block whitespace-nowrap text-sm text-neutral-subtle">
                          Invoice {p.invoice_id}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-neutral">{num(p.quantity)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-neutral">
                      {money(p.amount, p.currency || cur)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2 text-neutral-subtle">{p.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {open && (
        <BuyCreditsDialog
          organizationId={organizationId}
          client={client}
          credits={credits}
          onClose={() => setOpen(false)}
          onContactSales={onContactSales}
          onDone={(c) => {
            if (c) setCredits(c)
            else load()
            onChanged?.()
          }}
        />
      )}
    </section>
  )
}

function Header({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-5">
      <div>
        <h3 className="text-base font-medium text-neutral">Prepaid credits</h3>
        <p className="mt-1 text-sm text-neutral-subtle">
          Units paid upfront, used before any overage. They have no expiry date.
        </p>
      </div>
      {action}
    </div>
  )
}

/** Buy credits: pick, see the quote as you type, pay with the card on file. */
export function BuyCreditsDialog({
  organizationId,
  client,
  credits,
  onClose,
  onDone,
  onContactSales,
  initial,
}: {
  organizationId: string
  client: PricingClient
  credits: Credits
  onClose: () => void
  onDone: (c?: Credits) => void
  onContactSales?: () => void
  initial?: { sku?: string; quantity?: number; annual?: boolean }
}) {
  const [sku, setSku] = useState(initial?.sku ?? credits.options[0]?.sku ?? '')
  const opt: CreditOption | undefined = credits.options.find((o) => o.sku === sku)
  const [qty, setQty] = useState(String(initial?.quantity ?? opt?.packs[0] ?? opt?.min ?? ''))
  const [annual, setAnnual] = useState(!!initial?.annual)
  const [quote, setQuote] = useState<CreditPurchaseResult>()
  const [quoting, setQuoting] = useState(false)
  const [step, setStep] = useState<'pick' | 'card'>(credits.payment_method_on_file === false ? 'card' : 'pick')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const attempts = useRef(new Map<string, string>())
  const n = Number(qty)
  const invalid = opt ? creditQuantityError(opt, n, annual) : 'Pick what to buy'
  const blocked = changeBlockedText(credits.buy, 'credits')
  const cur = credits.currency
  // Suggested quantities the server accepts: a year upfront is one year of the plan's minutes.
  const packs = useMemo(
    () => (annual && opt?.annual ? [opt.annual.min] : (opt?.packs ?? []).filter((n) => n >= opt!.min && n <= opt!.max)),
    [opt, annual]
  )

  // The quote follows what is typed, a moment after the last key.
  useEffect(() => {
    setQuote(undefined)
    if (!opt || invalid || !client.quoteCredits) return
    let live = true
    setQuoting(true)
    const t = setTimeout(() => {
      client.quoteCredits!(organizationId, { sku, quantity: n, annual: annual || undefined })
        .then((r) => {
          if (live) {
            setQuote(r)
            setError('')
          }
        })
        .catch((e) => live && setError(errorText(e)))
        .finally(() => live && setQuoting(false))
    }, 250)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [client, organizationId, sku, n, annual, invalid]) // eslint-disable-line react-hooks/exhaustive-deps

  function pick(next: string) {
    const o = credits.options.find((x) => x.sku === next)
    setSku(next)
    setAnnual(false)
    setQty(String(o?.packs[0] ?? o?.min ?? ''))
  }
  async function cardAdded() {
    setBusy(true)
    setError('')
    try {
      const c = await client.credits!(organizationId)
      if (c.payment_method_on_file === false)
        setError('No payment method yet. Add one on the page that opened, then try again.')
      else setStep('pick')
    } catch (e) {
      setError(errorText(e))
    }
    setBusy(false)
  }
  async function pay() {
    if (!quote?.quote || !client.buyCredits || busy) return
    const purchase = { sku, quantity: n, annual: annual || undefined }
    const selection = JSON.stringify([organizationId, purchase])
    const key = attempts.current.get(selection) ?? newIdempotencyKey()
    attempts.current.set(selection, key)
    setBusy(true)
    setError('')
    try {
      const r = await client.buyCredits(organizationId, purchase, key)
      if (r.applied)
        notifySuccess(
          client,
          'Credits added',
          `${quantity(n, opt?.unit ?? '')} added. ${money(quote.quote.amount, cur)} was charged to your card.`
        )
      onDone(r.credits)
      onClose()
    } catch (e) {
      if (e instanceof BillingError) {
        if (e.code === 'PAYMENT_FAILED' || e.code === 'PAYMENT_METHOD_REQUIRED') attempts.current.delete(selection)
        if (e.code === 'PAYMENT_METHOD_REQUIRED') setStep('card')
      }
      setError(
        e instanceof BillingError && e.code === 'PAYMENT_FAILED'
          ? `The payment failed: ${e.message} No credits were added.`
          : errorText(e)
      )
    }
    setBusy(false)
  }

  const q = quote?.quote
  return (
    <Modal
      externalOpen
      setExternalOpen={(o) => {
        if (!o && !busy) onClose()
      }}
      width="min(640px, calc(100vw - 24px))"
      buttonClose={false}
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="flex items-start gap-3 border-b border-neutral px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="h4 text-neutral">{step === 'card' ? 'Add a payment method' : 'Buy prepaid credits'}</h2>
            <p className="text-sm text-neutral-subtle">
              {step === 'card'
                ? 'Prepaid credits are paid by card when you buy them.'
                : 'Paid now with the card on file, used before any overage.'}
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
          {client.mode === 'preview' && (
            <Callout.Root color="sky">
              <Callout.Text>Preview: quotes are real, nothing is charged.</Callout.Text>
            </Callout.Root>
          )}
          {blocked && step === 'pick' && (
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
          {step === 'card' ? (
            <div className="flex flex-col gap-3 text-sm text-neutral">
              <p>
                Your card is saved on Chargebee's secure page, never by Qovery. It opens in a new tab: add the card
                there, then come back to buy.
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
          ) : (
            <>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium text-neutral">What to buy</legend>
                <RadioGroup.Root className="flex flex-col gap-2" value={sku} onValueChange={pick}>
                  {credits.options.map((o) => (
                    <label
                      key={o.sku}
                      htmlFor={`credit-${o.sku}`}
                      className={`flex cursor-pointer items-center gap-3 rounded border p-3 ${sku === o.sku ? 'border-brand-strong bg-surface-neutral' : 'border-neutral'}`}
                    >
                      <RadioGroup.Item id={`credit-${o.sku}`} value={o.sku} />
                      <span className="flex-1 text-sm text-neutral">
                        {o.name}
                        <span className="block text-sm text-neutral-subtle">
                          {num(o.allowance)} {o.unit} included per month in your plan
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-sm text-neutral">
                        {money(o.unit_price, cur)}
                        <span className="text-sm text-neutral-subtle"> / {o.unit.replace(/s$/, '')}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup.Root>
              </fieldset>
              {opt?.annual && (
                <SegmentedControl.Root
                  value={annual ? 'year' : 'pack'}
                  onValueChange={(v) => {
                    const a = v === 'year'
                    setAnnual(a)
                    setQty(String(a ? opt.annual!.min : opt.packs[0] ?? opt.min))
                  }}
                >
                  <SegmentedControl.Item value="pack">A pack</SegmentedControl.Item>
                  <SegmentedControl.Item value="year">
                    A year upfront ({opt.annual.discount_pct}% off)
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              )}
              {opt && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {packs.map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={Number(qty) === p ? 'solid' : 'outline'}
                        color={Number(qty) === p ? 'brand' : 'neutral'}
                        onClick={() => setQty(String(p))}
                      >
                        {quantity(p, opt.unit)}
                      </Button>
                    ))}
                  </div>
                  <InputText
                    name="credit_quantity"
                    type="number"
                    label={`Quantity (${opt.unit})`}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    error={qty && invalid ? invalid : undefined}
                    hint={`From ${num(annual && opt.annual ? opt.annual.min : opt.min)} to ${num(opt.max)}, in steps of ${num(opt.step)}`}
                  />
                </div>
              )}
              {q ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Fact
                      label="Today"
                      hint={`${quantity(q.quantity, q.unit)} at ${money(q.unit_price, q.currency)} each`}
                    >
                      {money(q.amount, q.currency)}
                    </Fact>
                    <Fact
                      label="Against pay as you go"
                      hint={
                        q.saving > 0
                          ? `${money(q.payg_amount, q.currency)} as overage`
                          : 'Paid upfront, used before any overage'
                      }
                    >
                      {q.saving > 0 ? `You save ${money(q.saving, q.currency)}` : 'Same price per unit'}
                    </Fact>
                    <Fact label="Balance after" hint="Prepaid units left once this is added">
                      {quantity(q.balance_after, q.unit)}
                    </Fact>
                    <Fact label="Expires" hint="Prepaid units stay until used">
                      {q.expires_on ? date(q.expires_on) : NO_EXPIRY}
                    </Fact>
                  </div>
                  <p className="text-sm text-neutral-subtle">
                    {q.tax_note} The credits are added once the payment goes through.
                  </p>
                </div>
              ) : quoting && !invalid ? (
                <p className="text-sm text-neutral-subtle">Pricing…</p>
              ) : null}
            </>
          )}
          {error && (
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral px-6 py-3">
          <Button size="lg" variant="plain" color="neutral" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {step === 'pick' &&
            (blocked?.contact && onContactSales && client.mode !== 'preview' ? (
              <Button size="lg" onClick={onContactSales}>
                Contact us
              </Button>
            ) : (
              <Button
                size="lg"
                loading={busy}
                disabled={!q || !!invalid || quoting || (!!blocked && client.mode !== 'preview')}
                onClick={pay}
              >
                {q ? `Pay ${money(q.amount, q.currency)} now` : 'Pay now'}
              </Button>
            ))}
        </div>
      </div>
    </Modal>
  )
}
