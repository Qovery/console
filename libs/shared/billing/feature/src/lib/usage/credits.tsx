import * as Dialog from '@radix-ui/react-dialog'
/*
 * Prepaid credits on the usage page: what is left of each balance, the purchases, and "Buy
 * credits": pick what to buy and how much, see the quoted charge on the pay button,
 * then pay with the card on file. Credits are added only once
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
import { Button, Callout, Heading, Icon, InputText, Modal, RadioGroup, TablePrimitives } from '@qovery/shared/ui'
import { CompactSelect } from '../components/compact-select'
import { errorText, notifySuccess } from '../components/parts'
import { openPaymentMethodPage } from '../invoices/invoices-page'
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
      <section>
        <Heading level={2} className="mb-3">
          Prepaid credits
        </Heading>
        <div className="overflow-hidden rounded border border-neutral bg-surface-neutral">
          <Header />
          <div className="divide-y divide-neutral border-t border-neutral">
            {usage.prepaid_credits.map((c) => (
              <div key={c.sku} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium text-neutral">{c.name}</span>
                <span className="text-neutral">
                  {quantity(c.remaining, c.unit)} left{' '}
                  <span className="text-sm text-neutral-subtle">· {NO_EXPIRY.toLowerCase()}</span>
                </span>
              </div>
            ))}
          </div>
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
    <section>
      <Heading level={2} className="mb-3">
        Prepaid credits
      </Heading>
      <div className="overflow-hidden rounded border border-neutral bg-surface-neutral">
        <div className="flex flex-col items-start gap-4 p-4">
          <div className="text-sm text-neutral-subtle">
            {credits.balances.length === 0 && <p>No prepaid credits yet.</p>}
            {blocked ? <p>{blocked.body}</p> : <p>Prepaid credits never expire.</p>}
          </div>
          {loadError}
          {credits.options.length > 0 && client.buyCredits && (
            <Button size="md" variant="outline" color="neutral" onClick={() => setOpen(true)}>
              <Icon iconName="plus" iconStyle="regular" />
              Buy credits
            </Button>
          )}
        </div>
        {credits.balances.length > 0 && (
          <div className="border-t border-neutral">
            <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
              <TablePrimitives.Table.Header className="text-xs">
                <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                  <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                    Credits
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Bought
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Used this month
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Left
                  </TablePrimitives.Table.ColumnHeaderCell>
                  <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                    Expires
                  </TablePrimitives.Table.ColumnHeaderCell>
                </TablePrimitives.Table.Row>
              </TablePrimitives.Table.Header>
              <TablePrimitives.Table.Body className="divide-y divide-neutral">
                {credits.balances.map((b) => (
                  <TablePrimitives.Table.Row key={b.sku}>
                    <TablePrimitives.Table.Cell className="text-neutral">{b.name}</TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                      {quantity(b.bought, b.unit)}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                      {quantity(b.drawing, b.unit)}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right font-medium text-neutral">
                      {quantity(b.remaining, b.unit)}
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral-subtle">
                      {b.expires_on ? date(b.expires_on) : NO_EXPIRY}
                    </TablePrimitives.Table.Cell>
                  </TablePrimitives.Table.Row>
                ))}
              </TablePrimitives.Table.Body>
            </TablePrimitives.Table.Root>
          </div>
        )}
        {credits.auto_reload
          .filter((a) => a.enabled)
          .map((a) => (
            <p key={a.sku} className="border-t border-neutral px-4 py-3 text-sm text-neutral-subtle">
              Auto-reload is on for {a.name.toLowerCase()}: {quantity(a.reload_units, '')} more are bought when{' '}
              {quantity(a.below_units, '')} or fewer are left.
            </p>
          ))}
        {credits.purchases.length > 0 && (
          <div className="border-t border-neutral">
            <Heading level={3} className="px-4 pb-1 pt-4 text-sm font-medium text-neutral">
              Purchases
            </Heading>
            <div className="max-h-[320px] overflow-auto">
              <TablePrimitives.Table.Root containerClassName="rounded-none border-0" className="w-full text-sm">
                <TablePrimitives.Table.Header className="sticky top-0 bg-surface-neutral text-xs">
                  <TablePrimitives.Table.Row className="text-left text-neutral-subtle">
                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                      Date
                    </TablePrimitives.Table.ColumnHeaderCell>
                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                      Credits
                    </TablePrimitives.Table.ColumnHeaderCell>
                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                      Quantity
                    </TablePrimitives.Table.ColumnHeaderCell>
                    <TablePrimitives.Table.ColumnHeaderCell className="text-right font-normal">
                      Amount
                    </TablePrimitives.Table.ColumnHeaderCell>
                    <TablePrimitives.Table.ColumnHeaderCell className="font-normal">
                      Bought by
                    </TablePrimitives.Table.ColumnHeaderCell>
                  </TablePrimitives.Table.Row>
                </TablePrimitives.Table.Header>
                <TablePrimitives.Table.Body className="divide-y divide-neutral">
                  {credits.purchases.map((p) => (
                    <TablePrimitives.Table.Row key={p.id}>
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral">
                        {date(p.date)}
                      </TablePrimitives.Table.Cell>
                      <TablePrimitives.Table.Cell className="text-neutral">
                        <span className="whitespace-nowrap">{p.name}</span>
                        {p.invoice_id && (
                          <span className="block whitespace-nowrap text-sm text-neutral-subtle">
                            Invoice {p.invoice_id}
                          </span>
                        )}
                      </TablePrimitives.Table.Cell>
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                        {num(p.quantity)}
                      </TablePrimitives.Table.Cell>
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-right text-neutral">
                        {money(p.amount, p.currency || cur)}
                      </TablePrimitives.Table.Cell>
                      <TablePrimitives.Table.Cell className="whitespace-nowrap text-neutral-subtle">
                        {p.by}
                      </TablePrimitives.Table.Cell>
                    </TablePrimitives.Table.Row>
                  ))}
                </TablePrimitives.Table.Body>
              </TablePrimitives.Table.Root>
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
      </div>
    </section>
  )
}

function Header({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div>
        <p className="text-sm text-neutral-subtle">
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
      dismissible={!busy}
    >
      <div className="flex max-h-[80vh] flex-col text-sm">
        <div className="flex items-start gap-3 border-b border-neutral px-5 py-4">
          <div className="min-w-0 flex-1">
            <Dialog.Title asChild>
              <Heading level={2} className="break-words pr-8">
                {step === 'card' ? 'Add a payment method' : 'Buy prepaid credits'}
              </Heading>
            </Dialog.Title>
            <p className="mt-1 text-sm text-neutral-subtle">
              {step === 'card'
                ? 'Prepaid credits are paid by card when you buy them.'
                : 'Paid now with the card on file, used before any overage.'}
            </p>
          </div>
          <Button
            type="button"
            aria-label="Close"
            disabled={busy}
            iconOnly
            size="md"
            variant="plain"
            color="neutral"
            onClick={onClose}
          >
            <Icon iconName="xmark" iconStyle="solid" />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
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
                <CompactSelect
                  ariaLabel="Purchase period"
                  value={annual ? 'year' : 'pack'}
                  onChange={(v) => {
                    const a = v === 'year'
                    setAnnual(a)
                    setQty(String(a ? opt.annual!.min : opt.packs[0] ?? opt.min))
                  }}
                  options={[
                    { value: 'pack', label: 'A pack' },
                    { value: 'year', label: `A year upfront (${opt.annual.discount_pct}% off)` },
                  ]}
                />
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
                <p className="text-sm text-neutral-subtle">{q.tax_note}</p>
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
        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral px-5 py-4">
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
